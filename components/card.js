"use client";

import Link from "next/link";
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


export default function Card({
  title,
  subtitle,
  number,
  children,
  className = "",
  highlight,
}) {
  const borderClass = highlight?.borderClassName || "border-neutral-500";
  const backgroundClass = highlight?.backgroundClassName || "bg-neutral-950";
  const titleColor = highlight?.titleColorClassName || "text-neutral-500";
  const subtitleColor =
    highlight?.subtitleColorClassName || "text-neutral-400";
  const titleClass =
    highlight?.titleClassName ||
    `${titleColor} text-2xl font-semibold mb-2`;
  const subtitleClass =
    highlight?.subtitleClassName ||
    `${subtitleColor} text-base mb-2`;
  return (
    <div className={`${backgroundClass} p-6 rounded-lg border ${borderClass} flex flex-col ${className}`}>
      {title && <span className={titleClass}>{title}</span>}
      {typeof number !== 'undefined' && <span className="text-3xl my-4">{number}</span>}
      {subtitle && <span className={subtitleClass}>{subtitle}</span>}
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
          <label className="block text-sm text-neutral-300">Admin code (temporary password: metaldetector)</label>
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

export function ReportsCard({
  title = "My Experiments",
  subtitle = "View your experiment requests and their status.",
  statusFilter,
  onStatusFilterChange,
  requests,
  onViewDetails,
}) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-neutral-400">Filter by Status:</label>
        <select
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-neutral-200"
          onChange={(e) => onStatusFilterChange(e.target.value)}
          value={statusFilter}
        >
          <option value="all">All Statuses</option>
          <option value="pending approval">Pending Approval</option>
          <option value="experiment queued">Experiment Queued</option>
          <option value="experiment completed">Experiment Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="mt-4">
        {requests.length === 0 ? (
          <div className="text-neutral-400 p-6 text-center">
            No experiments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-300 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-neutral-200">
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-800 hover:bg-neutral-900/30"
                  >
                    <td className="px-4 py-3 align-middle">{r.name}</td>
                    <td className="px-4 py-3 align-middle">
                      {r.experimentType || "N/A"}
                    </td>
                    <td className="px-4 py-3 align-middle">{r.status}</td>
                    <td className="px-4 py-3 align-middle text-neutral-400">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        onClick={() => onViewDetails(r)}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-500"
                        type="button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

export function HomeNavCards({ cards }) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const highlight = card.highlight;
          const iconClass = highlight?.iconClassName || "text-neutral-200";
          const titleBaseClass =
            highlight?.titleClassName || "text-neutral-300";
          const titleHoverClass =
            highlight?.titleHoverClassName || "group-hover:text-neutral-300";
          const subtitleClass = [
            "text-left text-sm",
            highlight?.subtitleClassName || "text-neutral-400",
            highlight?.subtitleHoverClassName || "",
          ]
            .filter(Boolean)
            .join(" ");

          const linkProps = {
            className: "group flex flex-1 min-h-[160px] max-w-xs mx-auto",
          };

          const cardContent = (
            <Card
              className={highlight?.className}
              highlight={highlight}
            >
              <span className={`mb-2 ${iconClass}`}>{card.icon}</span>
              <span className={`text-xl font-semibold mb-1 ${titleBaseClass} ${titleHoverClass}`}>
                {card.title}
              </span>
              <span className={subtitleClass}>{card.description}</span>
            </Card>
          );

          if (card.external) {
            return (
              <a
                key={card.href || card.title}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                {...linkProps}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link key={card.href || card.title} href={card.href || "#"} {...linkProps}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ReportDetailsModal({ request, onClose, onDownloadFile }) {
  if (!request) return null;

  let payload = null;
  try {
    if (request.payload) payload = JSON.parse(request.payload);
  } catch (_) {
    payload = null;
  }
  const builder = payload?.payload_builder;
  const items = payload?.builder_items || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-neutral-950 rounded-lg border border-neutral-700 p-6 max-h-[85vh] flex flex-col">
          <div className="flex items-start justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-white">{request.name}</h3>
              <p className="text-xs text-neutral-500">
                Submitted:{" "}
                {request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : request.createdAt
                  ? new Date(request.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="h-px bg-neutral-800 my-4 flex-shrink-0" />

          <div className="flex-1 overflow-y-auto pr-2 text-sm text-neutral-300 space-y-4 modal-scroll">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Basic Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-neutral-400">ID</p>
                  <p className="font-medium">{request.id}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Status</p>
                  <p className="font-medium">{request.status}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Experiment Type</p>
                  <p className="font-medium">{request.experimentType || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Modules Needed</p>
                  <p className="font-medium">{request.ModulesNeeded || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Description</h4>
              <p className="whitespace-pre-wrap bg-neutral-900 p-3 rounded-md">
                {request.description || "No description provided"}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Status Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-neutral-400">Current Status</p>
                  <p className="font-medium">{request.status}</p>
                </div>
                {request.notes && (
                  <div className="col-span-2">
                    <p className="text-neutral-400">Notes</p>
                    <p className="font-medium">{request.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {payload && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-white">Payload Information</h4>
                <div className="space-y-6">
                  <div className="bg-neutral-900 p-4 rounded-md">
                    <h5 className="font-medium text-white mb-3">
                      Payload Builder Configuration
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-neutral-400 text-sm">Bay Name</p>
                        <p className="font-medium">{builder?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Created At</p>
                        <p className="font-medium">
                          {builder?.created_at
                            ? new Date(builder.created_at).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Bay Dimensions</p>
                        <p className="font-medium">
                          {builder?.bay_width || 0} × {builder?.bay_height || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-md">
                    <h5 className="font-medium text-white mb-3">Payload Items</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-800">
                            <th className="text-left py-2 px-3 text-neutral-400">Module</th>
                            <th className="text-left py-2 px-3 text-neutral-400">Position</th>
                            <th className="text-left py-2 px-3 text-neutral-400">Mass</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-800">
                              <td className="py-2 px-3">{item.label}</td>
                              <td className="py-2 px-3">x: {item.x}, y: {item.y}</td>
                              <td className="py-2 px-3">{item.massKg} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {request.files && request.files.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-white">Attached Files</h4>
                <ul className="list-disc list-inside">
                  {request.files.map((file, index) => (
                    <li key={index} className="text-neutral-400">
                      {file.filename}
                      {typeof file.size === "number"
                        ? ` (${(file.size / 1024).toFixed(2)} KB)`
                        : ""}
                      <button
                        className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                        onClick={() =>
                          onDownloadFile(file.base64 || file.data, file.filename)
                        }
                        type="button"
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 flex-shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestDetailsModal({
  request,
  onClose,
  status,
  onStatusChange,
  notes,
  onNotesChange,
  onSave,
  saving,
}) {
  if (!request) return null;

  let payload = null;
  try {
    if (request.payload) payload = JSON.parse(request.payload);
  } catch (_) {
    payload = null;
  }
  const builder = payload?.payload_builder;
  const items = payload?.builder_items || [];
  const modules = payload?.modules || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-neutral-950 rounded-lg border border-neutral-700 p-6 max-h-[85vh] flex flex-col">
          <div className="flex items-start justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-white">{request.name || request.type}</h3>
              <p className="text-sm text-neutral-400">
                {request.user_email || request.userEmail || `Experiment ID: ${request.id}`}
              </p>
              <p className="text-xs text-neutral-500">
                Requested:{" "}
                {request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : request.createdAt
                  ? new Date(request.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="h-px bg-neutral-800 my-4 flex-shrink-0" />

          <div className="flex-1 overflow-y-auto pr-2 text-sm text-neutral-300 space-y-4 modal-scroll">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Basic Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-neutral-400">ID</p>
                  <p className="font-medium">{request.id}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Status</p>
                  <p className="font-medium">{request.status}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Experiment Type</p>
                  <p className="font-medium">{request.experimentType || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Modules Needed</p>
                  <p className="font-medium">{request.ModulesNeeded || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Description</h4>
              <p className="whitespace-pre-wrap bg-neutral-900 p-3 rounded-md">
                {request.description || "No description provided"}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Requester Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-neutral-400">Email</p>
                  <p className="font-medium">{request.user_email || "No email provided"}</p>
                </div>
                <div>
                  <p className="text-neutral-400">User ID</p>
                  <p className="font-medium">{request.user_id || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Submitted At</p>
                  <p className="font-medium">
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString()
                      : "Not recorded"}
                  </p>
                </div>
              </div>
            </div>

            {payload && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-white">Payload Information</h4>
                <div className="space-y-6">
                  <div className="bg-neutral-900 p-4 rounded-md">
                    <h5 className="font-medium text-white mb-3">Payload Builder Configuration</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-neutral-400 text-sm">Bay Name</p>
                        <p className="font-medium">{builder?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Created At</p>
                        <p className="font-medium">
                          {builder?.created_at
                            ? new Date(builder.created_at).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Bay Dimensions</p>
                        <p className="font-medium">
                          {builder?.bay_width || 0} × {builder?.bay_height || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-md">
                    <h5 className="font-medium text-white mb-3">Payload Items</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-800">
                            <th className="text-left py-2 px-3 text-neutral-400">Module</th>
                            <th className="text-left py-2 px-3 text-neutral-400">Position</th>
                            <th className="text-left py-2 px-3 text-neutral-400">Mass</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index} className="border-b border-neutral-800">
                              <td className="py-2 px-3">{item.label}</td>
                              <td className="py-2 px-3">x: {item.x}, y: {item.y}</td>
                              <td className="py-2 px-3">{item.massKg} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-md">
                    <h5 className="font-medium text-white mb-3">Dashboard Information</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-neutral-400 text-sm">Plan</p>
                        <p className="font-medium">{payload?.dashboard_plan || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Available Credits</p>
                        <p className="font-medium">{payload?.dashboard_credits || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-md">
                    <h5 className="font-medium text-white mb-3">Available Modules</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {modules.map((module, index) => (
                        <div key={index} className="p-2 border border-neutral-800 rounded">
                          <p className="font-medium">{module.name}</p>
                          <p className="text-sm text-neutral-400">
                            {module.w}×{module.h} • {module.massKg} kg
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-neutral-400">Current Status</p>
                  <p className="font-medium">{request.status}</p>
                </div>
                {request.notes && (
                  <div className="col-span-2">
                    <p className="text-neutral-400">Notes</p>
                    <p className="font-medium">{request.notes || "No notes provided"}</p>
                  </div>
                )}
              </div>
            </div>

            {request.files && request.files.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-white">Attached Files</h4>
                <ul className="list-disc list-inside">
                  {request.files.map((file, index) => (
                    <li key={index} className="text-neutral-400">
                      {file.filename}
                      {typeof file.size === "number"
                        ? ` (${(file.size / 1024).toFixed(2)} KB)`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 flex-shrink-0 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-neutral-400">Status:</label>
              <select
                className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-200"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <option value="pending approval">Pending Approval</option>
                <option value="experiment queued">Experiment Queued</option>
                <option value="experiment completed">Experiment Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-neutral-400">Notes:</label>
              <textarea
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-sm text-white"
                rows={3}
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onSave}
                disabled={saving}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  saving ? "bg-neutral-700 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
                type="button"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestsCard({
  statusFilter,
  onStatusFilterChange,
  requests,
  onViewDetails,
}) {
  return (
    <Card title="Approvals" subtitle="Review and confirm pending requests.">
      <div className="mb-4 flex items-center gap-4">
        <label className="text-neutral-400">Filter by Status:</label>
        <select
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-neutral-200"
          onChange={(e) => onStatusFilterChange(e.target.value)}
          value={statusFilter}
        >
          <option value="all">All Statuses</option>
          <option value="pending approval">Pending Approval</option>
          <option value="experiment queued">Experiment Queued</option>
          <option value="experiment completed">Experiment Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="mt-4">
        {requests.length === 0 ? (
          <div className="text-neutral-400 p-6 text-center">
            No pending requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-300 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-neutral-200">
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-800 hover:bg-neutral-900/30 transition-colors"
                  >
                    <td className="px-4 py-3 align-middle">
                      {r.user_email || r.userEmail || "No email provided"}
                    </td>
                    <td className="px-4 py-3 align-middle">{r.name || r.type}</td>
                    <td className="px-4 py-3 align-middle text-neutral-400">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        onClick={() => onViewDetails(r)}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-500"
                        type="button"
                      >
                        View request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  canSubmit,
  onCombinedSubmit,
}) {
  return (
    <div className="w-full bg-neutral-800 text-white p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col space-y-8">
        <Header
          tier={tier}
          credits={credits}
          onBuy={onBuy}
          onChangeTier={onChangeTier}
          planOptions={planOptions}
          subscriptionPlan={subscriptionPlan}
        />
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
