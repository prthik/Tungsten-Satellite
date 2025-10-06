"use client";

import "../globals.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardCards } from "../../../components/card";
import { auth } from "../../lib/firebaseClient";

// DASHBOARD PAGE
// Drop this file at: src/app/dashboard/page.js (or app/dashboard/page.js)
// Assumes Tailwind is configured (based on your repo styles). No external deps.
// If you don't use Tailwind, the layout still works with minimal inline styles.

export default function DashboardPage() {
  // --- Plan Option State ---
  const [planOptionId, setPlanOptionId] = useState(1); // Default to 1 on load

  // --- Module Presets (dynamic from backend) ---
  const [payloadPresets, setPayloadPresets] = useState([]);

  // Fetch modules for current planOptionId
  async function fetchPresets(id) {
    console.log('[DEBUG] Fetching modules for planOptionId:', id);
    const res = await fetch(`/api/modules?plan_option_id=${id}`);
    const data = await res.json();
    console.log('[DEBUG] Modules fetched:', data.modules);
    setPayloadPresets(data.modules || []);
  }

  // Ensure modules are loaded when planOptionId changes (including initial load)
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered for planOptionId:', planOptionId);
    fetchPresets(planOptionId);
  }, [planOptionId]);

  // Plan option dropdown handler
  function handlePlanOptionChange(idOrEvent) {
    // Accept either a direct id (from Header) or an event (from select)
    let id = typeof idOrEvent === 'number' ? idOrEvent : Number(idOrEvent.target.value);
    console.log('[DEBUG] handlePlanOptionChange called with:', idOrEvent);
    console.log('[DEBUG] Plan option selected:', id);
    setPlanOptionId(id);
    // fetchPresets(id); // Now handled by useEffect
  }
  // --- Request Form State ---
  // SubscriptionPlan State
  const [subscriptionPlan, setSubscriptionPlan] = useState({
    name: "",
    price: 0,
    features: "",
    status: "active",
  });

  // --- Request Form State ---
  const [form, setForm] = useState({
    material: "",
    amount: "",
    unit: "g",
    priority: "Normal",
    notes: "",
  });
  const [experiment, setExperiment] = useState({
    experimentName: "",
    description: "",
    experimentType: "",
    ModulesNeeded: "",
  });
  const [experimentFiles, setExperimentFiles] = useState([]);
  // Dashboard plan and credits
  const [dashboardPlan, setDashboardPlan] = useState("Free");
  const [dashboardCredits, setDashboardCredits] = useState(250);

  // Helper: check if all fields are filled for both forms
  const allRequestFieldsFilled =
    form.material && form.amount && form.unit && form.priority;
  const allExperimentFieldsFilled =
    experiment.experimentName &&
    experiment.description &&
    experiment.experimentType &&
    experiment.ModulesNeeded;
  const canSubmit = allRequestFieldsFilled && allExperimentFieldsFilled;

  async function handleCombinedSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    // Calculate total cost
    const experimentCost = 50; // base cost for experiment
    const priorityCost =
      form.priority === "Urgent" ? 50 : form.priority === "High" ? 25 : 0;
    const totalCost = experimentCost + priorityCost;

    // Check if user has enough credits
    if (dashboardCredits < totalCost) {
      alert(
        `Not enough credits. This request costs ${totalCost} credits. You have ${dashboardCredits} credits.`
      );
      return;
    }

    // Get user email from Firebase auth
    const user = auth.currentUser;
    const userEmail = user?.email || "";

    // Deduct credits
    const newCredits = dashboardCredits - totalCost;
    setDashboardCredits(newCredits);

    // Build payload for all tables, including dashboard plan and credits
    const payload = {
      experiment: {
        name: experiment.experimentName,
        description: experiment.description,
        status: "pending approval",
        experimentType: experiment.experimentType,
        ModulesNeeded: experiment.ModulesNeeded,
        user_email: userEmail, // Use the correct field name user_email
        created_at: new Date().toISOString(),
      },
      subscription_plan: {
        name: subscriptionPlan.name,
        price: subscriptionPlan.price,
        features: subscriptionPlan.features,
        status: subscriptionPlan.status,
      },
      files: experimentFiles.map((f) => ({
        filename: f.name,
        data: f.base64 || "",
      })),
      payload_builder: {
        name: "Builder-" + experiment.experimentName,
        bay_width: bayWidth,
        bay_height: bayHeight,
        items: payloadItems.map((item) => ({
          module_id: item.module_id || 0,
          x: item.x,
          y: item.y,
          label: item.label,
          massKg: item.massKg || 0.0,
        })),
        created_at: new Date().toISOString(),
      },
      builder_items: payloadItems.map((item) => ({
        module_id: item.module_id || 0,
        x: item.x,
        y: item.y,
        label: item.label,
        massKg: item.massKg || 0.0,
      })),
      user: {
        username: Math.random() < 0.5 ? "NASA" : "SpaceX",
        pwd_hash: "",
        api_key_hash: "",
        credits: newCredits, // Store updated credits
        email: userEmail,
      },
      modules: payloadPresets.map(m => ({
        name: m.name || m.label,
        w: m.w,
        h: m.h,
        massKg: m.massKg
      })),
      dashboard_plan: dashboardPlan,
      dashboard_credits: newCredits, // Store updated credits
    };
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        alert(
          "Experiment and related data saved! Experiment ID: " +
            data.experiment_id
        );
        setExperiment({
          experimentName: "",
          description: "",
          experimentType: "",
          ModulesNeeded: "",
        });
        setExperimentFiles([]);
      } else {
        // Show error in a scrollable modal for long error messages
        const errorMsg = "Failed to save: " + (data.error || "unknown error");
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.background = "rgba(0,0,0,0.6)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "9999";
        const inner = document.createElement("div");
        inner.style.background = "#222";
        inner.style.color = "#fff";
        inner.style.padding = "2rem";
        inner.style.borderRadius = "1rem";
        inner.style.maxWidth = "90vw";
        inner.style.maxHeight = "60vh";
        inner.style.overflowY = "auto";
        inner.style.fontSize = "1rem";
        inner.innerText = errorMsg;
        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Close";
        closeBtn.style.marginTop = "1rem";
        closeBtn.style.background = "#444";
        closeBtn.style.color = "#fff";
        closeBtn.style.padding = "0.5rem 1.5rem";
        closeBtn.style.border = "none";
        closeBtn.style.borderRadius = "0.5rem";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => document.body.removeChild(modal);
        inner.appendChild(document.createElement("br"));
        inner.appendChild(closeBtn);
        modal.appendChild(inner);
        document.body.appendChild(modal);
      }
    } catch (err) {
      alert("Error saving: " + String(err));
    }
  }
  // (removed duplicate experiment state)

  function handleExperimentChange(next) {
    setExperiment(next);
  }

  function handleExperimentSubmit(e) {
    e.preventDefault();
    // For demo: just alert and reset
    if (!experiment.experimentName || !experiment.description) {
      alert("Experiment Name and Description required");
      return;
    }
    alert("Experiment Created!\n" + JSON.stringify(experiment, null, 2));
    setExperiment({
      experimentName: "",
      description: "",
      experimentType: "",
      ModulesNeeded: "",
    });
    setExperimentFiles([]);
  }

  // --- Payload Builder State (must be first for logic below) ---
  const [bayWidth, setBayWidth] = useState(8); // grid columns
  const [bayHeight, setBayHeight] = useState(5); // grid rows
  const [payloadItems, setPayloadItems] = useState([]); // { id, w, h, x, y, label, massKg }
  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Derived value: is any payload item selected?
  const showSelected = !!selectedId;


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

  function handleDragStart(e, id) {
    const item = payloadItems.find(p => p.id === id);
    if (!item) return;

    // Calculate drag offset relative to the item's top-left corner
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width;
    const offsetY = (e.clientY - rect.top) / rect.height;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggingId(id);
    setSelectedId(id);
  }

  function handleDragOver(e) {
    if (!draggingId) return;

    const item = payloadItems.find(p => p.id === draggingId);
    if (!item) return;

    const gridRect = e.currentTarget.getBoundingClientRect();
    const cellWidth = gridRect.width / bayWidth;
    const cellHeight = gridRect.height / bayHeight;

    // Calculate grid position accounting for the drag offset
    const rawX = (e.clientX - gridRect.left - (dragOffset.x * item.w * cellWidth)) / cellWidth;
    const rawY = (e.clientY - gridRect.top - (dragOffset.y * item.h * cellHeight)) / cellHeight;
    
    // Round to nearest grid position
    const x = Math.round(rawX);
    const y = Math.round(rawY);

    setPayloadItems(ps => {
      return ps.map(p => {
        if (p.id !== draggingId) return p;
        
        // Ensure we stay within bounds
        const nx = Math.max(0, Math.min(bayWidth - p.w, x));
        const ny = Math.max(0, Math.min(bayHeight - p.h, y));

        // Check collision with others
        const others = ps.filter(o => o.id !== draggingId);
        const blocked = others.some(o =>
          rectsOverlap(nx, ny, p.w, p.h, o.x, o.y, o.w, o.h)
        );
        
        if (blocked) return p;
        if (nx === p.x && ny === p.y) return p; // Don't update if position hasn't changed
        return { ...p, x: nx, y: ny };
      });
    });
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  // Update cell click to select items directly
  function handleCellClick(x, y) {
    const found = [...payloadItems]
      .reverse()
      .find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
      
    // If we click an item, select it. If we click again on the same item, deselect it
    if (found && found.id === selectedId) {
      setSelectedId(null);
    } else {
      setSelectedId(found?.id ?? null);
    }
  }

  const handleMoveSelected = useCallback(
    (dx, dy) => {
      if (!selectedId) return;
      setPayloadItems((ps) => {
        return ps.map((p) => {
          if (p.id !== selectedId) return p;
          const nx = Math.max(0, Math.min(bayWidth - p.w, p.x + dx));
          const ny = Math.max(0, Math.min(bayHeight - p.h, p.y + dy));
          const others = ps.filter((o) => o.id !== p.id);
          const blocked = others.some((o) =>
            rectsOverlap(nx, ny, p.w, p.h, o.x, o.y, o.w, o.h)
          );
          if (blocked) return p;
          return { ...p, x: nx, y: ny };
        });
      });
    },
    [selectedId, bayWidth, bayHeight]
  );

  const handleRemoveSelected = useCallback(() => {
    if (!selectedId) return;
    setPayloadItems((ps) => ps.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  // These must come after payloadItems is declared
  const selectedLabel = payloadItems.find((p) => p.id === selectedId)?.label;
  // ...existing code...
  // (removed duplicate form state)
  const cost = useMemo(
    () => estimateRequestCost({ amount: form.amount, priority: form.priority }),
    [form.amount, form.priority]
  );

  function handleFormChange(next) {
    setForm(next);
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.material || !form.amount)
      return alert("Material and amount required");
    addRequest(form);
    setForm({
      material: "",
      amount: "",
      unit: "g",
      priority: "Normal",
      notes: "",
    });
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
  const capacityCells = useMemo(
    () => bayWidth * bayHeight,
    [bayWidth, bayHeight]
  );
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
    const priorityFactor =
      priority === "Urgent" ? 50 : priority === "High" ? 25 : 0;
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
  const newItem = { id, ...preset, x: 0, y: 0, label: preset.name };
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

  // Keyboard movement for selected item
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedId) return;
      const handledKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Delete",
        "Backspace",
      ];
      if (handledKeys.includes(e.key)) e.preventDefault();
      if (e.key === "ArrowUp") handleMoveSelected(0, -1);
      if (e.key === "ArrowDown") handleMoveSelected(0, 1);
      if (e.key === "ArrowLeft") handleMoveSelected(-1, 0);
      if (e.key === "ArrowRight") handleMoveSelected(1, 0);
      if (e.key === "Delete" || e.key === "Backspace") handleRemoveSelected();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, handleMoveSelected, handleRemoveSelected]);

  // Plan options for dropdown
  const planOptions = [
    { id: 1, name: "Free", perks: "Basic access" },
    { id: 2, name: "Pro", perks: "More credits, advanced features" },
    { id: 3, name: "Enterprise", perks: "Custom solutions" },
  ];

  function handleSubscriptionPlanChange(e) {
    const { name, value } = e.target;
    setSubscriptionPlan((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? Number(value)
          : name === "plan_option_id"
          ? Number(value)
          : value,
    }));
  }

  return (
    <DashboardCards
      tier={tier}
      credits={credits}
      onBuy={() => buyCredits(200)}
      onChangeTier={handlePlanOptionChange}
      planOptions={planOptions}
      subscriptionPlan={subscriptionPlan}
      form={form}
      onFormChange={handleFormChange}
      onSubmit={handleFormSubmit}
      cost={cost}
      experiment={experiment}
      onExperimentChange={handleExperimentChange}
      onExperimentSubmit={handleExperimentSubmit}
      files={experimentFiles}
      setFiles={setExperimentFiles}
      bayWidth={bayWidth}
      bayHeight={bayHeight}
      onBayWidthChange={handleBayWidthChange}
      onBayHeightChange={handleBayHeightChange}
      items={payloadItems}
      selectedId={selectedId}
      draggingId={draggingId}
      onCellClick={handleCellClick}
      onGridClick={handleGridClick}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      presets={payloadPresets}
      onAddPreset={handleAddPreset}
      usedCells={usedCells}
      capacityCells={capacityCells}
      massKg={massKg}
      showSelected={showSelected}
      selectedLabel={selectedLabel}
      onMoveSelected={handleMoveSelected}
      onRemoveSelected={handleRemoveSelected}
      canSubmit={canSubmit}
      onCombinedSubmit={handleCombinedSubmit}
    />
  );
}
