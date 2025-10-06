"use client";

import React, { useRef, useState, useMemo } from "react";

export function Grid({ W, H, items, onCellClick, selectedId, draggingId, onDragStart, onDragOver, onDragEnd }) {
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
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd(e);
      }}
    >
      {cells}
      {items.map((p, idx) => (
        <div
          key={p.id + '-' + idx}
          style={{
            gridColumn: `${p.x + 1} / span ${p.w}`,
            gridRow: `${p.y + 1} / span ${p.h}`,
          }}
          className={`relative m-[2px] flex items-center justify-center rounded-lg border text-xs cursor-move
            ${selectedId === p.id
              ? "border-emerald-500 bg-emerald-500/20"
              : "border-neutral-600 bg-neutral-700/60 hover:border-neutral-500"}
            ${draggingId === p.id ? "opacity-50" : ""}`
          }
          draggable="true"
          onClick={(e) => {
            e.stopPropagation();
            onCellClick(p.x, p.y);
          }}
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', ''); // Required for Firefox
            onDragStart(e, p.id);
          }}
          onDragEnd={(e) => {
            e.preventDefault();
            onDragEnd(e);
          }}
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

export function PayloadBuilder({
  bayWidth,
  bayHeight,
  onBayWidthChange,
  onBayHeightChange,
  items,
  selectedId,
  draggingId,
  onCellClick,
  onGridClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  presets,
  onAddPreset,
  usedCells,
  capacityCells,
  massKg,
  showSelected,
  selectedLabel,
  onMoveSelected,
  onRemoveSelected,
  // ...existing code...
}) {
  return (
    <Card title="Payload Builder" subtitle={`Used ${usedCells}/${capacityCells} cells · Mass ${massKg.toFixed(1)} kg`}>
      <div className="mb-4 w-full max-w-6xl mx-auto grid grid-cols-1 gap-4 md:grid-cols-[420px,1fr]">
        {/* Presets */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <p className="mb-2 text-sm font-medium">Modules</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.id || p.name}
                onClick={() => onAddPreset(p)}
                className="rounded-xl border-2 border-blue-500 bg-blue-900 px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title={`${p.w}x${p.h} · ${p.massKg} kg`}
              >
                {p.name}
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
        <div className="w-full flex flex-col justify-center">
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
              draggingId={draggingId}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
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

export function Header({ tier, credits, credits_available, onBuy, onChangeTier, planOptions, subscriptionPlan }) {
  const [open, setOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  // Fallback planOptions if not provided
  const loadedPlanOptions = Array.isArray(planOptions) && planOptions.length > 0
    ? planOptions
    : [
        { id: 1, name: "Free", perks: "Basic access" },
        { id: 2, name: "Pro", perks: "More credits, advanced features" },
        { id: 3, name: "Enterprise", perks: "Custom solutions" }
      ];

  // Helper to get selected plan option name for display
  // Track selected plan id locally for instant UI update
  const [selectedPlanId, setSelectedPlanId] = useState(
    (subscriptionPlan && typeof subscriptionPlan.plan_option_id !== 'undefined')
      ? subscriptionPlan.plan_option_id
      : (loadedPlanOptions.length > 0 ? loadedPlanOptions[0].id : 1)
  );

  React.useEffect(() => {
    if (subscriptionPlan && typeof subscriptionPlan.plan_option_id !== 'undefined') {
      setSelectedPlanId(subscriptionPlan.plan_option_id);
    }
  }, [subscriptionPlan]);

  function getSelectedPlanOptionName() {
    const found = loadedPlanOptions.find(p => p.id === selectedPlanId);
    if (found) return found.name;
    if (tier && loadedPlanOptions.some(p => p.name === tier)) return tier;
    if (loadedPlanOptions.length > 0) return loadedPlanOptions[0].name;
    return "Free";
  }
  return (
    <Card title="Mission Control Dashboard" subtitle="Design experiments, manage credits, and pack your education satellite payload.">
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <div className="relative">
          <button
            className="rounded-xl bg-emerald-600/20 px-4 py-2 text-base text-emerald-300 ring-1 ring-inset ring-emerald-600/40 font-medium flex items-center gap-2"
            onClick={() => setOpen((v) => !v)}
          >
            {getSelectedPlanOptionName()} Plan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {open && (
            <div ref={dropdownRef} className="absolute left-0 mt-2 w-48 rounded-lg bg-neutral-900 border border-neutral-700 shadow-lg z-10">
              {loadedPlanOptions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setOpen(false); setSelectedPlanId(p.id); onChangeTier(p.id); }}
                  className={`w-full text-left px-4 py-2 text-base ${tier === p.name ? "bg-emerald-600/20 text-emerald-200" : "hover:bg-neutral-800 text-neutral-200"}`}
                  title={p.perks}
                >
                  {p.name} <span className="block text-xs text-neutral-400">{p.perks}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="rounded-xl bg-neutral-700 px-3 py-1 text-sm">Credits: <strong>{typeof credits_available !== 'undefined' ? credits_available : credits}</strong></span>
        <button onClick={() => setShowPayment(true)} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400 focus:outline-none">
          Buy {subscriptionPlan?.credits_to_buy || 200} Credits
        </button>
      </div>
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Confirm Payment</h2>
            <p className="mb-4 text-neutral-800">You are about to buy <strong>{subscriptionPlan?.credits_to_buy || 200}</strong> credits for your account.</p>
            <button
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold mb-2 hover:bg-indigo-500"
              onClick={() => { setShowPayment(false); onBuy && onBuy(); }}
            >
              Confirm Payment
            </button>
            <button
              className="bg-neutral-300 text-neutral-700 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-200"
              onClick={() => setShowPayment(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function SubscriptionCard({ subscriptionPlan, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Card title="Subscription Plan" subtitle="Adjust your plan settings and billing preferences.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-neutral-300">
            Plan Name
            <input
              name="name"
              value={subscriptionPlan.name}
              onChange={onChange}
              placeholder="Pro"
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-neutral-300">
            Monthly Price ($)
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              value={subscriptionPlan.price}
              onChange={onChange}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Plan Features
          <textarea
            name="features"
            value={subscriptionPlan.features}
            onChange={onChange}
            rows={3}
            placeholder="List perks and capabilities"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-300">
          Status
          <select
            name="status"
            value={subscriptionPlan.status}
            onChange={onChange}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Save Plan
          </button>
        </div>
      </form>
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
      <form className="space-y-3" onSubmit={e => e.preventDefault()}>
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







// Experiment and Program File entering


function FileUpload({ MAX_FILES, MAX_SIZE_MB, files, setFiles }) {
    const fileInputRef = useRef();
    const [error, setError] = useState('');

  const handleFiles = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Enforce max 5 files total
    if (selectedFiles.length + files.length > 5) {
      setError('You can upload up to 5 files.');
      return;
    }
    // Enforce each file <= 10MB
    for (let file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Each file must be less than 10 MB.');
        return;
      }
    }
    // Convert files to base64 for saving
    const filesWithData = await Promise.all(selectedFiles.map(async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            base64: reader.result.split(',')[1] // remove data:...;base64,
          });
        };
        reader.readAsDataURL(file);
      });
    }));
    setFiles([...files, ...filesWithData]);
    setError('');
  };

    const removeFile = (index) => {
        const newFiles = files.slice();
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    return (
        <div className="flex flex-col">
            <label className="mb-2 font-semibold">Upload Files</label>
      <input
        type="file"
        multiple={true}
        ref={fileInputRef}
        onChange={handleFiles}
        className="block w-fit cursor-pointer rounded bg-gray-100 px-4 py-2 text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 transition"
        accept="*"
      />
            {error && <div className="text-red-600 mt-2">{error}</div>}
            <ul className="mt-2">
                {files.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <button
                            type="button"
                            className="text-red-500 ml-2"
                            onClick={() => removeFile(idx)}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
      <div className="text-sm text-neutral-500 mt-1">
        Max 5 files, each ≤ 10MB
      </div>
        </div>
    );
}

export function ExperimentCard({
  experiment,
  onExperimentChange,
  onExperimentSubmit,
  files,
  setFiles,
  maxFiles = 5,
  maxSizeMB = 10
}) {
  return (
    <Card title={"Request Experiments"} subtitle={"Enter required programming and experiment data. "}>
      <form className="flex flex-col gap-4 w-full" onSubmit={e => e.preventDefault()}>
        <div className="flex flex-col">
          <label htmlFor="experimentName" className="mb-2 font-semibold">Experiment Name</label>
          <input
            type="text"
            id="experimentName"
            name="experimentName"
            className="p-2 border border-neutral-300 rounded w-full"
            required
            value={experiment.experimentName}
            onChange={e => onExperimentChange({ ...experiment, experimentName: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="description" className="mb-2 font-semibold">Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            className="p-2 border border-neutral-300 rounded w-full"
            required
            value={experiment.description}
            onChange={e => onExperimentChange({ ...experiment, description: e.target.value })}
          ></textarea>
        </div>
        <div className="flex flex-col">
          <label htmlFor="experimentType" className="mb-2 font-semibold">Experiment Type</label>
          <textarea
            id="experimentType"
            name="experimentType"
            rows="3"
            className="p-2 border border-neutral-300 rounded w-full"
            required
            value={experiment.experimentType}
            onChange={e => onExperimentChange({ ...experiment, experimentType: e.target.value })}
          ></textarea>
        </div>
        <div className="flex flex-col">
          <label htmlFor="ModulesNeeded" className="mb-2 font-semibold">Modules Needed</label>
          <textarea
            id="ModulesNeeded"
            name="ModulesNeeded"
            rows="2"
            className="p-2 border border-neutral-300 rounded w-full"
            required
            value={experiment.ModulesNeeded}
            onChange={e => onExperimentChange({ ...experiment, ModulesNeeded: e.target.value })}
          ></textarea>
        </div>
        <FileUpload MAX_FILES={maxFiles} MAX_SIZE_MB={maxSizeMB} files={files} setFiles={setFiles} />
        {/* Submit button removed; submission handled in dashboard/page.js */}
      </form>
    </Card>
  );
}

export function AboutCard() {
  return (
    <Card title="About Us">
      <div className="text-base text-neutral-200 p-2 w-full max-w-4xl mx-auto">
        We are Tungsten Cube...a team of high-schoolers who are a part of a FIRST Robotics Competition team called YETI Robotics, which is underneath a 501(c)(3) Non-Profit organization called Queen City Robotics Alliance based in Charlotte, North Carolina.
      </div>
    </Card>
  );
}

export function AboutProjectCard() {
  return (
    <Card title="About Our Project">
      <div className="text-base text-neutral-200 p-2 w-full max-w-4xl mx-auto">
        Tungsten Orbit is a solar system modeling application that allows users to see major objects in the solar system and learn facts about them, including orbit path, classification, and more. We use real-time NASA data libraries to provide accurate orbital layouts for educational and informational purposes. Our goal was to create a user-friendly program that was easy to understand and fun. We hope you enjoy our program!
      </div>
    </Card>
  );
}

export function ContactCard({ onSubmit, message, onMessageChange, sent, userEmail, onSendAnother }) {
  return (
    <Card title="Contact Us">
      <p className="mb-6 text-neutral-400">
        Have questions, feedback, or want to get in touch? Fill out the form below.
      </p>
      {userEmail && (
        <div className="mb-4 text-sm text-neutral-400">
          Your email: <span className="text-emerald-400">{userEmail}</span>
        </div>
      )}
      {sent ? (
        <div className="flex flex-col items-start gap-4">
          <div className="text-emerald-400 font-semibold">Thank you for your message!</div>
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded transition"
            onClick={onSendAnother}
            type="button"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col">
            <label htmlFor="message" className="mb-1 font-semibold">Message</label>
            <textarea id="message" name="message" rows={5} className="p-2 border border-neutral-700 rounded bg-neutral-900 text-white" required value={message} onChange={onMessageChange}></textarea>
          </div>
          <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded transition">Send Message</button>
        </form>
      )}
    </Card>
  );
}

export function LoginCard({
  mode,
  onModeChange,
  onSubmit,
  emailRef,
  passwordRef,
  messageRef,
  submitBtnRef,
}) {
  const isLogin = mode === "login";

  return (
    <Card>
      <h2 className="text-neutral-500 text-2xl font-semibold mb-4">
        {isLogin ? "Login" : "Create account"}
      </h2>

      <div ref={messageRef} className="min-h-[1.125rem] mb-2 text-sm" />

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-300 mb-2">Email</label>
          <input
            ref={emailRef}
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-2">Password</label>
          <input
            ref={passwordRef}
            type="password"
            minLength={6}
            required
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••"
          />
        </div>

        <button
          ref={submitBtnRef}
          type="submit"
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400 focus:outline-none"
        >
          {isLogin ? "Login" : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-sm text-neutral-400">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => onModeChange("register")}
              className="text-indigo-300 hover:underline ml-1"
              style={{ float: "right" }}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => onModeChange("login")}
              className="text-indigo-300 hover:underline ml-1"
              style={{ float: "right" }}
            >
              Login
            </button>
          </>
        )}
      </div>
    </Card>
  );
}

export function ProfileCard({
  nameSpanRef,
  emailSpanRef,
  isAdmin,
  newNameRef,
  changeNameBtnRef,
  onChangeName,
  currentPasswordRef,
  newPasswordRef,
  changePassBtnRef,
  onChangePassword,
  adminCodeRef,
  makeAdminBtnRef,
  onMakeAdmin,
  onRevokeAdmin,
  signOutBtnRef,
  onSignOut,
  deleteBtnRef,
  onDeleteAccount,
  messageRef,
}) {
  return (
    <Card title="My Profile" subtitle="Manage your profile here.">
      <hr className="border-neutral-800 my-2" />
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Display name</p>
              <p ref={nameSpanRef} className="text-lg text-white mb-2">
                —
              </p>
              <p className="text-sm text-neutral-400 mb-1">Email</p>
              <p ref={emailSpanRef} className="text-sm text-neutral-300 mb-2">
                —
              </p>
            </div>
            {isAdmin && (
              <span className="ml-auto inline-flex items-center rounded-lg bg-amber-600/20 px-3 py-1 text-sm text-amber-300 ring-1 ring-inset ring-amber-600/30">
                Admin
              </span>
            )}
          </div>
        </div>

        <form onSubmit={onChangeName} className="space-y-2">
          <label className="block text-sm text-neutral-300">New display name</label>
          <input
            ref={newNameRef}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your display name"
          />
          <div className="flex gap-2">
            <button
              ref={changeNameBtnRef}
              type="submit"
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400"
            >
              Update name
            </button>
          </div>
        </form>

        <hr className="border-neutral-800 my-2" />

        <form onSubmit={onChangePassword} className="space-y-2">
          <label className="block text-sm text-neutral-300">Current password</label>
          <input
            ref={currentPasswordRef}
            type="password"
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Current password"
          />
          <label className="block text-sm text-neutral-300">New password</label>
          <input
            ref={newPasswordRef}
            type="password"
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="New password"
          />
          <div className="flex gap-2">
            <button
              ref={changePassBtnRef}
              type="submit"
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400"
            >
              Change password
            </button>
          </div>
        </form>

        <hr className="border-neutral-800 my-2" />

        <form onSubmit={onMakeAdmin} className="space-y-2">
          <label className="block text-sm text-neutral-300">Admin code (prototype)</label>
          <input
            ref={adminCodeRef}
            type="password"
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter admin code"
          />
          <div className="flex gap-2">
            <button
              ref={makeAdminBtnRef}
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
            >
              Make account admin
            </button>
            <button
              type="button"
              onClick={onRevokeAdmin}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm"
            >
              Revoke admin
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Prototype mode: admin flag is stored in browser localStorage only.
          </p>
        </form>

        <hr className="border-neutral-800 my-2" />

        <div className="flex gap-2">
          <button
            ref={signOutBtnRef}
            type="button"
            onClick={onSignOut}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm"
          >
            Sign out
          </button>
          <button
            ref={deleteBtnRef}
            type="button"
            onClick={onDeleteAccount}
            className="ml-auto rounded-lg bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-500"
          >
            Delete account
          </button>
        </div>

        <div ref={messageRef} className="min-h-[1rem] text-sm mt-2"></div>
      </div>
    </Card>
  );
}

export function DashboardCards({
  tier,
  credits,
  onBuy,
  onChangeTier,
  planOptions,
  subscriptionPlan,
  onSubscriptionPlanChange,
  onSubscriptionPlanSubmit,
  form,
  onFormChange,
  onSubmit,
  cost,
  experiment,
  onExperimentChange,
  onExperimentSubmit,
  files,
  setFiles,
  bayWidth,
  bayHeight,
  onBayWidthChange,
  onBayHeightChange,
  items,
  selectedId,
  draggingId,
  onCellClick,
  onGridClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  presets,
  onAddPreset,
  usedCells,
  capacityCells,
  massKg,
  showSelected,
  selectedLabel,
  onMoveSelected,
  onRemoveSelected,
  requests,
  onCancelRequest,
  canSubmit,
  onCombinedSubmit,
}) {
  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8">
      <div className="space-y-8">
        <Header
          tier={tier}
          credits={credits}
          onBuy={onBuy}
          onChangeTier={onChangeTier}
          planOptions={planOptions}
          subscriptionPlan={subscriptionPlan}
        />
        <section className="grid w-full gap-8 md:grid-cols-2">
          <SubscriptionCard
            subscriptionPlan={subscriptionPlan}
            onChange={onSubscriptionPlanChange}
            onSubmit={onSubscriptionPlanSubmit}
          />
          <RequestsTable requests={requests} onCancel={onCancelRequest} />
        </section>
        <section className="w-full flex flex-col gap-8">
          <RequestForm
            form={form}
            onFormChange={onFormChange}
            onSubmit={onSubmit}
            cost={cost}
          />
          <ExperimentCard
            experiment={experiment}
            onExperimentChange={onExperimentChange}
            onExperimentSubmit={onExperimentSubmit}
            files={files}
            setFiles={setFiles}
          />
        </section>
        <section className="w-full">
          <PayloadBuilder
            bayWidth={bayWidth}
            bayHeight={bayHeight}
            onBayWidthChange={onBayWidthChange}
            onBayHeightChange={onBayHeightChange}
            items={items}
            selectedId={selectedId}
            draggingId={draggingId}
            onCellClick={onCellClick}
            onGridClick={onGridClick}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            presets={presets}
            onAddPreset={onAddPreset}
            usedCells={usedCells}
            capacityCells={capacityCells}
            massKg={massKg}
            showSelected={showSelected}
            selectedLabel={selectedLabel}
            onMoveSelected={onMoveSelected}
            onRemoveSelected={onRemoveSelected}
          />
        </section>
        {/* Unified submit button at the end */}
        <div className="w-full flex justify-end pt-8">
          <button
            className={`bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition text-lg font-semibold ${
              !canSubmit ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onCombinedSubmit}
            disabled={!canSubmit}
          >
            Submit All Requests
          </button>
        </div>
      </div>
    </div>
  );
}
