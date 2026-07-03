import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Project, ActiveTab, EquipmentItem } from "./types";
import { defaultProjects } from "./defaultProjects";
import { translations } from "./translations";
import { validateImportedProject } from "./utils";
import { ProjectSettingsForm } from "./components/ProjectSettingsForm";
import { TechnicalForm } from "./components/TechnicalForm";
import { EquipmentSection } from "./components/EquipmentSection";
import { FinancialIncentivesForm } from "./components/FinancialIncentivesForm";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { PrintProposal } from "./components/PrintProposal";
import { 
  Settings, 
  Sun, 
  Server, 
  Gift, 
  TrendingUp, 
  Printer, 
  ArrowRight,
  Globe,
  Upload,
  Download,
  RotateCcw
} from "lucide-react";

export default function App() {
  // 1. Load projects from localStorage or default
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("sunsummary_projects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error("Failed to parse projects from localStorage", err);
      }
    }
    return defaultProjects;
  });

  // 2. Active project ID state
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || "proj-1";
  });

  // 3. Active tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("settings");

  // 4. Feedback notification state
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // 5. Custom confirm reset state
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // 6. File input ref for import JSON
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShowFeedback = (text: string, isError: boolean = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Sync projects with localStorage
  useEffect(() => {
    localStorage.setItem("sunsummary_projects", JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const t = translations[activeProject?.language || "en"];

  // Update handler for the current project
  const handleUpdateActiveProject = (updatedFields: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );
  };

  const executeNewAudit = () => {
    const newId = `proj-${Date.now()}`;
    const newProj: Project = {
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: "",
      clientName: "",
      country: "",
      language: activeProject?.language || "en",
      electricalStandard: "IEC",
      electricityTariff: "",
      vatRate: "",
      currencyName: activeProject?.language === "fr" ? "Euro" : "US Dollar",
      currencySymbol: activeProject?.language === "fr" ? "€" : "$",
      currencyCode: activeProject?.language === "fr" ? "EUR" : "USD",
      
      arrayCapacitykWp: "",
      peakSunHours: "",
      systemEfficiency: "",
      selfConsumptionRatio: "",
      feedInTariff: "",
      tariffInflationRate: "",

      incentivesEnabled: false,
      selfConsumptionPremium: "",
      govSubsidy: "",
      utilityRebate: "",
      taxCredit: "",
      carbonCredit: "",
      otherIncentiveLabel: "",
      otherIncentiveValue: "",

      equipment: [],
      laborRate: "",
      laborHours: "",
      useFlatLabor: false,
      flatLaborCost: ""
    };

    setProjects([newProj]);
    setActiveProjectId(newId);
    setActiveTab("settings");
    handleShowFeedback(activeProject?.language === "fr" ? "Audit réinitialisé à blanc !" : "Audit successfully reset to blank!", false);
  };

  // Clear and start a fresh solar audit configuration
  const handleNewAudit = () => {
    setShowConfirmReset(true);
  };

  // Export active project as JSON
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `SunSummary_${activeProject.name.replace(/\s+/g, "_")}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      handleShowFeedback(activeProject.language === "fr" ? "Projet exporté avec succès !" : "Project exported successfully!", false);
    } catch (err) {
      handleShowFeedback(activeProject.language === "fr" ? "Erreur lors de l'exportation." : "Failed to export project.", true);
    }
  };

  // Import project from JSON file
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!validateImportedProject(parsed)) {
          handleShowFeedback(activeProject.language === "fr" ? "Le format ou le schéma du fichier de configuration est invalide." : "Invalid configuration file format or schema.", true);
          return;
        }
        const newId = `proj-${Date.now()}`;
        const cleanProject: Project = {
          ...parsed,
          id: newId,
          createdAt: parsed.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects([cleanProject]);
        setActiveProjectId(newId);
        handleShowFeedback(activeProject.language === "fr" ? "Configuration importée avec succès !" : "Configuration imported successfully!", false);
      } catch (err) {
        handleShowFeedback(activeProject.language === "fr" ? "Erreur de lecture ou fichier JSON corrompu." : "Failed to read configuration file or corrupted JSON.", true);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Global Language Switch Quick Action
  const toggleGlobalLanguage = () => {
    const nextLang = activeProject.language === "en" ? "fr" : "en";
    handleUpdateActiveProject({ language: nextLang });
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8] text-black flex flex-col font-mono" id="app-container">
      
      {/* Hidden File Input for JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
        id="hidden-import-input"
      />

      {/* Neo-Brutalist Header Panel */}
      <header className="border-b-4 border-black bg-[#FFE21A] p-4 flex flex-col sm:flex-row gap-3 sm:gap-0 items-center justify-between sticky top-0 z-40 print:hidden" id="app-header">
        <div className="flex items-center gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="bg-black text-[#FFE21A] px-2.5 py-1.5 border-2 border-black font-mono font-black text-sm md:text-base lg:text-lg skew-x-[-10deg] tracking-tight uppercase leading-none select-none shadow-[2px_2px_0px_#FFE21A]">
              SunSummary
            </div>
            <div className="h-6 w-px bg-black opacity-25 hidden md:block"></div>
            <div className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider text-black">
              PROJECT: {(activeProject?.name || t.untitledProject).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* New Audit Reset Button */}
          <button
            onClick={handleNewAudit}
            className="px-2.5 py-1.5 bg-[#FF6B6B] text-black border-2 border-black font-black text-[10px] tracking-tight uppercase hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            id="btn-new-audit-header"
            title={activeProject.language === "fr" ? "Démarrer un nouvel audit (Réinitialiser)" : "Start a new solar audit (Reset all)"}
          >
            <RotateCcw size={12} className="animate-spin-hover" />
            <span>{activeProject.language === "fr" ? "NOUVEL AUDIT" : "NEW AUDIT"}</span>
          </button>

          {/* Import JSON Action Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-white border-2 border-black font-bold text-[10px] tracking-tight uppercase hover:bg-black hover:text-[#FFE21A] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            id="btn-import-header"
            title={activeProject.language === "fr" ? "Importer un projet JSON" : "Import Project JSON"}
          >
            <Upload size={12} />
            <span>{activeProject.language === "fr" ? "IMPORTER JSON" : "IMPORT JSON"}</span>
          </button>

          {/* Export JSON Action Button */}
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1.5 bg-white border-2 border-black font-bold text-[10px] tracking-tight uppercase hover:bg-black hover:text-[#FFE21A] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            id="btn-export-header"
            title={activeProject.language === "fr" ? "Exporter le projet au format JSON" : "Export Project as JSON"}
          >
            <Download size={12} />
            <span>{activeProject.language === "fr" ? "EXPORTER JSON" : "EXPORT JSON"}</span>
          </button>

          {/* Quick Multilingual Language Switcher Toggle */}
          <button
            onClick={toggleGlobalLanguage}
            className="px-2.5 py-1.5 bg-white border-2 border-black font-bold text-[10px] tracking-tight uppercase hover:bg-black hover:text-[#FFE21A] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            id="btn-language-toggle"
            title="Switch Language / Changer de langue"
          >
            <Globe size={11} />
            <span>{activeProject.language === "en" ? "FRANÇAIS" : "ENGLISH"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex relative" id="main-frame">
        
        {/* Main Contents Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6" id="workspace-content">
          
          {/* Navigation pipelines step-by-step UI */}
          <nav className="flex flex-wrap items-stretch border-2 border-black bg-white shadow-[4px_4px_0px_#000] print:hidden" id="navigation-step-bar">
            {[
              { id: "settings", label: t.tabSettingsShort, code: t.tabSettings, icon: <Settings size={14} /> },
              { id: "technical", label: t.tabTechnicalShort, code: t.tabTechnical, icon: <Sun size={14} /> },
              { id: "equipment", label: t.tabEquipmentShort, code: t.tabEquipment, icon: <Server size={14} /> },
              { id: "incentives", label: t.tabIncentivesShort, code: t.tabIncentives, icon: <Gift size={14} /> },
              { id: "dashboard", label: t.tabDashboardShort, code: t.tabDashboard, icon: <TrendingUp size={14} /> },
              { id: "proposal", label: t.tabProposalShort, code: t.tabProposal, icon: <Printer size={14} /> }
            ].map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 min-w-[120px] md:min-w-0 p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border-r-2 border-black last:border-r-0 ${
                    isSelected 
                      ? "bg-[#FFE21A] font-black text-black" 
                      : "bg-white text-zinc-600 hover:bg-zinc-100 hover:text-black"
                  }`}
                  id={`nav-btn-${tab.id}`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider">{tab.code}</div>
                  <div className="flex items-center gap-1 font-tech text-xs uppercase tracking-tight">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Active step quick descriptor */}
          <div className="border-2 border-dashed border-black bg-[#FFE21A]/10 p-3.5 print:hidden flex items-center justify-between gap-4 font-mono text-[11px] uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black rounded-none animate-ping"></span>
              <span className="font-bold text-black">
                {activeTab === "settings" && t.stepSettingsDesc}
                {activeTab === "technical" && t.stepTechnicalDesc}
                {activeTab === "equipment" && t.stepEquipmentDesc}
                {activeTab === "incentives" && t.stepIncentivesDesc}
                {activeTab === "dashboard" && t.stepDashboardDesc}
                {activeTab === "proposal" && t.stepProposalDesc}
              </span>
            </div>
            
            {/* Simple Next Step pipeline indicator */}
            <button
              onClick={() => {
                const tabs: ActiveTab[] = ["settings", "technical", "equipment", "incentives", "dashboard", "proposal"];
                const currIdx = tabs.indexOf(activeTab);
                if (currIdx < tabs.length - 1) {
                  setActiveTab(tabs[currIdx + 1]);
                } else {
                  setActiveTab("settings");
                }
              }}
              className="bg-black hover:bg-zinc-800 text-[#FFE21A] font-bold px-2.5 py-1 flex items-center gap-1 shrink-0 border border-black cursor-pointer rounded-none text-[10px]"
              id="btn-next-step-pipeline"
            >
              <span>NEXT STEP</span>
              <ArrowRight size={10} />
            </button>
          </div>

          {/* Tab Content Router */}
          <div className="flex-1" id="tab-router-viewport">
            {activeTab === "settings" && (
              <ProjectSettingsForm
                project={activeProject}
                onChange={handleUpdateActiveProject}
              />
            )}
            {activeTab === "technical" && (
              <TechnicalForm
                project={activeProject}
                onChange={handleUpdateActiveProject}
              />
            )}
            {activeTab === "equipment" && (
              <EquipmentSection
                project={activeProject}
                onChange={handleUpdateActiveProject}
              />
            )}
            {activeTab === "incentives" && (
              <FinancialIncentivesForm
                project={activeProject}
                onChange={handleUpdateActiveProject}
              />
            )}
            {activeTab === "dashboard" && (
              <FinancialDashboard
                project={activeProject}
              />
            )}
            {activeTab === "proposal" && (
              <PrintProposal
                project={activeProject}
              />
            )}
          </div>

          {/* Persistent screen footer with custom developer credits */}
          <footer className="mt-8 border-t-2 border-black pt-4 pb-2 text-center text-[10px] text-zinc-500 font-mono print:hidden">
            {t.credits}
          </footer>

        </main>
      </div>

      {/* Neo-Brutalist Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden" id="modal-confirm-reset">
          <div className="border-4 border-black bg-white p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_#000] flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-[#FF6B6B] border-b-2 border-black pb-2">
              <RotateCcw size={20} className="stroke-[3]" />
              <h3 className="font-tech text-base md:text-lg font-black uppercase text-black">
                {activeProject?.language === "fr" ? "RÉINITIALISER L'AUDIT" : "RESET AUDIT"}
              </h3>
            </div>
            
            <p className="font-mono text-xs md:text-sm text-zinc-700 leading-relaxed font-semibold">
              {t.confirmNewAudit}
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  executeNewAudit();
                  setShowConfirmReset(false);
                }}
                className="flex-1 py-2 px-3 bg-[#FF6B6B] text-black border-2 border-black font-black text-xs uppercase tracking-tight hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shadow-[3px_3px_0px_#000] rounded-none text-center font-mono"
                id="btn-confirm-reset-yes"
              >
                {activeProject?.language === "fr" ? "OUI, RÉINITIALISER" : "YES, RESET TO BLANK"}
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 px-3 bg-zinc-200 text-black border-2 border-black font-black text-xs uppercase tracking-tight hover:bg-zinc-300 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shadow-[3px_3px_0px_#000] rounded-none text-center font-mono"
                id="btn-confirm-reset-cancel"
              >
                {activeProject?.language === "fr" ? "ANNULER" : "CANCEL"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast Notification Overlay */}
      {feedback && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 border-2 border-black font-mono font-bold text-xs uppercase tracking-tight shadow-[3px_3px_0px_#000] transition-all animate-bounce ${
            feedback.isError ? "bg-red-500 text-white" : "bg-green-400 text-black"
          }`}
          id="feedback-toast"
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
