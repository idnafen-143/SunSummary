import React, { useState } from "react";
import { Project } from "../types";
import { translations } from "../translations";
import { calculateProjectMetrics, formatCurrency } from "../utils";
import { Printer, Calendar, ShieldCheck, Download, AlertCircle, Loader2 } from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface PrintProposalProps {
  project: Project;
}

function findOklchOccurrences(text: string): string[] {
  const matches: string[] = [];
  let index = 0;
  while (true) {
    const start = text.indexOf("oklch(", index);
    if (start === -1) break;
    
    // Parse until matched parenthesis
    let parenCount = 1;
    let current = start + 6; // length of "oklch("
    while (current < text.length && parenCount > 0) {
      if (text[current] === "(") parenCount++;
      else if (text[current] === ")") parenCount--;
      current++;
    }
    
    if (parenCount === 0) {
      const match = text.substring(start, current);
      matches.push(match);
      index = current;
    } else {
      index = start + 6;
    }
  }
  return matches;
}

function oklchToRgba(L: number, C: number, H: number, alpha: number = 1): string {
  // Convert hue to radians
  const hRad = (H * Math.PI) / 180;
  const ok_a = C * Math.cos(hRad);
  const ok_b = C * Math.sin(hRad);

  // Convert to LMS prime
  const l_prime = L + 0.3963377774 * ok_a + 0.2158037573 * ok_b;
  const m_prime = L - 0.1055613458 * ok_a - 0.0638541728 * ok_b;
  const s_prime = L - 0.0894841775 * ok_a - 1.291485548 * ok_b;

  // Cube for LMS
  const l = Math.pow(Math.max(0, l_prime), 3);
  const m = Math.pow(Math.max(0, m_prime), 3);
  const s = Math.pow(Math.max(0, s_prime), 3);

  // LMS to linear sRGB
  const r_linear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g_linear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_linear = -0.0041960863 * l - 0.7034186147 * m + 1.70762862 * s;

  // Gamma correction to sRGB
  const compand = (c_lin: number) => {
    if (c_lin <= 0.0031308) {
      return 12.92 * c_lin;
    } else {
      return 1.055 * Math.pow(c_lin, 1 / 2.4) - 0.055;
    }
  };

  const r = Math.round(Math.max(0, Math.min(1, compand(r_linear))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, compand(g_linear))) * 255);
  const b = Math.round(Math.max(0, Math.min(1, compand(b_linear))) * 255);

  if (alpha === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

function oklchStringToRgb(oklchStr: string): string {
  // Normalize whitespaces and lowercase
  const str = oklchStr.trim().toLowerCase().replace(/\s+/g, " ");
  if (!str.startsWith("oklch(") || !str.endsWith(")")) return "transparent";

  const inner = str.substring(6, str.length - 1).trim();
  const parts = inner.split("/");
  const colorParts = parts[0].trim().split(" ");
  if (colorParts.length < 3) return "transparent";

  const lVal = colorParts[0];
  const cVal = colorParts[1];
  const hVal = colorParts[2];

  let l = parseFloat(lVal);
  if (lVal.includes("%")) l /= 100;
  if (isNaN(l)) l = 0;

  let c = parseFloat(cVal);
  if (cVal.includes("%")) c /= 100;
  if (isNaN(c)) c = 0;

  let h = parseFloat(hVal);
  if (hVal.includes("rad")) {
    h = h * (180 / Math.PI);
  } else if (hVal.includes("turn")) {
    h = h * 360;
  }
  if (isNaN(h)) h = 0;

  // Handle opacity (A)
  let a = 1;
  if (parts.length > 1) {
    const aStr = parts[1].trim();
    if (aStr.startsWith("var(")) {
      // e.g. var(--tw-bg-opacity, 1)
      const fallbackMatch = aStr.match(/,\s*([0-9.%]+)\s*\)/);
      if (fallbackMatch) {
        const val = fallbackMatch[1];
        a = parseFloat(val);
        if (val.includes("%")) a /= 100;
      } else {
        a = 1;
      }
    } else {
      a = parseFloat(aStr);
      if (aStr.includes("%")) a /= 100;
    }
  }
  if (isNaN(a)) a = 1;

  return oklchToRgba(l, c, h, a);
}

function convertOklchToRgb(cssText: string): string {
  const occurrences = findOklchOccurrences(cssText);
  if (occurrences.length === 0) return cssText;

  let result = cssText;
  const uniqueOccurrences = Array.from(new Set(occurrences));
  
  // Sort descending by length to replace longer strings first
  uniqueOccurrences.sort((a, b) => b.length - a.length);

  for (const match of uniqueOccurrences) {
    try {
      const resolved = oklchStringToRgb(match);
      if (resolved) {
        result = result.split(match).join(resolved);
      }
    } catch (e) {
      console.warn("Failed to convert oklch color:", match, e);
    }
  }

  return result;
}

function prepareStylesheets() {
  const stylesToRestore: Array<
    | { type: "style"; element: HTMLStyleElement; originalText: string }
    | { type: "link"; element: HTMLLinkElement; tempElement: HTMLStyleElement }
    | { type: "sheet"; element: CSSStyleSheet; tempElement: HTMLStyleElement }
  > = [];

  // 1. Process style tags (completely synchronous, CORS safe)
  const styleElements = Array.from(document.querySelectorAll("style"));
  for (const el of styleElements) {
    if (el.getAttribute("data-temp-pdf-style")) continue;
    try {
      const originalText = el.innerHTML;
      if (originalText.includes("oklch")) {
        const converted = convertOklchToRgb(originalText);
        stylesToRestore.push({ type: "style", element: el, originalText });
        el.innerHTML = converted;
      }
    } catch (e) {
      console.warn("Could not preprocess style tag innerHTML:", el, e);
    }
  }

  return {
    processLinks: async () => {
      // 2. Process link tags
      const linkElements = Array.from(document.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
      for (const el of linkElements) {
        try {
          if (el.disabled) continue;
          const href = el.href;
          if (href) {
            const response = await fetch(href);
            if (response.ok) {
              const text = await response.text();
              if (text.includes("oklch")) {
                const converted = convertOklchToRgb(text);
                const tempStyle = document.createElement("style");
                tempStyle.innerHTML = converted;
                tempStyle.setAttribute("data-temp-pdf-style", "true");
                document.head.appendChild(tempStyle);
                
                el.disabled = true;
                stylesToRestore.push({ type: "link", element: el, tempElement: tempStyle });
              }
            }
          }
        } catch (err) {
          console.warn("Could not preprocess external stylesheet link:", el, err);
        }
      }

      // 3. Process constructed/other style sheets
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        if (sheet.disabled) continue;
        // Skip sheets backed by DOM nodes that we already handled
        if (sheet.ownerNode && (sheet.ownerNode.nodeName === "STYLE" || sheet.ownerNode.nodeName === "LINK")) {
          continue;
        }
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules);
          const cssText = rules.map(rule => rule.cssText).join("\n");
          if (cssText.includes("oklch")) {
            const converted = convertOklchToRgb(cssText);
            const tempStyle = document.createElement("style");
            tempStyle.innerHTML = converted;
            tempStyle.setAttribute("data-temp-pdf-style", "true");
            document.head.appendChild(tempStyle);
            
            sheet.disabled = true;
            stylesToRestore.push({ type: "sheet", element: sheet, tempElement: tempStyle });
          }
        } catch (e) {
          console.warn("Could not preprocess constructed stylesheet rules:", e);
        }
      }
    },
    restore: () => {
      // Restore in reverse order
      for (const item of stylesToRestore) {
        if (item.type === "style") {
          item.element.innerHTML = item.originalText;
        } else if (item.type === "link") {
          item.element.disabled = false;
          item.tempElement.remove();
        } else if (item.type === "sheet") {
          item.element.disabled = false;
          item.tempElement.remove();
        }
      }
    }
  };
}

function prepareInlineStyles(root: HTMLElement) {
  const restoredStyles: Array<{ element: HTMLElement; originalStyle: string | null }> = [];
  const elements = [root, ...Array.from(root.querySelectorAll("*"))] as HTMLElement[];
  
  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue;
    const styleAttr = el.getAttribute("style");
    if (styleAttr && styleAttr.includes("oklch")) {
      restoredStyles.push({ element: el, originalStyle: styleAttr });
      el.setAttribute("style", convertOklchToRgb(styleAttr));
    }
  }
  
  return {
    restore: () => {
      for (const item of restoredStyles) {
        if (item.originalStyle === null) {
          item.element.removeAttribute("style");
        } else {
          item.element.setAttribute("style", item.originalStyle);
        }
      }
    }
  };
}

export const PrintProposal: React.FC<PrintProposalProps> = ({ project }) => {
  const t = translations[project.language];
  const metrics = calculateProjectMetrics(project);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = async () => {
    const element = document.getElementById("printable-scoping-document");
    if (!element) return;

    setIsGeneratingPdf(true);
    let stylesheetCleaner: { processLinks: () => Promise<void>; restore: () => void } | null = null;
    let inlineStyleCleaner: { restore: () => void } | null = null;

    try {
      // 1. Prepare and convert all stylesheets
      stylesheetCleaner = prepareStylesheets();
      await stylesheetCleaner.processLinks();

      // 2. Prepare and convert any inline styles
      inlineStyleCleaner = prepareInlineStyles(element);

      // 3. Configure html2pdf options
      const opt = {
        margin:       0.4, // 0.4 in padding around A4/Letter
        filename:     `Solar_Proposal_${(project.name || "Project").replace(/\s+/g, "_")}.pdf`,
        image:        { type: "jpeg" as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: "in", format: "letter", orientation: "portrait" as const },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      // 4. Generate and save PDF
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF download failed, falling back to window.print", err);
      alert(
        project.language === "fr"
          ? "La génération du PDF a rencontré un problème (ou est bloquée par la prévisualisation sécurisée).\n\nPour de meilleurs résultats, veuillez ouvrir l'application dans un nouvel onglet avec le bouton en haut à droite pour télécharger directement le PDF, ou utilisez l'impression standard."
          : "PDF generation failed or was blocked by preview restrictions.\n\nFor the best experience, please open this app in a new tab (using the button in the top-right corner) to download the PDF directly, or use the standard browser print option."
      );
      window.print();
    } finally {
      // 5. Restore original stylesheets and inline styles
      if (stylesheetCleaner) {
        stylesheetCleaner.restore();
      }
      if (inlineStyleCleaner) {
        inlineStyleCleaner.restore();
      }
      setIsGeneratingPdf(false);
    }
  };

  const todayStr = new Date().toLocaleDateString(project.language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="flex flex-col gap-6" id="proposal-print-view">
      
      {/* Upper Utility Action Bar (Hidden during actual printing) */}
      <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-yellow-600 shrink-0" />
          <p className="text-zinc-600 text-xs font-sans leading-relaxed">
            {project.language === "fr" 
              ? "Cliquez ci-dessous pour compiler instantanément le dossier d'ingénierie complet au format PDF."
              : "Click below to instantly compile the entire technical engineering proposal into a standalone PDF."
            }
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={isGeneratingPdf}
          className="neo-btn-primary bg-[#FFE21A] hover:bg-[#FFE21A]/80 disabled:bg-zinc-300 disabled:text-zinc-500 py-2.5 px-5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider text-black font-mono shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-[3px_3px_0px_#000] border-2 border-black active:translate-x-0.5 active:translate-y-0.5 rounded-none"
          id="btn-trigger-print"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>{project.language === "fr" ? "COMPILATION PDF..." : "COMPILING PDF..."}</span>
            </>
          ) : (
            <>
              <Download size={15} />
              <span>{t.printProposal}</span>
            </>
          )}
        </button>
      </div>

      {/* The Printable Document Sheet */}
      <div
        className="border-2 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_#000] print:border-0 print:shadow-none print:p-0 block space-y-8 font-mono text-xs text-black max-w-4xl mx-auto w-full"
        id="printable-scoping-document"
      >
        
        {/* Document Header */}
        <div className="border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-tech text-xl font-black uppercase text-black tracking-tighter">
              <span className="w-4 h-4 bg-[#FFE21A] border border-black inline-block"></span>
              {t.appName.toUpperCase()}
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              {t.tagline}
            </p>
          </div>

          <div className="text-right flex flex-col items-end gap-1 font-mono text-[10px]">
            <div className="bg-black text-[#FFE21A] font-black px-2 py-0.5 border border-black">
              {t.engineeringProposal.toUpperCase()}
            </div>
            <div className="text-zinc-500 font-bold mt-1">
              {t.generatedOn}: {todayStr}
            </div>
            <div className="text-zinc-500 font-bold">
              REF: SS-{project.id.toUpperCase()}-{new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Dual Meta Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-black pb-6">
          <div className="flex flex-col gap-2">
            <h4 className="font-tech text-[11px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-1">
              {t.preparedFor.toUpperCase()}
            </h4>
            <div className="text-sm font-black text-black uppercase">{project.clientName || "—"}</div>
            <div className="text-zinc-600">{t.locationLabel}: <span className="font-bold text-black">{project.country || "—"}</span></div>
            <div className="text-zinc-600">{t.electricalStandardLabel}: <span className="font-bold text-black">{project.electricalStandard} ELECTRICAL</span></div>
          </div>

          <div className="flex flex-col gap-2 md:text-right md:items-end">
            <h4 className="font-tech text-[11px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-1 w-full">
              {t.preparedBy.toUpperCase()}
            </h4>
            <div className="text-sm font-black text-black uppercase">SunSummary Engine</div>
            <div className="text-zinc-600">Operator: <span className="font-bold text-black">{t.leadArchitect}</span></div>
            <div className="text-zinc-600">{t.currencyUnitLabel}: <span className="font-bold text-black">{project.currencyName} ({project.currencySymbol} / {project.currencyCode})</span></div>
          </div>
        </div>

        {/* Project Core Specifications Block */}
        <div className="flex flex-col gap-3 avoid-break">
          <h3 className="font-tech text-sm font-black uppercase text-black border-l-4 border-black pl-2 tracking-wider">
            {t.projectSpecifications}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-black p-3 bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.arrayCapacityLabel}</div>
              <div className="text-sm font-black text-black mt-1">{project.arrayCapacitykWp} kWp DC</div>
            </div>
            <div className="border border-black p-3 bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.peakSunHoursLabel}</div>
              <div className="text-sm font-black text-black mt-1">{project.peakSunHours} kWh/m²/day</div>
            </div>
            <div className="border border-black p-3 bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.performanceRatioLabel}</div>
              <div className="text-sm font-black text-black mt-1">{project.systemEfficiency}% PR</div>
            </div>
            <div className="border border-black p-3 bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.estHarvestYr1Label}</div>
              <div className="text-sm font-black text-black mt-1">{Math.round(metrics.annualProductionkWh).toLocaleString()} kWh</div>
            </div>
          </div>
        </div>

        {/* Quotation & Equipment Table */}
        <div className="flex flex-col gap-3">
          <h3 className="font-tech text-sm font-black uppercase text-black border-l-4 border-black pl-2 tracking-wider">
            {t.financialBreakdown}
          </h3>
          <div className="border border-black overflow-hidden">
            <table className="w-full text-left font-mono text-[10px] border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-black avoid-break">
                  <th className="p-2 border-r border-black font-bold text-black uppercase w-[55%]">{t.colItem}</th>
                  <th className="p-2 border-r border-black font-bold text-black uppercase text-center w-[10%]">{t.colQty}</th>
                  <th className="p-2 border-r border-black font-bold text-black uppercase text-right w-[15%]">{t.colUnit}</th>
                  <th className="p-2 font-bold text-black uppercase text-right w-[20%]">{t.colTotal}</th>
                </tr>
              </thead>
              <tbody>
                {/* Equipment items */}
                {project.equipment.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-200 avoid-break">
                    <td className="p-2 border-r border-black font-bold text-black uppercase">
                      {item.name}
                      <div className="text-[9px] text-zinc-500 font-sans font-normal lowercase italic mt-0.5">
                        {item.specification}
                      </div>
                    </td>
                    <td className="p-2 border-r border-black text-center">{item.quantity}</td>
                    <td className="p-2 border-r border-black text-right">{formatCurrency(item.unitCost, project.currencySymbol)}</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(item.quantity * item.unitCost, project.currencySymbol)}</td>
                  </tr>
                ))}

                {/* Construction Labor Row */}
                <tr className="border-b border-black bg-zinc-50 avoid-break">
                  <td className="p-2 border-r border-black font-bold text-black uppercase">
                    {t.solarConstructionLaborDesc}
                    <div className="text-[9px] text-zinc-500 font-sans font-normal lowercase italic mt-0.5">
                      {project.useFlatLabor 
                        ? t.billedAsFlatFee 
                        : t.billedHourly
                            .replace("{hours}", project.laborHours.toString())
                            .replace("{rate}", project.laborRate.toString())
                            .replace("{symbol}", project.currencySymbol)
                      }
                    </div>
                  </td>
                  <td className="p-2 border-r border-black text-center">1</td>
                  <td className="p-2 border-r border-black text-right">{formatCurrency(metrics.laborSubtotal, project.currencySymbol)}</td>
                  <td className="p-2 text-right font-bold">{formatCurrency(metrics.laborSubtotal, project.currencySymbol)}</td>
                </tr>

                {/* Hardware Subtotal */}
                <tr className="border-b border-zinc-200 avoid-break">
                  <td colSpan={3} className="p-2 border-r border-black text-right font-bold text-zinc-500 uppercase">{t.totalHardware}:</td>
                  <td className="p-2 text-right font-bold text-zinc-600">{formatCurrency(metrics.hardwareSubtotal, project.currencySymbol)}</td>
                </tr>

                {/* Labor Subtotal */}
                <tr className="border-b border-zinc-200 avoid-break">
                  <td colSpan={3} className="p-2 border-r border-black text-right font-bold text-zinc-500 uppercase">{t.totalLabor}:</td>
                  <td className="p-2 text-right font-bold text-zinc-600">{formatCurrency(metrics.laborSubtotal, project.currencySymbol)}</td>
                </tr>

                {/* Subtotal HT */}
                <tr className="border-b border-zinc-200 font-bold bg-zinc-50 avoid-break">
                  <td colSpan={3} className="p-2 border-r border-black text-right uppercase">SUBTOTAL (HT):</td>
                  <td className="p-2 text-right">{formatCurrency(metrics.subtotalBeforeTax, project.currencySymbol)}</td>
                </tr>

                {/* VAT Tax */}
                <tr className="border-b border-black avoid-break">
                  <td colSpan={3} className="p-2 border-r border-black text-right font-bold text-zinc-500 uppercase">VAT / Tax ({project.vatRate}%):</td>
                  <td className="p-2 text-right font-bold text-zinc-600">{formatCurrency(metrics.vatAmount, project.currencySymbol)}</td>
                </tr>

                {/* Gross cost (TTC) */}
                <tr className="bg-black text-[#FFE21A] font-black text-sm avoid-break">
                  <td colSpan={3} className="p-2 border-r border-black text-right uppercase tracking-wider">{t.grossCost.toUpperCase()}:</td>
                  <td className="p-2 text-right">{formatCurrency(metrics.grossSystemCost, project.currencySymbol)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Incentives & Support Block (Only if Enabled) */}
        {project.incentivesEnabled && (
          <div className="flex flex-col gap-3 avoid-break">
            <h3 className="font-tech text-sm font-black uppercase text-black border-l-4 border-black pl-2 tracking-wider">
              {t.incentivesSummary}
            </h3>
            <div className="border border-black bg-zinc-50 p-4 flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.selfConsumptionPremium > 0 && (
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span className="text-zinc-600">{t.selfConsumptionPremium}:</span>
                    <span className="font-bold text-green-700">-{formatCurrency(project.selfConsumptionPremium * project.arrayCapacitykWp, project.currencySymbol)}</span>
                  </div>
                )}
                {project.govSubsidy > 0 && (
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span className="text-zinc-600">{t.govSubsidy}:</span>
                    <span className="font-bold text-green-700">-{formatCurrency(project.govSubsidy, project.currencySymbol)}</span>
                  </div>
                )}
                {project.utilityRebate > 0 && (
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span className="text-zinc-600">{t.utilityRebate}:</span>
                    <span className="font-bold text-green-700">-{formatCurrency(project.utilityRebate, project.currencySymbol)}</span>
                  </div>
                )}
                {project.taxCredit > 0 && (
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span className="text-zinc-600">{t.taxCredit}:</span>
                    <span className="font-bold text-green-700">-{formatCurrency(project.taxCredit, project.currencySymbol)}</span>
                  </div>
                )}
                {project.carbonCredit > 0 && (
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span className="text-zinc-600">{t.carbonCredit}:</span>
                    <span className="font-bold text-green-700">-{formatCurrency(project.carbonCredit, project.currencySymbol)}</span>
                  </div>
                )}
                {project.otherIncentiveValue > 0 && (
                  <div className="flex justify-between border-b border-zinc-200 pb-1">
                    <span className="text-zinc-600">{project.otherIncentiveLabel || t.otherIncentive}:</span>
                    <span className="font-bold text-green-700">-{formatCurrency(project.otherIncentiveValue, project.currencySymbol)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t border-black pt-2 mt-1 font-black text-black">
                <span className="uppercase">{t.totalIncentives}:</span>
                <span className="text-green-700">-{formatCurrency(metrics.totalIncentives, project.currencySymbol)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-black border-t-2 border-black pt-2 mt-1 bg-[#FFE21A]/20 p-2 border border-black">
                <span className="uppercase">{t.netCost.toUpperCase()}:</span>
                <span>{formatCurrency(metrics.netSystemCost, project.currencySymbol, project.currencyCode)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Financial returns table block */}
        <div className="flex flex-col gap-3 avoid-break">
          <h3 className="font-tech text-sm font-black uppercase text-black border-l-4 border-black pl-2 tracking-wider">
            {t.investmentReturns}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-black p-4 text-center bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.paybackPeriod}</div>
              <div className="text-base font-black text-black mt-1">
                {metrics.paybackPeriod === 99 ? "N/A" : `${metrics.paybackPeriod.toFixed(1)} YEARS`}
              </div>
            </div>
            <div className="border border-black p-4 text-center bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.roi25}</div>
              <div className="text-base font-black text-black mt-1">
                {metrics.internalRateOfReturnPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="border border-black p-4 text-center bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.equityMultiple}</div>
              <div className="text-base font-black text-black mt-1">
                {metrics.equityMultiple.toFixed(1)}x
              </div>
            </div>
            <div className="border border-black p-4 text-center bg-zinc-50">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">{t.cumulative25YrNetBenefit}</div>
              <div className="text-base font-black text-green-700 mt-1">
                {formatCurrency(metrics.lifetimeCumulativeSavings, project.currencySymbol, project.currencyCode)}
              </div>
            </div>
          </div>
        </div>

        {/* Terms, Conditions & Note */}
        <div className="border-2 border-black bg-zinc-50 p-4 flex flex-col gap-2 avoid-break">
          <h4 className="font-tech text-[10px] font-black uppercase text-black flex items-center gap-1.5">
            <ShieldCheck size={14} />
            {t.technicalNotes.toUpperCase()}
          </h4>
          <p className="text-[9px] text-zinc-500 font-sans leading-relaxed">
            {t.technicalNotesDesc}
          </p>
        </div>

        {/* Signature Authorization Block */}
        <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-12 mt-4 avoid-break">
          <div className="flex flex-col gap-12">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.representative.toUpperCase()}</div>
            <div className="flex flex-col gap-1">
              <div className="border-b border-black w-48"></div>
              <span className="text-[9px] text-zinc-400 mt-1">SunSummary Scoping Engineer</span>
            </div>
          </div>

          <div className="flex flex-col gap-12 items-end text-right">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.clientRepresentative.toUpperCase()}</div>
            <div className="flex flex-col gap-1 items-end">
              <div className="border-b border-black w-48"></div>
              <span className="text-[9px] text-zinc-400 mt-1">{project.clientName} Authorizer</span>
            </div>
          </div>
        </div>

        {/* Footnotes & Author Credits */}
        <div className="text-center font-mono text-[9px] text-zinc-500 border-t border-dashed border-zinc-300 pt-6 mt-4">
          {t.credits}
        </div>

      </div>
    </div>
  );
};
