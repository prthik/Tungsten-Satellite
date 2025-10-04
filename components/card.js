export function Grid({ W, H, items, onCellClick, selectedId }) {
  // Render background grid cells
  const cells = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const key = `${x}:${y}`;
      cells.push(
        <div
          key={key}
          className="relative border border-neutral-800/70"
          onClick={(e) => {
            e.stopPropagation();
            onCellClick(x, y);
          }}
        />
      );
    }
  }

  return (
    <div
      className="grid h-full w-full"
      style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${H}, minmax(0, 1fr))` }}
    >
      {cells}
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            gridColumn: `${p.x + 1} / span ${p.w}`,
            gridRow: `${p.y + 1} / span ${p.h}`,
          }}
          className={`relative m-[2px] flex items-center justify-center rounded-lg border text-xs ${
            selectedId === p.id
              ? "border-emerald-500 bg-emerald-500/20"
              : "border-neutral-600 bg-neutral-700/60 hover:border-neutral-500"
          }`}
        >
          <span className="pointer-events-none select-none px-2 text-center text-xs text-white/90">
            {p.label}
            <br />
            {p.w}x{p.h} · {p.massKg} kg
          </span>
        </div>
      ))}
    </div>
  );
}
import React, { useRef, useState, useMemo } from "react";

export function PayloadBuilder({
  bayWidth,
  bayHeight,
  onBayWidthChange,
  onBayHeightChange,
  items,
  selectedId,
  onCellClick,
  onGridClick,
  presets,
  onAddPreset,
  usedCells,
  capacityCells,
  massKg,
  showSelected,
  selectedLabel,
  onMoveSelected,
  onRemoveSelected,
}) {
  return (
    <Card title="Payload Builder" subtitle={`Used ${usedCells}/${capacityCells} cells · Mass ${massKg.toFixed(1)} kg`}>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[280px,1fr]">
        {/* Presets */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <p className="mb-2 text-sm font-medium">Modules</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => onAddPreset(p)}
                className="rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs hover:border-neutral-600"
                title={`${p.w}x${p.h} · ${p.massKg} kg`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Bay Size (U grid)</p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-300">W</label>
              <input
                type="number"
                min={3}
                max={12}
                value={bayWidth}
                onChange={onBayWidthChange}
                className="w-16 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
              />
              <label className="text-xs text-neutral-300">H</label>
              <input
                type="number"
                min={3}
                max={12}
                value={bayHeight}
                onChange={onBayHeightChange}
                className="w-16 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-neutral-400">
            <p>Tip: Click cells to select a module. Use arrow keys to move; Delete to remove.</p>
          </div>
        </div>

        {/* Grid */}
        <div>
          <div
            onClick={onGridClick}
            className="relative aspect-[2/1] w-full select-none overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-2"
          >
            <Grid
              W={bayWidth}
              H={bayHeight}
              items={items}
              onCellClick={onCellClick}
              selectedId={selectedId}
            />
          </div>
        </div>
      </div>

      {showSelected && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm">
          <span className="text-neutral-300">Selected: {selectedLabel}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onMoveSelected(0, -1)} className="rounded-lg border border-neutral-700 px-3 py-1">↑</button>
            <button onClick={() => onMoveSelected(0, 1)} className="rounded-lg border border-neutral-700 px-3 py-1">↓</button>
            <button onClick={() => onMoveSelected(-1, 0)} className="rounded-lg border border-neutral-700 px-3 py-1">←</button>
            <button onClick={() => onMoveSelected(1, 0)} className="rounded-lg border border-neutral-700 px-3 py-1">→</button>
            <button onClick={onRemoveSelected} className="rounded-lg border border-rose-700 bg-rose-900/30 px-3 py-1 hover:border-rose-600">Remove</button>
          </div>
        </div>
      )}
    </Card>
  );
}
export function PublisherCard() {
  return (
    <Card title="Publisher" subtitle="Information about the publisher or organization.">
      <div className="flex flex-col gap-1 mt-2">
        <span className="text-lg font-semibold text-white">Tungsten Satellite Initiative</span>
        <span className="text-base text-neutral-300">Contact: info@tungsten-sat.org</span>
        <span className="text-base text-neutral-400">© 2025 Tungsten Satellite. All rights reserved.</span>
      </div>
    </Card>
  );
}


export default function Card({ title, subtitle, number, children }) {
  return (
    <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-500 flex flex-col">
      {title && <span className="text-neutral-500 text-2xl font-semibold mb-2">{title}</span>}
      {typeof number !== 'undefined' && <span className="text-3xl my-4">{number}</span>}
      {subtitle && <span className="text-neutral-400 text-base mb-2">{subtitle}</span>}
      {children}
    </div>
  );
}

// Dashboard UI Components (moved from dashboard/page.js)

export function Header({ tier, credits, onBuy, onChangeTier }) {
  const [open, setOpen] = useState(false);
  const options = [
    { name: "Free", perks: "Basic access" },
    { name: "Pro", perks: "More credits, advanced features" },
    { name: "Enterprise", perks: "Custom solutions" }
  ];
  return (
    <Card title="Mission Control Dashboard" subtitle="Design experiments, manage credits, and pack your education satellite payload.">
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <div className="relative">
          <button
            className="rounded-xl bg-emerald-600/20 px-4 py-2 text-base text-emerald-300 ring-1 ring-inset ring-emerald-600/40 font-medium flex items-center gap-2"
            onClick={() => setOpen((v) => !v)}
          >
            {tier} Plan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {open && (
            <div className="absolute left-0 mt-2 w-48 rounded-lg bg-neutral-900 border border-neutral-700 shadow-lg z-10">
              {options.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setOpen(false); onChangeTier(p.name); }}
                  className={`w-full text-left px-4 py-2 text-base ${tier === p.name ? "bg-emerald-600/20 text-emerald-200" : "hover:bg-neutral-800 text-neutral-200"}`}
                  title={p.perks}
                >
                  {p.name} <span className="block text-xs text-neutral-400">{p.perks}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="rounded-xl bg-neutral-700 px-3 py-1 text-sm">Credits: <strong>{credits}</strong></span>
        <button onClick={onBuy} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400 focus:outline-none">
          Buy 200 Credits
        </button>
      </div>
    </Card>
  );
}

export function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-emerald-600/20 px-3 py-1 text-base text-emerald-300 ring-1 ring-inset ring-emerald-600/40">
      {children}
    </span>
  );
}

export function RequestForm({ form, onFormChange, onSubmit, cost }) {
  return (
    <Card title="Request Materials / Lab Time">
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <label className="block text-sm text-neutral-300">Material</label>
            <input
              value={form.material}
              onChange={(e) => onFormChange({ ...form, material: e.target.value })}
              placeholder="e.g., Carbon Nanotube feedstock"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-neutral-300">Amount</label>
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => onFormChange({ ...form, amount: e.target.value })}
              placeholder="250"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-neutral-300">Unit</label>
            <select
              value={form.unit}
              onChange={(e) => onFormChange({ ...form, unit: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="cm^3">cm^3</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <label className="block text-sm text-neutral-300">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => onFormChange({ ...form, priority: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm text-neutral-300">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
              placeholder="Hazard flags, purity, handling…"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-300">Estimated cost: <span className="font-semibold text-white">{cost}</span> credits</p>
          <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400 focus:outline-none">
            Submit Request
          </button>
        </div>
      </form>
    </Card>
  );
}


export function RequestsTable({ requests, onCancel }) {
  return (
    <Card title="Recent Requests">
      {requests.length === 0 ? (
        <p className="text-base text-neutral-400">No requests yet. Submit your first materials or lab-time request.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-base">
            <thead className="text-neutral-300">
              <tr>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-neutral-800">
                  <td className="px-3 py-2">{r.material}</td>
                  <td className="px-3 py-2">{r.amount} {r.unit}</td>
                  <td className="px-3 py-2">{r.priority}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2 text-neutral-300">{r.notes}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => onCancel(r.id)} className="rounded-lg border border-neutral-700 px-3 py-1 text-xs hover:border-neutral-600">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
