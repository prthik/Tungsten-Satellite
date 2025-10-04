
"use client";

import "../globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Card, { Header, Badge, RequestForm, RequestsTable, PayloadBuilder } from "../../../components/card";


// DASHBOARD PAGE
// Drop this file at: src/app/dashboard/page.js (or app/dashboard/page.js)
// Assumes Tailwind is configured (based on your repo styles). No external deps.
// If you don't use Tailwind, the layout still works with minimal inline styles.

export default function DashboardPage() {
  // --- Payload Builder State (must be first for logic below) ---
  const [bayWidth, setBayWidth] = useState(8); // grid columns
  const [bayHeight, setBayHeight] = useState(5); // grid rows
  const [payloadItems, setPayloadItems] = useState([]); // { id, w, h, x, y, label, massKg }
  const [selectedId, setSelectedId] = useState(null);

  // --- Payload Builder Presentational Props ---
  const payloadPresets = [
    { label: "Camera", w: 2, h: 2, massKg: 3.2 },
    { label: "µLab", w: 3, h: 2, massKg: 5.8 },
    { label: "Comms", w: 2, h: 1, massKg: 1.1 },
    { label: "Battery", w: 1, h: 2, massKg: 2.4 },
    { label: "AI Module", w: 2, h: 2, massKg: 2.7 },
  ];

  function handleBayWidthChange(e) {
    setBayWidth(Number(e.target.value));
  }
  function handleBayHeightChange(e) {
    setBayHeight(Number(e.target.value));
  }
  function handleAddPreset(preset) {
    addPayloadPreset(preset);
  }
  function handleGridClick(e) {
    if (e.target.classList.contains("aspect-[2/1]")) setSelectedId(null);
  }
  function handleCellClick(x, y) {
    const found = [...payloadItems].reverse().find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
    setSelectedId(found?.id ?? null);
  }
  function handleMoveSelected(dx, dy) {
    if (!selectedId) return;
    setPayloadItems((ps) => {
      return ps.map((p) => {
        if (p.id !== selectedId) return p;
        let nx = Math.max(0, Math.min(bayWidth - p.w, p.x + dx));
        let ny = Math.max(0, Math.min(bayHeight - p.h, p.y + dy));
        // Check collision with others
        const others = ps.filter((o) => o.id !== p.id);
        const blocked = others.some((o) => rectsOverlap(nx, ny, p.w, p.h, o.x, o.y, o.w, o.h));
        if (blocked) return p; // ignore move if blocked
        return { ...p, x: nx, y: ny };
      });
    });
  }
  function handleRemoveSelected() {
    if (!selectedId) return;
    setPayloadItems((ps) => ps.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  }

  // These must come after payloadItems is declared
  const selectedLabel = payloadItems.find((p) => p.id === selectedId)?.label;
  const showSelected = !!selectedId;
  // --- Request Form State ---
  const [form, setForm] = useState({
    material: "",
    amount: "",
    unit: "g",
    priority: "Normal",
    notes: "",
  });
  const cost = useMemo(() => estimateRequestCost({ amount: form.amount, priority: form.priority }), [form.amount, form.priority]);

  function handleFormChange(next) {
    setForm(next);
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.material || !form.amount) return alert("Material and amount required");
    addRequest(form);
    setForm({ material: "", amount: "", unit: "g", priority: "Normal", notes: "" });
  }
  // --- Demo State (persisted to localStorage) ---
  const [credits, setCredits] = useState(250); // demo starting credits
  const [tier, setTier] = useState("Student"); // Student | Academic | Enterprise
  const [requests, setRequests] = useState([]); // { id, material, amount, unit, priority, notes, status }

  // --- Persistence ---
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("ts_dashboard_state") || "{}");
      if (typeof s.credits === "number") setCredits(s.credits);
      if (s.tier) setTier(s.tier);
      if (Array.isArray(s.requests)) setRequests(s.requests);
      if (typeof s.bayWidth === "number") setBayWidth(s.bayWidth);
      if (typeof s.bayHeight === "number") setBayHeight(s.bayHeight);
      if (Array.isArray(s.payloadItems)) setPayloadItems(s.payloadItems);
    } catch {}
  }, []);

  useEffect(() => {
    const s = { credits, tier, requests, bayWidth, bayHeight, payloadItems };
    localStorage.setItem("ts_dashboard_state", JSON.stringify(s));
  }, [credits, tier, requests, bayWidth, bayHeight, payloadItems]);

  // --- Derived values ---
  const capacityCells = useMemo(() => bayWidth * bayHeight, [bayWidth, bayHeight]);
  const usedCells = useMemo(
    () => payloadItems.reduce((acc, p) => acc + p.w * p.h, 0),
    [payloadItems]
  );
  const massKg = useMemo(
    () => payloadItems.reduce((acc, p) => acc + (p.massKg || 0), 0),
    [payloadItems]
  );

  // --- Request Form Logic ---
  function addRequest(formData) {
    const id = crypto.randomUUID();
    const cost = estimateRequestCost(formData);
    if (credits < cost) {
      alert(`Not enough credits. This request costs ${cost} credits.`);
      return;
    }
    const newReq = {
      id,
      ...formData,
      status: "Pending Review",
    };
    setCredits((c) => c - cost);
    setRequests((rs) => [newReq, ...rs]);
  }

  function estimateRequestCost({ amount, priority }) {
    const base = 10; // base processing cost
    const amountFactor = Number(amount || 0) * 2; // simplistic demo pricing
    const priorityFactor = priority === "Urgent" ? 50 : priority === "High" ? 25 : 0;
    return Math.max(5, Math.round(base + amountFactor + priorityFactor));
  }

  function cancelRequest(id) {
    setRequests((rs) => rs.filter((r) => r.id !== id));
  }

  // --- Credit / Tier ---
  function buyCredits(qty = 100) {
    setCredits((c) => c + qty);
  }

  function changeTier(next) {
    setTier(next);
    // In a real app, tier could adjust monthly credits & limits.
  }

  // --- Payload Builder Logic ---
  function addPayloadPreset(preset) {
    const id = crypto.randomUUID();
    const newItem = { id, ...preset, x: 0, y: 0 };
    // Snap into first available spot
    const spot = findFirstFit(newItem, payloadItems, bayWidth, bayHeight);
    if (!spot) {
      alert("No space available for this module at current bay size.");
      return;
    }
    newItem.x = spot.x;
    newItem.y = spot.y;
    setPayloadItems((ps) => [...ps, newItem]);
  }

  function findFirstFit(item, items, W, H) {
    outer: for (let y = 0; y <= H - item.h; y++) {
      for (let x = 0; x <= W - item.w; x++) {
        const collision = items.some((p) =>
          rectsOverlap(x, y, item.w, item.h, p.x, p.y, p.w, p.h)
        );
        if (!collision) return { x, y };
      }
    }
    return null;
  }

  function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
  }

  function moveSelected(dx, dy) {
    if (!selectedId) return;
    setPayloadItems((ps) =>
      ps.map((p) => {
        if (p.id !== selectedId) return p;
        let nx = Math.max(0, Math.min(bayWidth - p.w, p.x + dx));
        let ny = Math.max(0, Math.min(bayHeight - p.h, p.y + dy));
        // Check collision with others
        const others = ps.filter((o) => o.id !== p.id);
        const blocked = others.some((o) => rectsOverlap(nx, ny, p.w, p.h, o.x, o.y, o.w, o.h));
        if (blocked) return p; // ignore move if blocked
        return { ...p, x: nx, y: ny };
      })
    );
  }

  function removeSelected() {
    if (!selectedId) return;
    setPayloadItems((ps) => ps.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  }

  // Keyboard movement for selected item
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedId) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Delete", "Backspace"].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowUp") moveSelected(0, -1);
      if (e.key === "ArrowDown") moveSelected(0, 1);
      if (e.key === "ArrowLeft") moveSelected(-1, 0);
      if (e.key === "ArrowRight") moveSelected(1, 0);
      if (e.key === "Delete" || e.key === "Backspace") removeSelected();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, bayWidth, bayHeight, payloadItems]);

  return (
    <div className="min-h-screen bg-neutral-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Header tier={tier} credits={credits} onBuy={() => buyCredits(200)} onChangeTier={changeTier} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-h-[600px]">
          {/* LEFT: Requests Form + Recent Requests */}
          <section className="lg:col-span-1 space-y-6 pt-6 flex flex-col">
            <RequestForm
              form={form}
              onFormChange={handleFormChange}
              onSubmit={handleFormSubmit}
              cost={cost}
            />
            <RequestsTable requests={requests} onCancel={cancelRequest} />
          </section>
          {/* RIGHT: Payload Builder only */}
          <section className="lg:col-span-2 flex flex-col gap-6 pt-6 h-full">
            <PayloadBuilder
              bayWidth={bayWidth}
              bayHeight={bayHeight}
              onBayWidthChange={handleBayWidthChange}
              onBayHeightChange={handleBayHeightChange}
              items={payloadItems}
              selectedId={selectedId}
              onCellClick={handleCellClick}
              onGridClick={handleGridClick}
              presets={payloadPresets}
              onAddPreset={handleAddPreset}
              usedCells={usedCells}
              capacityCells={capacityCells}
              massKg={massKg}
              showSelected={showSelected}
              selectedLabel={selectedLabel}
              onMoveSelected={handleMoveSelected}
              onRemoveSelected={handleRemoveSelected}
            />
          </section>
        </div>
      </div>
    </div>
  );
}



function moveItems(setItems, selectedId, dx, dy, W, H) {
  setItems((ps) =>
    ps.map((p, _, arr) => {
      if (p.id !== selectedId) return p;
      let nx = Math.max(0, Math.min(W - p.w, p.x + dx));
      let ny = Math.max(0, Math.min(H - p.h, p.y + dy));
      const others = arr.filter((o) => o.id !== p.id);
      const blocked = others.some((o) => !(nx + p.w <= o.x || o.x + o.w <= nx || ny + p.h <= o.y || o.y + o.h <= ny));
      if (blocked) return p;
      return { ...p, x: nx, y: ny };
    })
  );
}

function removeItem(setItems, id) {
  setItems((ps) => ps.filter((p) => p.id !== id));
}

