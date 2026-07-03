import React from "react";
import { Project } from "../types";
import { translations } from "../translations";
import { Globe, Settings, CreditCard, Sparkles, Sliders } from "lucide-react";

interface ProjectSettingsFormProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const ProjectSettingsForm: React.FC<ProjectSettingsFormProps> = ({
  project,
  onChange
}) => {
  const t = translations[project.language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "electricityTariff" || name === "vatRate") {
      if (value === "") {
        onChange({ [name]: "" });
      } else {
        const numVal = parseFloat(value);
        onChange({ [name]: isNaN(numVal) ? "" : numVal });
      }
    } else {
      onChange({ [name]: value });
    }
  };

  return (
    <div className="flex flex-col gap-6" id="project-settings-form">
      {/* 2-Column Responsive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Identity & Parameters */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-1 mb-2 bg-[#FFE21A] px-2 py-0.5">
            <Settings size={18} className="text-black" />
            <h3 className="font-tech text-base font-black uppercase text-black">
              [01] {t.projectIdentity}
            </h3>
          </div>

          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
              <span>{t.projectName}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={project.name}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., Bordeaux Rooftop, Toamasina Warehouse"
              required
              id="input-project-name"
            />
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
              <span>{t.clientName}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              value={project.clientName}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., M. Martin, Filatex S.A."
              required
              id="input-client-name"
            />
          </div>

          {/* Country / Location */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
              <span>{t.country}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={project.country}
              onChange={handleInputChange}
              className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
              placeholder="e.g., France, Madagascar, USA"
              required
              id="input-country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Language Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
                <span>{t.language}</span>
              </label>
              <select
                name="language"
                value={project.language}
                onChange={handleInputChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] cursor-pointer rounded-none"
                id="input-language"
              >
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>

            {/* Electrical Standard */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
                <span>{t.electricalStandard}</span>
              </label>
              <select
                name="electricalStandard"
                value={project.electricalStandard}
                onChange={handleInputChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] cursor-pointer rounded-none"
                id="input-electrical-standard"
              >
                <option value="IEC">IEC (International)</option>
                <option value="NEC">NEC (North American)</option>
                <option value="NFC">NFC (French NFC15-100)</option>
                <option value="Local">Local Regulations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel 2: Financial Grid Constraints & Currency & Localization */}
        <div className="flex flex-col gap-6">
          
          {/* Currency Configuration */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-1 mb-2 bg-[#FFE21A] px-2 py-0.5">
              <CreditCard size={18} className="text-black" />
              <h3 className="font-tech text-base font-black uppercase text-black">
                [02] {t.currencySettings}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Currency Symbol */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
                  <span>{t.currencySymbol}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="currencySymbol"
                  value={project.currencySymbol}
                  onChange={handleInputChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs font-bold text-center outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none text-black bg-[#FFE21A]/10"
                  placeholder={t.currencySymbolPlaceholder}
                  required
                  maxLength={5}
                  id="input-currency-symbol"
                />
              </div>

              {/* Currency ISO Code */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
                  <span>{t.currencyCode}</span>
                </label>
                <input
                  type="text"
                  name="currencyCode"
                  value={project.currencyCode}
                  onChange={handleInputChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs text-center uppercase outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                  placeholder={t.currencyCodePlaceholder}
                  maxLength={4}
                  id="input-currency-code"
                />
              </div>
            </div>

            {/* Currency Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black">
                {t.currencyName}
              </label>
              <input
                type="text"
                name="currencyName"
                value={project.currencyName}
                onChange={handleInputChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                placeholder={t.currencyNamePlaceholder}
                id="input-currency-name"
              />
            </div>
          </div>

          {/* Grid Utilities */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-1 mb-2 bg-[#FFE21A] px-2 py-0.5">
              <Sliders size={18} className="text-black" />
              <h3 className="font-tech text-base font-black uppercase text-black">
                [03] Grid Electricity & Tax
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Electricity Tariff */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <span>{t.electricityTariff} ({project.currencySymbol}/kWh)</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="electricityTariff"
                  value={project.electricityTariff}
                  onChange={handleInputChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                  placeholder="e.g., 0.25, 680"
                  required
                  id="input-electricity-tariff"
                />
                <span className="text-[10px] text-zinc-500 leading-normal font-sans">
                  {t.electricityTariffHelp}
                </span>
              </div>

              {/* VAT / Tax Rate */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black flex items-center gap-1">
                  <span>{t.vatRate} (%)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  name="vatRate"
                  value={project.vatRate}
                  onChange={handleInputChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                  placeholder="e.g., 20, 10, 0"
                  id="input-vat-rate"
                />
                <span className="text-[10px] text-zinc-500 leading-normal font-sans">
                  {t.vatRateHelp}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
