# SunSummary ☀️📊

> Professional solar project scoping, financial reporting, and Bill of Materials (BOM) utility in a high-contrast Neo-Brutalist engineering style.
>
> **Live Production URL:** [sunsummary.netlify.app](https://sunsummary.netlify.app)

---

## 📖 Overview

**SunSummary** is a robust, full-featured solar energy project planning tool designed for developers, engineering contractors, and energy auditors. It enables instant technical profiling, multi-category equipment listings, customized financial incentives, and long-term (25-year) cash flow projections. 

Every view is rendered in a **Neo-Brutalist Engineering UI** featuring sharp borders, high-contrast typography (Inter & monospace), and responsive components with a clean black-and-yellow highlighting palette.

---

## ✨ Key Features

### 1. Solar Technical & Generation Scoping
* **Precision Parameters:** Configure solar array capacity (kWp), peak sun hours, system efficiency loss, and self-consumption ratio.
* **Dual-Tariff Simulation:** Define separate rates for buying utility electricity and selling excess power back to the grid (Feed-In Tariff).
* **Inflation Tracking:** Built-in compound tariff inflation modeling over a 25-year timeline.

### 2. Interactive Cumulative Cash Flow SVG Graph
* **Visual Projections:** High-performance raw SVG rendering of year-by-year net cash flows.
* **Click-to-Reveal Interactive Tooltips:** Points on the graph are wrapped in safe 32px touch/click targets. Click a point to show/hide detailed floating information cards displaying:
  * **Yearly Net Gain**
  * **Cumulative Balance** (color-coded by positive/negative payback status)
* **Year Scroller Controls:** Quick step controls to navigate selected years and preview detailed cash flows effortlessly.

### 3. Rigorous Entry-Level Data Validation
* **Strict Numeric Guards:** Direct inputs in the Equipment Section and Bill of Materials (BOM) enforce strictly positive values (`Math.max(0, val)`) instantly upon input to prevent logical errors.
* **JSON Profile Validation Schema:** Imported project configuration files go through a structured runtime validator. Corrupt, partial, or manually malformed JSON uploads are safely intercepted and flagged.

### 4. Interactive Equipment & BOM Section
* **BOM Engine:** Logically separated equipment categories (panels, inverters, structural mounts, wiring, battery systems, and custom lines).
* **Automatic Cost Calculation:** Real-time summary of material costs combined with flexible flat-rate or hourly labor tracking.

### 5. Financial Incentives & Grants
* **Subsidy Modules:** Account for direct government subsidies, utility rebates, tax credits, carbon offsets, and custom project-level incentives.
* **Compound Calculations:** Automatically adjusts project payback timelines and ROI calculations based on active/inactive incentives.

### 6. Premium PDF Proposal Generator
* **Pro-Grade Prints:** Fully tailored print layout via `html2pdf.js`, generating crisp commercial-ready estimates complete with technical matrices, structured BOM tables, and cash flow breakdowns.

### 7. Multi-Currency & Bilingual Localization
* **Global Ready:** Fast toggling between **English** and **French** translations.
* **Currency Flexibility:** Seamlessly adjust currency symbols ($, €, £, CFA, etc.) and default country guidelines.

---

## 🛠️ Project Structure

The codebase is organized into highly modular, type-safe React/Vite components:

```bash
/src
├── App.tsx                    # Main layout, router, and project importer/exporter
├── types.ts                   # Structured TypeScript types & interfaces
├── translations.ts            # Multilingual localization keys (EN/FR)
├── utils.ts                   # Financial calculations & JSON Validation Schema
├── defaultProjects.ts         # Pre-configured templates for quick-starts
└── components/
    ├── ProjectSettingsForm.tsx    # General settings, currency, & regional standards
    ├── TechnicalForm.tsx          # PV sizing and electrical metrics
    ├── EquipmentSection.tsx       # Interactive BOM manager with validation guards
    ├── FinancialIncentivesForm.tsx# Grants, subsidies, and offsets configuration
    ├── FinancialDashboard.tsx     # Payback period, ROI, and Interactive SVG Graph
    └── PrintProposal.tsx          # Exportable, printable commercial reports
```

---

## 💻 Technical Details & Installation

### Environment Requirements
* **Node.js** v18+
* **Package Manager:** `npm` (configured in `package.json`)

### Installation & Development Run

1. Clone or download the project workspace.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server locally:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🔐 Validation & Quality Control

### Safe Import Validation
The JSON import utilizes a rigorous validation helper (`validateImportedProject`) inside `src/utils.ts` which verifies:
* Key structure existence (name, language, currencySymbol).
* Strict type-safety checks (`typeof` checks on parameters).
* Structure of array entries in the `equipment` table (valid quantities, names, unit costs).

### Safe Input Controls
Within `src/components/EquipmentSection.tsx`, quantity and unit cost updates are protected by:
```typescript
const numVal = parseFloat(value);
return { ...item, [field]: isNaN(numVal) ? 0 : Math.max(0, numVal) };
```

---

*SunSummary is deployed for immediate access at **[sunsummary.netlify.app](https://sunsummary.netlify.app)**.*
