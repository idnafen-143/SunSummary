import React, { useRef, useState } from "react";
import { Project } from "../types";
import { FileDown, FileUp, Plus, Trash2, Copy, AlertTriangle, Check, UploadCloud } from "lucide-react";
import { formatCurrency } from "../utils";
import { translations } from "../translations";

interface ProjectListProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onCloneProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onImportProject: (projectData: any) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onCloneProject,
  onDeleteProject,
  onImportProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error: boolean } | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const t = translations[activeProject?.language || "en"];

  const handleExport = (project: Project) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `SunSummary_${project.name.replace(/\s+/g, "_")}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedback(t.exportProject + " OK", false);
    } catch (err) {
      showFeedback(t.importError, true);
    }
  };

  const showFeedback = (text: string, error: boolean) => {
    setFeedbackMsg({ text, error });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const parseAndImport = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.name || typeof parsed.language !== "string") {
        showFeedback(t.importError, true);
        return;
      }
      onImportProject(parsed);
      showFeedback(t.importSuccess, false);
    } catch (err) {
      showFeedback(t.importError, true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        parseAndImport(event.target.result as string);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        parseAndImport(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 font-mono text-xs border-r-2 border-black" id="project-list-sidebar">
      {/* Sidebar Header */}
      <div className="p-4 bg-zinc-100 border-b-2 border-black flex flex-col gap-2">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-1.5 text-sm font-black tracking-tight text-black uppercase">
            <span className="w-2.5 h-2.5 bg-yellow-400 border border-black inline-block"></span>
            PROJECTS
          </div>
          <span className="bg-black text-yellow-400 font-bold px-1.5 py-0.5 border border-black text-[10px]">
            {projects.length} SAVED
          </span>
        </div>
        
        <button
          onClick={onNewProject}
          className="w-full neo-btn-primary py-2 px-3 flex items-center justify-center gap-1.5 font-bold uppercase tracking-tight text-xs bg-yellow-400 hover:bg-yellow-300"
          id="btn-new-project"
        >
          <Plus size={14} className="stroke-[3]" />
          {t.newProject}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const projT = translations[proj.language];
          
          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`p-3 transition-all cursor-pointer border-2 border-black flex flex-col gap-2 rounded-none select-none ${
                isActive
                  ? "bg-white shadow-[4px_4px_0px_#000] -translate-x-0.5 -translate-y-0.5"
                  : "bg-zinc-100 hover:bg-zinc-50 hover:shadow-[2px_2px_0px_#000] hover:-translate-x-0.2"
              }`}
              id={`project-card-${proj.id}`}
            >
              {/* Project Title */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-black text-sm tracking-tight break-all uppercase line-clamp-1 flex items-center gap-1.5">
                    {proj.name || t.untitledProject}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5 truncate">
                    Client: {proj.clientName || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-600 border border-black text-[9px] font-bold uppercase">
                    {proj.language.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Specs & Metadata */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 py-1.5 px-2 bg-zinc-50 border border-black text-[10px] text-zinc-600">
                <div>
                  CAP: <span className="font-bold text-black">{proj.arrayCapacitykWp} kWp</span>
                </div>
                <div>
                  STD: <span className="font-bold text-black">{proj.electricalStandard}</span>
                </div>
                <div>
                  TAX: <span className="font-bold text-black">{proj.vatRate}%</span>
                </div>
                <div>
                  RAD: <span className="font-bold text-black">{proj.peakSunHours}h/d</span>
                </div>
              </div>

              {/* Hover Actions */}
              {isActive && (
                <div className="flex items-center gap-1 mt-1 justify-end border-t border-dashed border-zinc-400 pt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onCloneProject(proj.id)}
                    className="p-1.5 bg-white border border-black hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                    title={t.cloneProject}
                    id={`btn-clone-${proj.id}`}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handleExport(proj)}
                    className="p-1.5 bg-white border border-black hover:bg-zinc-100 text-blue-600 cursor-pointer"
                    title={t.exportProject}
                    id={`btn-export-${proj.id}`}
                  >
                    <FileDown size={12} />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(t.confirmDelete)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 bg-red-100 border border-black hover:bg-red-200 text-red-700 ml-auto cursor-pointer"
                      title={t.deleteProject}
                      id={`btn-delete-${proj.id}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drag & Drop Import Panel */}
      <div className="p-4 border-t-2 border-black bg-zinc-100 flex flex-col gap-2">
        <div className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">
          📥 IMPORT CONFIGURATION
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 rounded-none ${
            isDragging
              ? "border-black bg-yellow-100"
              : "border-zinc-400 bg-white hover:border-black hover:bg-zinc-50"
          }`}
          id="import-drag-zone"
        >
          <UploadCloud size={18} className="text-zinc-600" />
          <div className="font-bold text-[10px] text-zinc-800 uppercase">
            {t.dragDropJson}
          </div>
          <span className="text-[9px] text-zinc-500 underline uppercase">
            {t.browseFiles}
          </span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {feedbackMsg && (
          <div
            className={`p-2 border border-black text-[10px] font-bold uppercase mt-2 flex items-center gap-1.5 ${
              feedbackMsg.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
            id="import-feedback"
          >
            {feedbackMsg.error ? <AlertTriangle size={12} /> : <Check size={12} />}
            <span className="break-all">{feedbackMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
