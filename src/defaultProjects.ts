import { Project } from "./types";

export const defaultProjects: Project[] = [
  {
    id: "proj-1",
    createdAt: "2026-06-15T10:00:00Z",
    updatedAt: "2026-07-01T15:30:00Z",
    name: "Toamasina Commercial Rooftop",
    clientName: "Établissements Filatex S.A.",
    country: "Madagascar",
    language: "fr",
    electricalStandard: "IEC",
    electricityTariff: 680, // Ariary per kWh (JIRAMA tariff commercial)
    vatRate: 20, // 20% VAT in Madagascar
    currencyName: "Ariary",
    currencySymbol: "Ar",
    currencyCode: "MGA",
    
    // Technical parameters
    arrayCapacitykWp: 45, // 45 kWp DC
    peakSunHours: 5.2, // Excellent sun resource in Toamasina
    systemEfficiency: 82, // 82% performance ratio
    selfConsumptionRatio: 90, // 90% consumed on-site due to high grid dependency
    feedInTariff: 120, // Low export price in MGA
    tariffInflationRate: 8, // High inflation (8% annual grid rate hike)

    // Subsidies (Disabled by default, ready for toggle)
    incentivesEnabled: false,
    selfConsumptionPremium: 0,
    govSubsidy: 5000000,
    utilityRebate: 0,
    taxCredit: 10, // 10% tax deduction on green equipment
    carbonCredit: 450000,
    otherIncentiveLabel: "Fonds d'Appui Energie",
    otherIncentiveValue: 3000000,

    // Equipment items (all prices in Ariary)
    equipment: [
      {
        id: "eq-1-1",
        category: "panel",
        name: "Trina Solar Vertex S+ 440W Dual-Glass",
        specification: "102 Modules (44.88 kWp DC total), monocrystalline, N-type",
        quantity: 102,
        unitCost: 450000, // Ar per module
        isCustom: false
      },
      {
        id: "eq-1-2",
        category: "inverter",
        name: "Solis 3P50K-5G 50kW Grid-Tie Inverter",
        specification: "3-Phase, quad-MPPT, integrated DC switch and Wi-Fi data-logger",
        quantity: 1,
        unitCost: 11200000,
        isCustom: false
      },
      {
        id: "eq-1-3",
        category: "mounting",
        name: "K2 Systems SolidRail Aluminum Mounting Structure",
        specification: "Corrugated sheet roof coplanar rails, clamps, and hardware",
        quantity: 1,
        unitCost: 6800000,
        isCustom: false
      },
      {
        id: "eq-1-4",
        category: "protection",
        name: "Mersen DC Surge Protection Combiner Box",
        specification: "4 strings inputs, 1000V DC fuses, Type II SPD",
        quantity: 2,
        unitCost: 1850000,
        isCustom: false
      },
      {
        id: "eq-1-5",
        category: "cabling",
        name: "Nexans Solar Cable 6mm² (Red & Black)",
        specification: "Tinned copper solar cables, UV resistant outer jacket",
        quantity: 450,
        unitCost: 8500, // per meter
        isCustom: false
      },
      {
        id: "eq-1-6",
        category: "accessories",
        name: "Carlo Gavazzi EM340 3-Phase Smart Energy Meter",
        specification: "Modbus communication, CT-connected grid import/export monitoring",
        quantity: 1,
        unitCost: 1350000,
        isCustom: false
      }
    ],
    
    // Labor costs (in Ariary)
    laborRate: 15000,
    laborHours: 120,
    useFlatLabor: true,
    flatLaborCost: 4500000 // 4,500,000 Ar flat installation fee
  },
  {
    id: "proj-2",
    createdAt: "2026-06-20T08:15:00Z",
    updatedAt: "2026-07-02T02:10:00Z",
    name: "Bordeaux Eco-Villa Solar & Storage",
    clientName: "M. & Mme. Charles Martin",
    country: "France",
    language: "en", // Client is English speaking expat in France
    electricalStandard: "IEC",
    electricityTariff: 0.25, // € per kWh
    vatRate: 10, // Reduced 10% VAT in France for residential solar under 9 kWc
    currencyName: "Euro",
    currencySymbol: "€",
    currencyCode: "EUR",

    // Technical parameters
    arrayCapacitykWp: 6.6, // 6.6 kWp DC
    peakSunHours: 3.8, // Bordeaux annual average daily peak sun hours
    systemEfficiency: 80, // 80% Performance Ratio
    selfConsumptionRatio: 65, // 65% consumed directly with batteries
    feedInTariff: 0.13, // EDF Obligation d'Achat tariff for export
    tariffInflationRate: 4, // 4% average inflation

    // Subsidies (Enabled here!)
    incentivesEnabled: true,
    selfConsumptionPremium: 220, // €220 per kWc for 3-9 kWc under French law
    govSubsidy: 0,
    utilityRebate: 0,
    taxCredit: 0,
    carbonCredit: 0,
    otherIncentiveLabel: "Prime Eco-Rénovation Aquitaine",
    otherIncentiveValue: 500,

    // Equipment items (all prices in Euro)
    equipment: [
      {
        id: "eq-2-1",
        category: "panel",
        name: "DualSun Flash 410W Shingle Ultra Black",
        specification: "16 Modules (6.56 kWp total DC), ultra-premium aesthetics",
        quantity: 16,
        unitCost: 195, // € per module
        isCustom: false
      },
      {
        id: "eq-2-2",
        category: "inverter",
        name: "Fronius Primo Gen24 Plus 6.0 kW Hybrid",
        specification: "Single-phase hybrid inverter with PV Point emergency socket",
        quantity: 1,
        unitCost: 1980,
        isCustom: false
      },
      {
        id: "eq-2-3",
        category: "battery",
        name: "BYD Battery-Box Premium HVS 5.1 kWh",
        specification: "Lithium Iron Phosphate (LFP) high-voltage stackable battery",
        quantity: 1,
        unitCost: 3100,
        isCustom: false
      },
      {
        id: "eq-2-4",
        category: "mounting",
        name: "Esdec ClickFit EVO Tiled Roof Structure",
        specification: "Roof hooks, rails, and click clamps for slate/tile roof",
        quantity: 1,
        unitCost: 580,
        isCustom: false
      },
      {
        id: "eq-2-5",
        category: "protection",
        name: "AC/DC Solar Protection Box IP65",
        specification: "Type 2 SPDs, DC circuit breaker, AC differential switch",
        quantity: 1,
        unitCost: 280,
        isCustom: false
      }
    ],

    // Labor costs (in Euro)
    laborRate: 65,
    laborHours: 24,
    useFlatLabor: false, // Hourly billing
    flatLaborCost: 1500
  }
];
