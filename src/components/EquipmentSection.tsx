import React, { useState } from "react";
import { Project, EquipmentItem } from "../types";
import { translations } from "../translations";
import { formatCurrency } from "../utils";
import { Trash2, Plus, Hammer, Server, Info, RefreshCw } from "lucide-react";

interface EquipmentSectionProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  project,
  onChange
}) => {
  const t = translations[project.language];

  // Fields for adding custom item
  const [newItem, setNewItem] = useState<Omit<EquipmentItem, "id" | "isCustom">>({
    category: "panel",
    name: "",
    specification: "",
    quantity: 1,
    unitCost: 0
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const item: EquipmentItem = {
      ...newItem,
      id: `eq-${Date.now()}`,
      isCustom: true
    };

    onChange({
      equipment: [...project.equipment, item]
    });

    // Reset fields
    setNewItem({
      category: "panel",
      name: "",
      specification: "",
      quantity: 1,
      unitCost: 0
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      equipment: project.equipment.filter((item) => item.id !== id)
    });
  };

  const handleUpdateItem = (id: string, field: keyof EquipmentItem, value: any) => {
    onChange({
      equipment: project.equipment.map((item) => {
        if (item.id === id) {
          if (field === "quantity" || field === "unitCost") {
            const numVal = parseFloat(value);
            return { ...item, [field]: isNaN(numVal) ? 0 : Math.max(0, numVal) };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    });
  };

  const num = (v: any): number => {
    if (v === undefined || v === null || v === "") return 0;
    const parsed = parseFloat(v);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  const handleLaborChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "useFlatLabor") {
      onChange({ useFlatLabor: value === "true" });
    } else {
      if (value === "") {
        onChange({ [name]: "" });
      } else {
        const numVal = parseFloat(value);
        onChange({ [name]: isNaN(numVal) ? "" : numVal });
      }
    }
  };

  // Hardware Subtotal
  const hardwareSubtotal = project.equipment.reduce(
    (acc, item) => acc + item.quantity * item.unitCost,
    0
  );

  // Labor Subtotal
  const laborSubtotal = project.useFlatLabor
    ? num(project.flatLaborCost)
    : num(project.laborRate) * num(project.laborHours);

  const totalBeforeTax = hardwareSubtotal + laborSubtotal;
  const vatAmount = totalBeforeTax * (num(project.vatRate) / 100);
  const totalWithTax = totalBeforeTax + vatAmount;

  return (
    <div className="flex flex-col gap-6" id="equipment-checklist-section">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Hardware Procurement & Table */}
        <div className="xl:col-span-2 border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-black" />
              <h3 className="font-tech text-base font-black uppercase text-black">
                {t.hardwareProcurement}
              </h3>
            </div>
            <span className="bg-black text-[#FFE21A] font-mono text-[10px] px-2 py-0.5 border border-black font-bold">
              {project.equipment.length} {t.itemsCount}
            </span>
          </div>

          {/* Equipment Table */}
          <div className="overflow-x-auto -mx-5 xl:mx-0">
            <table className="w-full text-left font-mono text-[11px] border-collapse min-w-[600px] xl:min-w-0">
              <thead>
                <tr className="bg-zinc-100 border-b-2 border-black">
                  <th className="p-2 border-r border-black font-bold text-black uppercase w-[15%]">
                    {t.category}
                  </th>
                  <th className="p-2 border-r border-black font-bold text-black uppercase w-[35%]">
                    {t.itemName} / Specification
                  </th>
                  <th className="p-2 border-r border-black font-bold text-black uppercase text-center w-[10%]">
                    {t.quantity}
                  </th>
                  <th className="p-2 border-r border-black font-bold text-black uppercase text-right w-[18%]">
                    {t.unitCost}
                  </th>
                  <th className="p-2 border-r border-black font-bold text-black uppercase text-right w-[17%]">
                    {t.totalCost}
                  </th>
                  <th className="p-2 text-center w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {project.equipment.map((item) => (
                  <tr key={item.id} className="border-b border-black hover:bg-zinc-50 align-top">
                    {/* Category Column */}
                    <td className="p-2 border-r border-black text-zinc-600 font-bold uppercase text-[9px] whitespace-nowrap bg-zinc-50">
                      <span className="px-1 py-0.5 border border-black bg-white inline-block">
                        {t[`cat_${item.category}`] || item.category}
                      </span>
                    </td>

                    {/* Name & Specification Column */}
                    <td className="p-2 border-r border-black flex flex-col gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                        className="font-bold text-black border-b border-transparent hover:border-zinc-400 focus:border-black focus:bg-white outline-none w-full pb-0.5 rounded-none"
                      />
                      <input
                        type="text"
                        value={item.specification}
                        onChange={(e) => handleUpdateItem(item.id, "specification", e.target.value)}
                        className="text-zinc-500 font-sans text-[10px] border-b border-transparent hover:border-zinc-300 focus:border-black focus:bg-white outline-none w-full pb-0.5 rounded-none"
                      />
                    </td>

                    {/* Qty Column */}
                    <td className="p-2 border-r border-black text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                        className="w-12 text-center border border-black font-bold bg-zinc-50 focus:bg-white py-0.5 rounded-none"
                      />
                    </td>

                    {/* Unit Cost Column */}
                    <td className="p-2 border-r border-black text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-zinc-400">{project.currencySymbol}</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.unitCost}
                          onChange={(e) => handleUpdateItem(item.id, "unitCost", e.target.value)}
                          className="w-20 text-right border border-black font-bold bg-zinc-50 focus:bg-white py-0.5 px-1 rounded-none"
                        />
                      </div>
                    </td>

                    {/* Total Column */}
                    <td className="p-2 border-r border-black text-right font-black text-black bg-zinc-50">
                      {formatCurrency(item.quantity * item.unitCost, project.currencySymbol)}
                    </td>

                    {/* Remove Action */}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 hover:scale-115 transition-all"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {project.equipment.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 italic">
                      {t.noEquipmentChecklist}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Hardware Item Adder */}
          <form onSubmit={handleAddItem} className="bg-zinc-100 p-4 border-2 border-black mt-2 flex flex-col gap-3">
            <h4 className="font-tech text-xs font-black uppercase text-black flex items-center gap-1">
              <span>{t.addCustomItem}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Category */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-zinc-600">{t.category}</span>
                <select
                  value={newItem.category}
                  onChange={(e: any) => setNewItem({ ...newItem, category: e.target.value })}
                  className="border border-black bg-white p-1.5 font-mono text-[11px] outline-none rounded-none"
                >
                  <option value="panel">{t.cat_panel}</option>
                  <option value="inverter">{t.cat_inverter}</option>
                  <option value="battery">{t.cat_battery}</option>
                  <option value="mounting">{t.cat_mounting}</option>
                  <option value="protection">{t.cat_protection}</option>
                  <option value="cabling">{t.cat_cabling}</option>
                  <option value="accessories">{t.cat_accessories}</option>
                  <option value="other">{t.cat_other}</option>
                </select>
              </div>

              {/* Item Name */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[9px] font-bold uppercase text-zinc-600">{t.itemName}</span>
                <input
                  type="text"
                  placeholder="e.g., Sungrow 10kW Inverter"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="border border-black bg-white p-1.5 font-mono text-[11px] outline-none rounded-none"
                />
              </div>

              {/* Specification */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-zinc-600">{t.specsDetails}</span>
                <input
                  type="text"
                  placeholder="e.g., 3-Phase, Wifi"
                  value={newItem.specification}
                  onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                  className="border border-black bg-white p-1.5 font-mono text-[11px] outline-none rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              {/* Qty */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-zinc-600">{t.quantity}</span>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="border border-black bg-white p-1.5 font-mono text-[11px] outline-none rounded-none"
                />
              </div>

              {/* Unit Cost */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-zinc-600">{t.unitCost} ({project.currencySymbol})</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={newItem.unitCost === 0 ? "" : newItem.unitCost}
                  placeholder="0"
                  onChange={(e) => setNewItem({ ...newItem, unitCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="border border-black bg-white p-1.5 font-mono text-[11px] outline-none rounded-none"
                />
              </div>

              <button
                type="submit"
                className="neo-btn-primary py-1.5 font-bold uppercase text-[11px] h-9"
              >
                {t.addLineItem}
              </button>
            </div>
          </form>
        </div>

        {/* Labor Billing Configuration */}
        <div className="flex flex-col gap-6">
          
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-2">
              <Hammer size={18} className="text-black" />
              <h3 className="font-tech text-base font-black uppercase text-black">
                {t.laborCosts}
              </h3>
            </div>

            {/* Billing Structure Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase text-black">
                {t.useFlatLabor}
              </label>
              <select
                name="useFlatLabor"
                value={project.useFlatLabor ? "true" : "false"}
                onChange={handleLaborChange}
                className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] cursor-pointer rounded-none"
                id="select-labor-billing-structure"
              >
                <option value="true">{t.flatRate}</option>
                <option value="false">{t.hourlyRate}</option>
              </select>
            </div>

            {project.useFlatLabor ? (
              /* Flat fee billing */
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs font-bold uppercase text-black">
                  {t.laborCostFlat} ({project.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="flatLaborCost"
                  value={project.flatLaborCost}
                  onChange={handleLaborChange}
                  className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                  id="input-flat-labor-cost"
                />
              </div>
            ) : (
              /* Hourly rate billing */
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    {t.hourlyRateLabel} ({project.currencySymbol}/hr)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="laborRate"
                    value={project.laborRate}
                    onChange={handleLaborChange}
                    className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                    id="input-labor-hourly-rate"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs font-bold uppercase text-black">
                    {t.laborHoursLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="laborHours"
                    value={project.laborHours}
                    onChange={handleLaborChange}
                    className="border-2 border-black bg-zinc-50 p-2 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE21A] rounded-none"
                    id="input-labor-hours"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Real-Time Cost Summary (Neo-Brutalist Card) */}
          <div className="border-2 border-black bg-[#FFE21A] p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3 font-mono">
            <h4 className="font-black text-xs uppercase tracking-wider text-black border-b border-black pb-1.5">
              {t.estimatedScopingTotals}
            </h4>
            <div className="flex justify-between text-xs font-medium text-zinc-900">
              <span>{t.totalHardware}:</span>
              <span className="font-bold">{formatCurrency(hardwareSubtotal, project.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-zinc-900 border-b border-dashed border-black/40 pb-2">
              <span>{t.totalLabor}:</span>
              <span className="font-bold">{formatCurrency(laborSubtotal, project.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-900">
              <span>SUBTOTAL HT:</span>
              <span>{formatCurrency(totalBeforeTax, project.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-900 border-b border-black pb-2">
              <span>TVA / TAXES ({project.vatRate}%):</span>
              <span>{formatCurrency(vatAmount, project.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-black">
              <span>TOTAL (TTC):</span>
              <span className="bg-white border border-black px-1.5 py-0.5">
                {formatCurrency(totalWithTax, project.currencySymbol)}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
