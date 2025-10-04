
"use client";

import "../globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Card, { Header, Badge, RequestForm, SubscriptionCard, RequestsTable } from "../../../components/card";

// DASHBOARD PAGE
// Drop this file at: src/app/dashboard/page.js (or app/dashboard/page.js)
// Assumes Tailwind is configured (based on your repo styles). No external deps.
// If you don't use Tailwind, the layout still works with minimal inline styles.

export default function DashboardPage() {
  // --- Demo State (persisted to localStorage) ---
  const [credits, setCredits] = useState(250); // demo starting credits
  const [tier, setTier] = useState("Student"); // Student | Academic | Enterprise
  const [requests, setRequests] = useState([]); // { id, material, amount, unit, priority, notes, status }

  // Payload builder state
  const [bayWidth, setBayWidth] = useState(8); // grid columns
  const [bayHeight, setBayHeight] = useState(5); // grid rows
  const [payloadItems, setPayloadItems] = useState([]); // { id, w, h, x, y, label, massKg }
  const [selectedId, setSelectedId] = useState(null);

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
  <Header tier={tier} credits={credits} onBuy={() => buyCredits(200)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Requests & Subscription */}
          <section className="lg:col-span-1 space-y-6">
            <RequestForm onSubmit={addRequest} estimateCost={estimateRequestCost} />
            <SubscriptionCard tier={tier} onChangeTier={changeTier} />
          </section>

          {/* RIGHT: Payload Builder + Requests List */}
          <section className="lg:col-span-2 space-y-6">
            <PayloadBuilder
              bayWidth={bayWidth}
              bayHeight={bayHeight}
              setBayWidth={setBayWidth}
              setBayHeight={setBayHeight}
              items={payloadItems}
              setItems={setPayloadItems}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              addPreset={addPayloadPreset}
              usedCells={usedCells}
              capacityCells={capacityCells}
              massKg={massKg}
            />

            <RequestsTable requests={requests} onCancel={cancelRequest} />
          </section>
        </div>
      </div>
  </div>
  );
}


function PayloadBuilder({
  bayWidth,
  bayHeight,
  setBayWidth,
  setBayHeight,
  items,
  setItems,
  selectedId,
  setSelectedId,
  addPreset,
  usedCells,
  capacityCells,
  massKg,
}) {
  const gridRef = useRef(null);

  function onGridClick(e) {
    // Deselect if empty space
    if (e.target === gridRef.current) setSelectedId(null);
  }

  function clickCell(x, y) {
    // Select the top-most module at this cell
    const found = [...items].reverse().find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
    setSelectedId(found?.id ?? null);
  }

  const presets = [
    { label: "Camera", w: 2, h: 2, massKg: 3.2 },
    { label: "µLab", w: 3, h: 2, massKg: 5.8 },
    { label: "Comms", w: 2, h: 1, massKg: 1.1 },
    { label: "Battery", w: 1, h: 2, massKg: 2.4 },
    { label: "AI Module", w: 2, h: 2, massKg: 2.7 },
  ];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-800/60 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Payload Builder</h2>
        <div className="text-sm text-neutral-300">
          Used {usedCells}/{capacityCells} cells · Mass {massKg.toFixed(1)} kg
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[280px,1fr]">
        {/* Presets */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <p className="mb-2 text-sm font-medium">Modules</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => addPreset(p)}
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
                onChange={(e) => setBayWidth(Number(e.target.value))}
                className="w-16 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
              />
              <label className="text-xs text-neutral-300">H</label>
              <input
                type="number"
                min={3}
                max={12}
                value={bayHeight}
                onChange={(e) => setBayHeight(Number(e.target.value))}
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
            ref={gridRef}
            onClick={onGridClick}
            className="relative aspect-[2/1] w-full select-none overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-2"
          >
            <Grid
              W={bayWidth}
              H={bayHeight}
              items={items}
              onCellClick={clickCell}
              selectedId={selectedId}
            />
          </div>
        </div>
      </div>

      {selectedId && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm">
          <span className="text-neutral-300">Selected: {items.find((p) => p.id === selectedId)?.label}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => moveItems(setItems, selectedId, 0, -1, bayWidth, bayHeight)} className="rounded-lg border border-neutral-700 px-3 py-1">↑</button>
            <button onClick={() => moveItems(setItems, selectedId, 0, 1, bayWidth, bayHeight)} className="rounded-lg border border-neutral-700 px-3 py-1">↓</button>
            <button onClick={() => moveItems(setItems, selectedId, -1, 0, bayWidth, bayHeight)} className="rounded-lg border border-neutral-700 px-3 py-1">←</button>
            <button onClick={() => moveItems(setItems, selectedId, 1, 0, bayWidth, bayHeight)} className="rounded-lg border border-neutral-700 px-3 py-1">→</button>
            <button onClick={() => removeItem(setItems, selectedId)} className="rounded-lg border border-rose-700 bg-rose-900/30 px-3 py-1 hover:border-rose-600">Remove</button>
          </div>
        </div>
      )}
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

function Grid({ W, H, items, onCellClick, selectedId }) {
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
            {p.label}\n{p.w}x{p.h} · {p.massKg} kg
          </span>
        </div>
      ))}
    </div>
  );
}
