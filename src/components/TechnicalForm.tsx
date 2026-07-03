import React from "react";
import { Project } from "../types";
import { translations } from "../translations";
import { Sun, ShieldAlert, Cpu, ArrowRight } from "lucide-react";

interface TechnicalFormProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const TechnicalForm: React.FC<TechnicalFormProps> = ({
  project,
  onChange
}) => {
  const t = translations[project.language];

  const num = (v: any): number => {
    if (v === undefined || v === null || v === "") return 0;
    const parsed = parseFloat(v);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "") {
      onChange({ [name]: "" });
    } else {
      const numVal = parseFloat(value);
      onChange({ [name]: isNaN(numVal) ? "" : numVal });
    }
  };

  // Live intermediate estimation of production
  const estAnnualProduction = Math.round(
    num(project.arrayCapacitykWp) *
    num(project.peakSunHours) *
    365 *
    (num(project.systemEfficiency) / 100)
  );

  const estSelfConsumed = Math.round(estAnnualProduction * (num(project.selfConsumptionRatio) / 100));
  const estExported = Math.round(estAnnualProduction * (1 - num(project.selfConsumptionRatio) / 100));

  return (
    <div className="flex flex-col gap-6" id="technical-solar-form">
      
      {/* Schematic Layout Flow Header */}
      <div className="border-2 border-black bg-black text-[#FFE21A] p-4 font-mono text-[11px] uppercase tracking-wider flex flex-wrap items-center gap-2 justify-center border-b-4 shadow-[4px_4px_0px_#000]">
        <div className="bg-[#FFE21A] text-black px-1.5 py-0.5 font-bold">{t.ihmFlowDiagram}</div>
        <span>[{t.flowCapacity}: {project.arrayCapacitykWp || 0} kWp]</span>
        <ArrowRight size={12} className="text-zinc-500" />
        <span>[{t.flowIrradiance}: {project.peakSunHours || 0} PSH]</span>
        <ArrowRight size={12} className="text-zinc-500" />
        <span>[PR: {project.systemEfficiency || 0}%]</span>
        <ArrowRight size={12} className="text-zinc-500" />
        <span className="text-white font-bold bg-zinc-800 px-1 border border-zinc-700">
          {t.flowEstHarvest}: {estAnnualProduction.toLocaleString()} kWh/Yr
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Irradiance & Sizing Inputs */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-1 mb-2 bg-[#FFE21A] px-2 py-0.5">
            <Sun size={18} className="text-black" />
            <h3 className="font-tech text-base font-black uppercase text-black">
              [01] {t.solarEstimates}
            </h3>
          </div>

          {/* Array Capacity kWp */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
              <span>{t.arrayCapacitykWp} (kWp)</span>
              <span className="text-zinc-500 font-sans text-[11px] lowercase italic">total DC power</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              name="arrayCapacitykWp"
              value={project.arrayCapacitykWp}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., 6.6, 45, 100"
              required
              id="input-array-capacity"
            />
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {t.arrayCapacitykWpHelp}
            </p>
          </div>

          {/* Average Peak Sun Hours */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
              <span>{t.peakSunHours} (kWh/m²/day)</span>
              <span className="text-zinc-500 font-sans text-[11px] lowercase italic">solar resource</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              name="peakSunHours"
              value={project.peakSunHours}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., 3.8, 5.2"
              required
              id="input-peak-sun-hours"
            />
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {t.peakSunHoursHelp}
            </p>
          </div>

          {/* System Efficiency / PR */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
              <span>{t.systemEfficiency} (%)</span>
              <span className="text-zinc-500 font-sans text-[11px] lowercase italic">performance ratio</span>
            </label>
            <input
              type="number"
              step="any"
              min="10"
              max="100"
              name="systemEfficiency"
              value={project.systemEfficiency}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., 80"
              required
              id="input-system-efficiency"
            />
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {t.systemEfficiencyHelp}
            </p>
          </div>
        </div>

        {/* Load & Consumption Profiles */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-1 mb-2 bg-[#FFE21A] px-2 py-0.5">
            <Cpu size={18} className="text-black" />
            <h3 className="font-tech text-base font-black uppercase text-black">
              [02] {t.energyConsumptionProfile}
            </h3>
          </div>

          {/* Self Consumption Ratio */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
              <span>{t.selfConsumptionRatio} (%)</span>
              <span className="text-zinc-500 font-sans text-[11px] lowercase italic">consumed on-site</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                name="selfConsumptionRatio"
                value={project.selfConsumptionRatio}
                onChange={handleInputChange}
                className="flex-1 accent-black h-1.5 bg-zinc-200 border border-black cursor-pointer rounded-none"
                id="slider-self-consumption"
              />
              <span className="bg-black text-[#FFE21A] px-2 py-1 text-xs font-bold border border-black shrink-0 w-12 text-center">
                {project.selfConsumptionRatio}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {t.selfConsumptionRatioHelp}
            </p>
          </div>

          {/* Grid Feed-in Tariff (FiT) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
              <span>{t.feedInTariff} ({project.currencySymbol}/kWh)</span>
              <span className="text-zinc-500 font-sans text-[11px] lowercase italic">export compensation</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              name="feedInTariff"
              value={project.feedInTariff}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., 0.13, 120"
              required
              id="input-feed-in-tariff"
            />
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {t.feedInTariffHelp}
            </p>
          </div>

          {/* Grid Inflation Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
              <span>{t.tariffInflationRate} (%)</span>
              <span className="text-zinc-500 font-sans text-[11px] lowercase italic">annual price hike</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="25"
              name="tariffInflationRate"
              value={project.tariffInflationRate}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., 4"
              required
              id="input-inflation-rate"
            />
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {t.tariffInflationRateHelp}
            </p>
          </div>
        </div>
      </div>

      {/* Production Quick Breakdown Panel */}
      <div className="border-2 border-black bg-zinc-50 p-5 shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono">
        <div className="border border-black p-3 bg-white">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">{t.estHarvestedAnnual}</div>
          <div className="text-lg font-black text-black mt-1">
            {estAnnualProduction.toLocaleString()} <span className="text-xs">kWh</span>
          </div>
        </div>
        <div className="border border-black p-3 bg-white">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">{t.selfConsumedOnSite}</div>
          <div className="text-lg font-black text-green-600 mt-1">
            {estSelfConsumed.toLocaleString()} <span className="text-xs">kWh ({project.selfConsumptionRatio}%)</span>
          </div>
        </div>
        <div className="border border-black p-3 bg-white">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">{t.injectedBackToGrid}</div>
          <div className="text-lg font-black text-blue-600 mt-1">
            {estExported.toLocaleString()} <span className="text-xs">kWh ({100 - project.selfConsumptionRatio}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
