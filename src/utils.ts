import { Project, EquipmentItem } from "./types";

export function formatCurrency(value: number, symbol: string, code?: string, compact: boolean = false): string {
  if (value === undefined || value === null || isNaN(value)) {
    return `${symbol} 0`;
  }

  let formattedNum = "";
  if (compact && Math.abs(value) >= 1_000_000) {
    formattedNum = (value / 1_000_000).toFixed(1) + "M";
  } else if (compact && Math.abs(value) >= 1_000) {
    formattedNum = (value / 1_000).toFixed(1) + "k";
  } else {
    // If currency has very small values like Euro or USD, let's keep decimals if it's < 100, else round
    const absVal = Math.abs(value);
    if (absVal < 100 && absVal > 0 && absVal % 1 !== 0) {
      formattedNum = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      formattedNum = Math.round(value).toLocaleString(undefined);
    }
  }

  const suffix = code ? ` ${code}` : "";
  return `${symbol} ${formattedNum}${suffix}`;
}

export interface SolarFinancialMetrics {
  hardwareSubtotal: number;
  laborSubtotal: number;
  subtotalBeforeTax: number;
  vatAmount: number;
  grossSystemCost: number; // Gross System Cost (with VAT)
  totalIncentives: number;
  netSystemCost: number; // Gross - Incentives
  annualProductionkWh: number; // kWh/year
  annualSavedEnergykWh: number; // kWh/year
  annualExportedEnergykWh: number; // kWh/year
  year1SavingsAvoidedCost: number;
  year1SavingsExportIncome: number;
  year1TotalSavings: number; // Annual Savings
  paybackPeriod: number; // in years
  returnOnInvestmentPercentage: number; // ROI
  internalRateOfReturnPercentage: number; // True IRR (TRI)
  equityMultiple: number; // Equity Multiple (e.g. 31.5)
  lifetimeCumulativeSavings: number; // 25 years cumulative net savings
  yearlyData: YearlyProjectionItem[];
  feasibilityRating: 'excellent' | 'good' | 'moderate' | 'low';
}

export interface YearlyProjectionItem {
  year: number;
  production: number;
  electricityTariff: number;
  gridSavings: number;
  exportEarnings: number;
  annualBenefit: number;
  cumulativeBenefit: number;
  cumulativeNetCashflow: number;
}

const num = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const parsed = parseFloat(val);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
};

function calculateIRR(cashFlows: number[]): number {
  if (cashFlows.length === 0) return 0;
  const initialInvestment = cashFlows[0];
  if (initialInvestment >= 0) return 0; // IRR is undefined if there is no initial negative cash flow
  
  const hasPositive = cashFlows.slice(1).some(cf => cf > 0);
  if (!hasPositive) return 0;

  const totalSum = cashFlows.reduce((sum, val) => sum + val, 0);
  if (totalSum <= 0) return 0;

  const getNPV = (rate: number): number => {
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return npv;
  };

  let low = -0.99;
  let high = 50.0;
  
  // Expand high if NPV at high is still positive
  while (getNPV(high) > 0 && high < 1000.0) {
    high *= 2;
  }

  const precision = 1e-5;
  const maxIterations = 100;
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = getNPV(mid);
    
    if (Math.abs(npvMid) < precision) {
      return mid * 100;
    }
    
    if (npvMid > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return ((low + high) / 2) * 100;
}

export function calculateProjectMetrics(project: Project): SolarFinancialMetrics {
  // 1. Hardware Subtotal
  const hardwareSubtotal = project.equipment.reduce(
    (acc, item) => acc + item.quantity * item.unitCost,
    0
  );

  // 2. Labor Subtotal
  const laborSubtotal = project.useFlatLabor
    ? num(project.flatLaborCost)
    : num(project.laborRate) * num(project.laborHours);

  // 3. Subtotal before tax
  const subtotalBeforeTax = hardwareSubtotal + laborSubtotal;

  // 4. VAT
  const vatAmount = subtotalBeforeTax * (num(project.vatRate) / 100);

  // 5. Gross System Cost
  const grossSystemCost = subtotalBeforeTax + vatAmount;

  // 6. Total Incentives
  let totalIncentives = 0;
  if (project.incentivesEnabled) {
    const selfConsumptionPremiumTotal = num(project.selfConsumptionPremium) * num(project.arrayCapacitykWp);
    const taxCreditValue = num(project.taxCredit); // Treat as flat cash savings
    
    totalIncentives =
      selfConsumptionPremiumTotal +
      num(project.govSubsidy) +
      num(project.utilityRebate) +
      taxCreditValue +
      num(project.carbonCredit) +
      num(project.otherIncentiveValue);
  }

  // 7. Net System Cost
  const netSystemCost = Math.max(0, grossSystemCost - totalIncentives);

  // 8. Annual Production (kWh)
  // formula: capacity (kWp) * average sun hours * 365 * efficiency / 100
  const annualProductionkWh =
    num(project.arrayCapacitykWp) *
    num(project.peakSunHours) *
    365 *
    (num(project.systemEfficiency) / 100);

  // 9. Self consumption and export
  const annualSavedEnergykWh = annualProductionkWh * (num(project.selfConsumptionRatio) / 100);
  const annualExportedEnergykWh = annualProductionkWh * (1 - num(project.selfConsumptionRatio) / 100);

  // 10. Year 1 savings
  const year1SavingsAvoidedCost = annualSavedEnergykWh * num(project.electricityTariff);
  const year1SavingsExportIncome = annualExportedEnergykWh * num(project.feedInTariff);
  const year1TotalSavings = year1SavingsAvoidedCost + year1SavingsExportIncome;

  // 11. 25-Year Projection
  const yearlyData: YearlyProjectionItem[] = [];
  let cumulativeBenefit = 0;
  let paybackPeriod = -1;
  const cashFlows = [-netSystemCost];
  
  for (let t = 1; t <= 25; t++) {
    // Panel degradation of 0.5% per year
    const degradationMultiplier = Math.pow(1 - 0.005, t - 1);
    const production = annualProductionkWh * degradationMultiplier;
    
    // Electricity tariff inflation
    const electricityTariff = num(project.electricityTariff) * Math.pow(1 + num(project.tariffInflationRate) / 100, t - 1);
    
    // Feed-in tariff usually stays fixed under contract
    const feedInTariff = num(project.feedInTariff);

    const selfConsumed = production * (num(project.selfConsumptionRatio) / 100);
    const exported = production * (1 - num(project.selfConsumptionRatio) / 100);

    const gridSavings = selfConsumed * electricityTariff;
    const exportEarnings = exported * feedInTariff;
    const annualBenefit = gridSavings + exportEarnings;

    cumulativeBenefit += annualBenefit;
    const cumulativeNetCashflow = cumulativeBenefit - netSystemCost;
    cashFlows.push(annualBenefit);

    // Detect payback period fractional
    if (paybackPeriod === -1 && cumulativeBenefit >= netSystemCost && netSystemCost > 0) {
      if (t === 1) {
        paybackPeriod = annualBenefit > 0 ? netSystemCost / annualBenefit : 0;
      } else {
        const prevCumulative = cumulativeBenefit - annualBenefit;
        const remainingCost = netSystemCost - prevCumulative;
        paybackPeriod = (t - 1) + (annualBenefit > 0 ? remainingCost / annualBenefit : 0);
      }
    }

    yearlyData.push({
      year: t,
      production,
      electricityTariff,
      gridSavings,
      exportEarnings,
      annualBenefit,
      cumulativeBenefit,
      cumulativeNetCashflow
    });
  }

  // If payback period is not reached in 25 years
  if (paybackPeriod === -1) {
    paybackPeriod = 99; // Represents infinity/not reached
  }

  // Lifetime cumulative savings (25 years net)
  const lifetimeCumulativeSavings = cumulativeBenefit - netSystemCost;

  // ROI Percentage = (Cumulative 25-yr Benefit / Net System Cost) * 100
  const returnOnInvestmentPercentage = netSystemCost > 0 
    ? (cumulativeBenefit / netSystemCost) * 100 
    : 0;

  const internalRateOfReturnPercentage = calculateIRR(cashFlows);
  const equityMultiple = netSystemCost > 0 ? (cumulativeBenefit / netSystemCost) : 0;

  // Feasibility Rating
  let feasibilityRating: 'excellent' | 'good' | 'moderate' | 'low' = 'low';
  if (paybackPeriod <= 5) {
    feasibilityRating = 'excellent';
  } else if (paybackPeriod <= 8) {
    feasibilityRating = 'good';
  } else if (paybackPeriod <= 14) {
    feasibilityRating = 'moderate';
  } else {
    feasibilityRating = 'low';
  }

  return {
    hardwareSubtotal,
    laborSubtotal,
    subtotalBeforeTax,
    vatAmount,
    grossSystemCost,
    totalIncentives,
    netSystemCost,
    annualProductionkWh,
    annualSavedEnergykWh,
    annualExportedEnergykWh,
    year1SavingsAvoidedCost,
    year1SavingsExportIncome,
    year1TotalSavings,
    paybackPeriod,
    returnOnInvestmentPercentage,
    internalRateOfReturnPercentage,
    equityMultiple,
    lifetimeCumulativeSavings,
    yearlyData,
    feasibilityRating
  };
}

export function validateImportedProject(parsed: any): boolean {
  if (!parsed || typeof parsed !== 'object') return false;
  
  // Required fields with strict type checking
  if (typeof parsed.name !== 'string' || !parsed.name.trim()) return false;
  if (parsed.language !== 'en' && parsed.language !== 'fr') return false;
  
  // Crucial structural string fields (if defined)
  const stringFields = ['clientName', 'country', 'electricalStandard', 'currencyName', 'currencySymbol', 'currencyCode'];
  for (const field of stringFields) {
    if (parsed[field] !== undefined && typeof parsed[field] !== 'string') return false;
  }
  
  // Key numeric/empty inputs must be valid numbers or empty strings
  const numberOrEmptyFields = [
    'electricityTariff', 'vatRate', 'arrayCapacitykWp', 'peakSunHours', 
    'systemEfficiency', 'selfConsumptionRatio', 'feedInTariff', 'tariffInflationRate',
    'selfConsumptionPremium', 'govSubsidy', 'utilityRebate', 'taxCredit', 
    'carbonCredit', 'otherIncentiveValue', 'laborRate', 'laborHours', 'flatLaborCost'
  ];
  for (const field of numberOrEmptyFields) {
    const val = parsed[field];
    if (val !== undefined && val !== "" && typeof val !== 'number') return false;
  }

  // Boolean attributes
  const boolFields = ['incentivesEnabled', 'useFlatLabor'];
  for (const field of boolFields) {
    if (parsed[field] !== undefined && typeof parsed[field] !== 'boolean') return false;
  }

  // Equipment array validation
  if (parsed.equipment !== undefined) {
    if (!Array.isArray(parsed.equipment)) return false;
    for (const item of parsed.equipment) {
      if (!item || typeof item !== 'object') return false;
      if (typeof item.id !== 'string') return false;
      if (typeof item.name !== 'string') return false;
      if (typeof item.specification !== 'string') return false;
      if (typeof item.quantity !== 'number' || isNaN(item.quantity)) return false;
      if (typeof item.unitCost !== 'number' || isNaN(item.unitCost)) return false;
      if (item.category && typeof item.category !== 'string') return false;
    }
  }

  return true;
}
