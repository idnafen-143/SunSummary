export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeployed?: boolean;
  
  // 1. Project Settings & Local Context
  name: string;
  clientName: string;
  country: string;
  language: 'en' | 'fr';
  electricalStandard: 'IEC' | 'NEC' | 'NFC' | 'Local';
  electricityTariff: number | ""; // grid price per kWh
  vatRate: number | ""; // percentage (e.g. 20 for 20%)

  // 2. Currency Settings
  currencyName: string;
  currencySymbol: string;
  currencyCode: string;

  // 3. Solar Technical Estimates
  arrayCapacitykWp: number | ""; // kWp
  peakSunHours: number | ""; // kWh/m²/day
  systemEfficiency: number | ""; // percentage (e.g. 80 for 80%)
  selfConsumptionRatio: number | ""; // percentage (e.g. 70 for 70% self-consumed, 30% exported)
  feedInTariff: number | ""; // price per kWh exported to grid
  tariffInflationRate: number | ""; // annual price increase percentage (e.g. 4 for 4%)

  // 4. Financial Incentives (Toggle & Modular)
  incentivesEnabled: boolean;
  selfConsumptionPremium: number | "";
  govSubsidy: number | "";
  utilityRebate: number | "";
  taxCredit: number | "";
  carbonCredit: number | "";
  otherIncentiveLabel: string;
  otherIncentiveValue: number | "";

  // 5. Equipment Checklist & Labor
  equipment: EquipmentItem[];
  laborRate: number | ""; // cost per hour or flat
  laborHours: number | "";
  useFlatLabor: boolean;
  flatLaborCost: number | "";
}

export interface EquipmentItem {
  id: string;
  category: 'panel' | 'inverter' | 'battery' | 'mounting' | 'protection' | 'cabling' | 'accessories' | 'other';
  name: string;
  specification: string;
  quantity: number;
  unitCost: number;
  isCustom: boolean;
}

export type ActiveTab = 'settings' | 'technical' | 'equipment' | 'incentives' | 'dashboard' | 'proposal';
