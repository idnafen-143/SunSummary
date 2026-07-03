import React from "react";
import { Project } from "../types";
import { translations } from "../translations";
import { formatCurrency } from "../utils";
import { Sparkles, HelpCircle, Gift, ArrowRight } from "lucide-react";

interface FinancialIncentivesFormProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const FinancialIncentivesForm: React.FC<FinancialIncentivesFormProps> = ({
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

  const handleToggleIncentives = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ incentivesEnabled: e.target.checked });
  };

  // Hardware Subtotal (for tax credit preview)
  const hardwareSubtotal = project.equipment.reduce(
    (acc, item) => acc + item.quantity * item.unitCost,
    0
  );

  const selfConsumptionPremiumTotal = num(project.selfConsumptionPremium) * num(project.arrayCapacitykWp);
  
  const totalSubsidies = project.incentivesEnabled
    ? selfConsumptionPremiumTotal +
      num(project.govSubsidy) +
      num(project.utilityRebate) +
      num(project.taxCredit) +
      num(project.carbonCredit) +
      num(project.otherIncentiveValue)
    : 0;

  return (
    <div className="flex flex-col gap-6" id="financial-incentives-section">
      
      {/* Toggle Box */}
      <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          <h3 className="font-tech text-base font-black uppercase text-black flex items-center gap-2">
            <Gift size={18} className="text-black" />
            {t.incentivesTitle}
          </h3>
          <p className="text-zinc-500 font-sans text-xs leading-normal">
            {t.incentivesHelp}
          </p>
        </div>

        {/* Thick Border-2 Toggle Switch */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={project.incentivesEnabled}
              onChange={handleToggleIncentives}
              className="sr-only peer"
              id="toggle-incentives-state"
            />
            <div className="w-14 h-8 bg-zinc-200 border-2 border-black peer-focus:outline-none transition-all duration-150 peer-checked:bg-[#FFE21A] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-2 after:border-black after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
            <span className="ml-3 font-mono text-xs font-black uppercase text-black">
              {project.incentivesEnabled ? "ENABLED" : "DISABLED"}
            </span>
          </label>
        </div>
      </div>

      {project.incentivesEnabled ? (
        /* Revealed advanced form with specific fields */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="incentives-form-container">
          
          {/* Form Side */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
            <div className="text-xs font-bold font-tech text-zinc-600 border-b border-black pb-1 uppercase tracking-wider">
              {t.localSubsidiesCashCredits}
            </div>

            {/* Self-Consumption Premium */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black flex items-center justify-between">
                <span>{t.selfConsumptionPremium} ({project.currencySymbol}/kWp)</span>
                <span className="text-green-600 font-bold bg-green-50 border border-green-200 px-1 text-[10px]">
                  + {formatCurrency(selfConsumptionPremiumTotal, project.currencySymbol)} total
                </span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="selfConsumptionPremium"
                value={project.selfConsumptionPremium}
                onChange={handleInputChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                placeholder="e.g., 220"
                id="input-self-consumption-premium"
              />
              <span className="text-[10px] text-zinc-500 font-sans leading-normal">
                {t.selfConsumptionPremiumHelp}
              </span>
            </div>

            {/* Government Subsidy / Grant */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black">
                {t.govSubsidy} ({project.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="govSubsidy"
                value={project.govSubsidy}
                onChange={handleInputChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                placeholder="e.g., 1000"
                id="input-government-subsidy"
              />
              <span className="text-[10px] text-zinc-500 font-sans leading-normal">
                {t.govSubsidyHelp}
              </span>
            </div>

            {/* Utility Rebate */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black">
                {t.utilityRebate} ({project.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="utilityRebate"
                value={project.utilityRebate}
                onChange={handleInputChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                placeholder="e.g., 300"
                id="input-utility-rebate"
              />
              <span className="text-[10px] text-zinc-500 font-sans leading-normal">
                {t.utilityRebateHelp}
              </span>
            </div>
          </div>

          {/* Tax Credits & Custom Incentives */}
          <div className="flex flex-col gap-6">
            
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
              <div className="text-xs font-bold font-tech text-zinc-600 border-b border-black pb-1 uppercase tracking-wider">
                {t.taxDeductionsCustomSchemes}
              </div>

              {/* Tax Credit */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black">
                  {t.taxCredit} ({project.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="taxCredit"
                  value={project.taxCredit}
                  onChange={handleInputChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                  placeholder="e.g., 1200"
                  id="input-tax-credit"
                />
                <span className="text-[10px] text-zinc-500 font-sans leading-normal">
                  {t.taxCreditHelp}
                </span>
              </div>

              {/* Carbon Offset Credit */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black">
                  {t.carbonCredit} ({project.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="carbonCredit"
                  value={project.carbonCredit}
                  onChange={handleInputChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                  placeholder="e.g., 250"
                  id="input-carbon-credit"
                />
                <span className="text-[10px] text-zinc-500 font-sans leading-normal">
                  {t.carbonCreditHelp}
                </span>
              </div>

              {/* Custom Other Incentive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    {t.otherIncentiveLabel}
                  </label>
                  <input
                    type="text"
                    name="otherIncentiveLabel"
                    value={project.otherIncentiveLabel}
                    onChange={(e) => onChange({ otherIncentiveLabel: e.target.value })}
                    className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                    placeholder="e.g., Regional Green Grant"
                    id="input-custom-incentive-label"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    {t.otherIncentiveValue} ({project.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="otherIncentiveValue"
                    value={project.otherIncentiveValue}
                    onChange={handleInputChange}
                    className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                    placeholder="0"
                    id="input-custom-incentive-value"
                  />
                </div>
              </div>
            </div>

            {/* Total Subsidies Card (Neo-Brutalist) */}
            <div className="border-2 border-black bg-black text-[#FFE21A] p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-2 font-mono">
              <h4 className="font-black text-xs uppercase tracking-wider border-b border-zinc-700 pb-1.5">
                {t.cumulativeFinancialAidMetric}
              </h4>
              <div className="flex justify-between items-center text-sm font-black">
                <span>{t.totalSubsidiesDetected}:</span>
                <span className="bg-[#FFE21A] text-black px-2 py-0.5 border border-black">
                  {formatCurrency(totalSubsidies, project.currencySymbol)}
                </span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Support Section Info when Disabled */
        <div className="border-2 border-dashed border-zinc-400 bg-zinc-50 p-8 text-center flex flex-col items-center justify-center gap-3 rounded-none">
          <HelpCircle size={32} className="text-zinc-400" />
          <h4 className="font-mono text-sm font-black uppercase text-zinc-600">
            {t.subsidyCalculationsDisabled}
          </h4>
          <p className="text-zinc-500 font-sans text-xs max-w-md leading-normal">
            {t.subsidyCalculationsDisabledDesc}
          </p>
        </div>
      )}
    </div>
  );
};
