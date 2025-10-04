"use client";

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
import React, { useState, useMemo, useRef } from "react";

export function Header({ tier, credits, onBuy }) {
  return (
    <Card title="Mission Control Dashboard" subtitle="Design experiments, manage credits, and pack your education satellite payload.">
      <div className="flex items-center gap-4 mt-4">
        <Badge>{tier} Plan</Badge>
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

export function RequestForm({ onSubmit, estimateCost }) {
  const [form, setForm] = useState({
    material: "",
    amount: "",
    unit: "g",
    priority: "Normal",
    notes: "",
  });
  const cost = useMemo(() => estimateCost({ amount: form.amount, priority: form.priority }), [form.amount, form.priority, estimateCost]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.material || !form.amount) return alert("Material and amount required");
    onSubmit({ ...form });
    setForm({ material: "", amount: "", unit: "g", priority: "Normal", notes: "" });
  }

  return (
    <Card title="Request Materials / Lab Time">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <label className="block text-sm text-neutral-300">Material</label>
            <input
              value={form.material}
              onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="250"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-neutral-300">Unit</label>
            <select
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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

export function SubscriptionCard({ tier, onChangeTier }) {
  return (
    <Card title="Subscription" subtitle="Choose a plan that matches your usage. (Demo only)">
      <div className="flex flex-wrap gap-2 mt-2">
        {[
          { name: "Student", perks: "Up to 1U payload tools" },
          { name: "Academic", perks: "Priority queue, 3U builder" },
          { name: "Enterprise", perks: "Custom integrations, 6U+" },
        ].map((p) => (
          <button
            key={p.name}
            onClick={() => onChangeTier(p.name)}
            className={`rounded-lg border px-3 py-2 text-base ${
              tier === p.name
                ? "border-emerald-500 bg-emerald-600/20 text-emerald-200"
                : "border-neutral-700 bg-neutral-900 hover:border-neutral-600"
            }`}
            title={p.perks}
          >
            {p.name}
          </button>
        ))}
      </div>
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
