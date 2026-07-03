import React, { useState } from "react";
import { Project } from "../types";
import { translations } from "../translations";
import { calculateProjectMetrics, formatCurrency } from "../utils";
import { TrendingUp, Award, Calendar, DollarSign, Activity, ChevronRight, Zap } from "lucide-react";

interface FinancialDashboardProps {
  project: Project;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ project }) => {
  const t = translations[project.language];
  const metrics = calculateProjectMetrics(project);
  
  // Selected year for detailed projection view
  const [selectedYear, setSelectedYear] = useState<number>(Math.max(1, Math.min(25, Math.ceil(metrics.paybackPeriod === 99 ? 12 : metrics.paybackPeriod))));
  const [activeTooltipYear, setActiveTooltipYear] = useState<number | null>(null);

  // Math for custom SVG interactive graph
  const width = 800;
  const height = 300;
  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max and Min values for Y scale
  const cashflows = metrics.yearlyData.map((d) => d.cumulativeNetCashflow);
  const minCashflow = -metrics.netSystemCost;
  const maxCashflow = Math.max(1000, ...cashflows);

  // Y-Scale function
  const getY = (val: number) => {
    const range = maxCashflow - minCashflow;
    if (range === 0) return paddingTop + chartHeight / 2;
    // Calculate ratio from bottom
    const ratio = (val - minCashflow) / range;
    // Invert for SVG screen coordinates (0,0 is top left)
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // X-Scale function
  const getX = (year: number) => {
    // 25 years
    return paddingLeft + ((year - 1) / 24) * chartWidth;
  };

  // Generate SVG path points
  const points = metrics.yearlyData.map((d) => {
    return `${getX(d.year)},${getY(d.cumulativeNetCashflow)}`;
  });
  
  const pathData = points.length > 0 ? `M ${points.join(" L ")}` : "";

  // Generate area path data (shading below the curve down to the bottom)
  const areaPoints = [
    `${getX(1)},${getY(minCashflow)}`,
    ...points,
    `${getX(25)},${getY(minCashflow)}`
  ];
  const areaPathData = areaPoints.length > 0 ? `M ${areaPoints.join(" L ")} Z` : "";

  // Breakeven / Zero-line Y coordinate
  const zeroY = getY(0);

  // Feasibility styles
  const getFeasibilityStyles = (rating: typeof metrics.feasibilityRating) => {
    switch (rating) {
      case "excellent":
        return { bg: "bg-green-100", border: "border-green-600", text: "text-green-800", label: t.feasibilityExcellent };
      case "good":
        return { bg: "bg-blue-100", border: "border-blue-600", text: "text-blue-800", label: t.feasibilityGood };
      case "moderate":
        return { bg: "bg-yellow-100", border: "border-yellow-600", text: "text-yellow-800", label: t.feasibilityModerate };
      case "low":
        return { bg: "bg-red-100", border: "border-red-600", text: "text-red-800", label: t.feasibilityLow };
    }
  };

  const feasibility = getFeasibilityStyles(metrics.feasibilityRating);
  const activeYearData = metrics.yearlyData.find((d) => d.year === selectedYear) || metrics.yearlyData[0];

  return (
    <div className="flex flex-col gap-6" id="financial-analysis-dashboard">
      
      {/* Top Scannable Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" id="scannable-stats-grid">
        
        {/* Net System Cost */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-black rounded-none"></span>
              {t.netCost}
            </div>
            <div className="text-xl font-black text-black mt-2">
              {formatCurrency(metrics.netSystemCost, project.currencySymbol, project.currencyCode)}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 font-sans mt-3 border-t border-zinc-200 pt-1.5">
            {t.netCostDesc}
          </div>
        </div>

        {/* Year 1 Total Benefit */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-none"></span>
              {t.annualSavings}
            </div>
            <div className="text-xl font-black text-green-600 mt-2">
              {formatCurrency(metrics.year1TotalSavings, project.currencySymbol, project.currencyCode)}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 font-sans mt-3 border-t border-zinc-200 pt-1.5">
            {t.annualSavingsDesc}
          </div>
        </div>

        {/* Payback Period */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FFE21A] rounded-none"></span>
              {t.paybackPeriod}
            </div>
            <div className="text-xl font-black text-black mt-2">
              {metrics.paybackPeriod === 99 ? "No Payback" : `${metrics.paybackPeriod.toFixed(1)} years`}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 font-sans mt-3 border-t border-zinc-200 pt-1.5">
            {t.paybackPeriodDesc}
          </div>
        </div>

        {/* Lifetime Savings */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-zinc-900 rounded-none animate-pulse"></span>
              {t.lifetimeSavings}
            </div>
            <div className="text-xl font-black text-blue-600 mt-2">
              {formatCurrency(metrics.lifetimeCumulativeSavings, project.currencySymbol, project.currencyCode)}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 font-sans mt-3 border-t border-zinc-200 pt-1.5">
            {t.lifetimeSavingsDesc}
          </div>
        </div>

      </div>

      {/* Main Analysis Section: Interactive SVG Chart & Feasibility Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Projection Chart */}
        <div className="lg:col-span-2 border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black pb-2 gap-2">
            <div>
              <h3 className="font-tech text-sm font-black uppercase text-black flex items-center gap-2">
                <TrendingUp size={16} />
                {t.gridVsSolar}
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans">
                {t.gridVsSolarDesc}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-zinc-100 border border-black py-0.5 px-2 text-black self-start">
              {t.clickPointsAuditDetails}
            </span>
          </div>

          {/* SVG Canvas Container */}
          <div className="overflow-x-auto">
            <svg
              width={width}
              height={height}
              className="bg-zinc-50 border border-black select-none max-w-full font-mono mx-auto"
              style={{ minWidth: "700px" }}
              id="svg-amortization-chart"
            >
              {/* Background horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const val = minCashflow + ratio * (maxCashflow - minCashflow);
                const y = getY(val);
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#e4e4e7"
                      strokeWidth={1}
                      strokeDasharray="4,4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={9}
                      fill="#71717a"
                      className="font-bold"
                    >
                      {formatCurrency(val, project.currencySymbol, undefined, true)}
                    </text>
                  </g>
                );
              })}

              {/* Zero/Breakeven Line */}
              {zeroY >= paddingTop && zeroY <= height - paddingBottom && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={zeroY}
                    x2={width - paddingRight}
                    y2={zeroY}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="1,2"
                  />
                  <text
                    x={width - paddingRight - 10}
                    y={zeroY - 6}
                    textAnchor="end"
                    fontSize={8}
                    fill="#ef4444"
                    fontWeight="black"
                  >
                    {t.breakevenLine}
                  </text>
                </g>
              )}

              {/* Vertical Year Grid Lines */}
              {[1, 5, 10, 15, 20, 25].map((year) => {
                const x = getX(year);
                return (
                  <g key={year}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={height - paddingBottom}
                      stroke="#e4e4e7"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={height - paddingBottom + 14}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#27272a"
                      fontWeight="bold"
                    >
                      Y{year}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area under path */}
              <path
                d={areaPathData}
                fill="#fef08a"
                fillOpacity={0.15}
                stroke="none"
              />

              {/* Cumulative savings line path */}
              <path
                d={pathData}
                fill="none"
                stroke="#000000"
                strokeWidth={3}
              />

              {/* Payback period vertical marker */}
              {metrics.paybackPeriod > 0 && metrics.paybackPeriod <= 25 && (
                <g>
                  <line
                    x1={getX(metrics.paybackPeriod)}
                    y1={paddingTop}
                    x2={getX(metrics.paybackPeriod)}
                    y2={height - paddingBottom}
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <circle
                    cx={getX(metrics.paybackPeriod)}
                    cy={zeroY}
                    r={5}
                    fill="#16a34a"
                    stroke="#000"
                    strokeWidth={1.5}
                  />
                  <text
                    x={getX(metrics.paybackPeriod) + 6}
                    y={paddingTop + 14}
                    fontSize={8}
                    fill="#16a34a"
                    fontWeight="black"
                    className="bg-white"
                  >
                    {t.paybackPoint.toUpperCase()}: {metrics.paybackPeriod.toFixed(1)} YRS
                  </text>
                </g>
              )}

              {/* Interactive Data dots */}
              {metrics.yearlyData.map((d) => {
                const cx = getX(d.year);
                const cy = getY(d.cumulativeNetCashflow);
                const isSelected = selectedYear === d.year;
                const isPositive = d.cumulativeNetCashflow >= 0;

                return (
                  <g 
                    key={d.year} 
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedYear(d.year);
                      setActiveTooltipYear(d.year);
                    }}
                  >
                    {/* Invisible larger click/touch target (32px diameter) */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={16}
                      fill="transparent"
                      className="cursor-pointer"
                    />
                    {/* Visible interactive dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6.5 : 4.5}
                      fill={isSelected ? "#facc15" : isPositive ? "#22c55e" : "#ef4444"}
                      stroke="#000"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all duration-150 group-hover:scale-125"
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />
                  </g>
                );
              })}

              {/* Tooltip for Selected Year */}
              {(() => {
                if (activeTooltipYear === null) return null;
                const selectedData = metrics.yearlyData.find((d) => d.year === activeTooltipYear);
                if (!selectedData) return null;
                const cx = getX(activeTooltipYear);
                const cy = getY(selectedData.cumulativeNetCashflow);
                
                const showBelow = cy < 90;
                const tooltipY = showBelow ? cy + 12 : cy - 58;
                // Keep tooltip inside horizontal padding boundaries
                const tooltipX = Math.max(paddingLeft + 65, Math.min(width - paddingRight - 65, cx));
                
                return (
                  <g className="pointer-events-none transition-all duration-200">
                    {/* Little pointer triangle pointing to the circle */}
                    <polygon
                      points={
                        showBelow
                          ? `${cx},${cy + 6} ${cx - 5},${cy + 13} ${cx + 5},${cy + 13}`
                          : `${cx},${cy - 6} ${cx - 5},${cy - 13} ${cx + 5},${cy - 13}`
                      }
                      fill="#000000"
                      stroke="#000000"
                      strokeWidth={1}
                    />
                    {/* Tooltip Card Body */}
                    <rect
                      x={tooltipX - 75}
                      y={showBelow ? tooltipY + 1 : tooltipY}
                      width={150}
                      height={48}
                      fill="#000000"
                      stroke="#FFE21A"
                      strokeWidth={1.5}
                      rx={3}
                    />
                    {/* Year text */}
                    <text
                      x={tooltipX}
                      y={tooltipY + 13}
                      textAnchor="middle"
                      fontSize={8.5}
                      fontWeight="black"
                      fill="#FFE21A"
                    >
                      {t.year} {activeTooltipYear}
                    </text>
                    {/* Annual Net Gain */}
                    <text
                      x={tooltipX}
                      y={tooltipY + 25}
                      textAnchor="middle"
                      fontSize={8}
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {t.yearlyNetGain}: +{formatCurrency(selectedData.annualBenefit, project.currencySymbol, undefined, true)}
                    </text>
                    {/* Cumulative Balance */}
                    <text
                      x={tooltipX}
                      y={tooltipY + 37}
                      textAnchor="middle"
                      fontSize={8}
                      fontWeight="bold"
                      fill={selectedData.cumulativeNetCashflow >= 0 ? "#4ade80" : "#f87171"}
                    >
                      BAL: {formatCurrency(selectedData.cumulativeNetCashflow, project.currencySymbol, undefined, true)}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Diagnosis & Detailed Audit Sheet */}
        <div className="flex flex-col gap-6">
          
          {/* Diagnostic Box */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2">
              <Award size={18} className="text-black" />
              <h3 className="font-tech text-base font-black uppercase text-black">
                {t.projectFeasibility}
              </h3>
            </div>

            <div className={`border-2 border-black p-3 text-center ${feasibility.bg} ${feasibility.border} ${feasibility.text}`}>
              <span className="font-tech text-lg font-black tracking-wider uppercase block">
                {feasibility.label}
              </span>
              <span className="font-mono text-[10px] uppercase font-bold mt-1 block">
                PAYBACK INDEX: {metrics.paybackPeriod === 99 ? ">25 YRS" : `${metrics.paybackPeriod.toFixed(1)} YRS`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="border border-black bg-zinc-50 p-2 text-center" title={t.roi25Desc}>
                <div className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase leading-tight min-h-[24px] flex items-center justify-center">{t.roi25}</div>
                <div className="text-sm font-black text-black mt-1">
                  {metrics.internalRateOfReturnPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="border border-black bg-zinc-50 p-2 text-center" title={t.equityMultipleDesc}>
                <div className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase leading-tight min-h-[24px] flex items-center justify-center">{t.equityMultiple}</div>
                <div className="text-sm font-black text-black mt-1">
                  {metrics.equityMultiple.toFixed(1)}x
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal font-sans text-center mt-1">
              {t.feasibilityHelp}
            </p>
          </div>

          {/* Selected Year Detailed Audit Stats */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <h3 className="font-tech text-base font-black uppercase text-black">
                  {t.yearDetailedAudit.replace("{year}", selectedYear.toString())}
                </h3>
              </div>
              {/* Year Scroller */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const nextY = Math.max(1, selectedYear - 1);
                    setSelectedYear(nextY);
                    if (activeTooltipYear !== null) setActiveTooltipYear(nextY);
                  }}
                  disabled={selectedYear === 1}
                  className="px-1.5 py-0.5 border border-black hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold cursor-pointer rounded-none"
                >
                  &lt;
                </button>
                <button
                  onClick={() => {
                    const nextY = Math.min(25, selectedYear + 1);
                    setSelectedYear(nextY);
                    if (activeTooltipYear !== null) setActiveTooltipYear(nextY);
                  }}
                  disabled={selectedYear === 25}
                  className="px-1.5 py-0.5 border border-black hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold cursor-pointer rounded-none"
                >
                  &gt;
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              
              <div className="flex justify-between py-1 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-medium">{t.solarGeneration}:</span>
                <span className="font-bold text-black">{Math.round(activeYearData.production).toLocaleString()} kWh</span>
              </div>

              <div className="flex justify-between py-1 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-medium">{t.electricityTariffLabel}:</span>
                <span className="font-bold text-black">{formatCurrency(activeYearData.electricityTariff, project.currencySymbol, undefined)}/kWh</span>
              </div>

              <div className="flex justify-between py-1 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-medium">{t.onSiteSavingsGrid}:</span>
                <span className="font-bold text-green-600">+{formatCurrency(activeYearData.gridSavings, project.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-medium">{t.surplusExportEarnings}:</span>
                <span className="font-bold text-blue-600">+{formatCurrency(activeYearData.exportEarnings, project.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-dashed border-zinc-200 bg-zinc-50 p-1 font-bold">
                <span className="text-black">{t.yearlyNetGain}:</span>
                <span className="text-green-700 font-black">{formatCurrency(activeYearData.annualBenefit, project.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-black p-1 font-bold mt-1">
                <span className="text-black uppercase">{t.cumulativeSavingsLabel}:</span>
                <span className="text-zinc-900 font-black">{formatCurrency(activeYearData.cumulativeBenefit, project.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1.5 p-1 font-black text-sm bg-black text-[#FFE21A] border border-black">
                <span className="uppercase text-[11px]">{t.cumulativeNetBalance}:</span>
                <span>{formatCurrency(activeYearData.cumulativeNetCashflow, project.currencySymbol)}</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Grid vs Solar 25-Year Ledger Data Table */}
      <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-2">
          <Activity size={18} />
          <h3 className="font-tech text-base font-black uppercase text-black">
            {t.financialLedger25Yr}
          </h3>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left font-mono text-[10px] border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-zinc-100 border-b-2 border-black">
                <th className="p-2 border-r border-black font-bold text-black uppercase">{t.year}</th>
                <th className="p-2 border-r border-black font-bold text-black uppercase text-right">{t.estHarvestedAnnual}</th>
                <th className="p-2 border-r border-black font-bold text-black uppercase text-right">{t.electricityTariffLabel} ({project.currencySymbol})</th>
                <th className="p-2 border-r border-black font-bold text-black uppercase text-right">{t.onSiteSavingsGrid}</th>
                <th className="p-2 border-r border-black font-bold text-black uppercase text-right">{t.surplusExportEarnings}</th>
                <th className="p-2 border-r border-black font-bold text-black uppercase text-right">{t.yearlyNetGain}</th>
                <th className="p-2 font-bold text-black uppercase text-right">{t.cumulativeNetBalance}</th>
              </tr>
            </thead>
            <tbody>
              {metrics.yearlyData.map((d) => {
                const isSelected = d.year === selectedYear;
                return (
                  <tr
                    key={d.year}
                    onClick={() => setSelectedYear(d.year)}
                    className={`border-b border-zinc-200 hover:bg-zinc-100 cursor-pointer ${
                      isSelected ? "bg-[#FFE21A]/20 font-bold border-l-4 border-l-black" : ""
                    }`}
                  >
                    <td className="p-2 border-r border-black font-bold text-center">{d.year}</td>
                    <td className="p-2 border-r border-black text-right">{Math.round(d.production).toLocaleString()}</td>
                    <td className="p-2 border-r border-black text-right">{formatCurrency(d.electricityTariff, project.currencySymbol)}</td>
                    <td className="p-2 border-r border-black text-right text-green-600">+{formatCurrency(d.gridSavings, project.currencySymbol)}</td>
                    <td className="p-2 border-r border-black text-right text-blue-600">+{formatCurrency(d.exportEarnings, project.currencySymbol)}</td>
                    <td className="p-2 border-r border-black text-right font-bold text-green-700">{formatCurrency(d.annualBenefit, project.currencySymbol)}</td>
                    <td className={`p-2 text-right font-black ${d.cumulativeNetCashflow >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {formatCurrency(d.cumulativeNetCashflow, project.currencySymbol)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
