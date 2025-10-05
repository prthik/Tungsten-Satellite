"use client";

import React, { useState, useRef, useEffect } from "react";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

function FileUpload({ files, setFiles }) {
  const fileInputRef = useRef();
  const [error, setError] = useState("");

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} files.`);
      return;
    }
    for (let file of selectedFiles) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each file must be less than ${MAX_SIZE_MB} MB.`);
        return;
      }
    }
    setFiles([...files, ...selectedFiles]);
    setError("");
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
        multiple
        ref={fileInputRef}
        onChange={handleFiles}
        className="block w-fit cursor-pointer rounded bg-gray-100 px-4 py-2 text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 transition"
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
        Max {MAX_FILES} files, each ≤ {MAX_SIZE_MB}MB
      </div>
    </div>
  );
}

export default function ExperimentForm() {
  const [files, setFiles] = useState([]);
  const [modules, setModules] = useState([]);
  const [useBuilder, setUseBuilder] = useState(false);
  const [builder, setBuilder] = useState({
    name: "",
    bay_width: 4,
    bay_height: 4,
    items: [],
  });
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.experimentName.value;
    const description = form.description.value;

    // Convert files to base64
    const readFileAsBase64 = (file) =>
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

    const filesPayload = await Promise.all(
      files.map(async (f) => ({
        filename: f.name,
        data: await readFileAsBase64(f),
      }))
    );

    const payload = {
      experiment: {
        name,
        description,
        status: "pending approval",
      },
      payload_builder: useBuilder ? builder : null,
      files: filesPayload,
    };

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("API response status:", res.status, "body:", data);
      if (data.ok) {
        // show inline success with returned data
        setSuccess(data);
        setShowModal(true);
        form.reset();
        setFiles([]);
        // refresh list of submissions
        fetchSubmissions();
      } else {
        alert("Failed: " + (data.error || "unknown"));
      }
    } catch (err) {
      alert("Error: " + String(err));
    }
  };

  // debug: log success changes and auto-close modal after 5s
  useEffect(() => {
    if (!success) return;
    console.log("Saved experiment:", success);
  }, [success]);

  useEffect(() => {
    if (!showModal) return;
    const t = setTimeout(() => setShowModal(false), 5000);
    return () => clearTimeout(t);
  }, [showModal]);

  async function fetchSubmissions() {
    try {
      const res = await fetch("/api/experiments");
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    }
  }

  async function fetchModules() {
    try {
      const res = await fetch("/api/modules");
      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch modules", err);
    }
  }

  useEffect(() => {
    fetchSubmissions();
    fetchModules();
  }, []);

  function addBuilderItem() {
    setBuilder((b) => ({
      ...b,
      items: [
        ...(b.items || []),
        { module_id: modules[0]?.id || null, x: 0, y: 0, label: "" },
      ],
    }));
  }

  function updateBuilderItem(idx, changes) {
    setBuilder((b) => {
      const items = (b.items || []).slice();
      items[idx] = { ...items[idx], ...changes };
      return { ...b, items };
    });
  }

  function removeBuilderItem(idx) {
    setBuilder((b) => {
      const items = (b.items || []).slice();
      items.splice(idx, 1);
      return { ...b, items };
    });
  }
  return (
    <>
      <form
        className="flex flex-col gap-4 max-w-md mx-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label htmlFor="experimentName" className="mb-2 font-semibold">
            Experiment Name
          </label>
          <input
            type="text"
            id="experimentName"
            name="experimentName"
            className="p-2 border border-neutral-300 rounded"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="description" className="mb-2 font-semibold">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            className="p-2 border border-neutral-300 rounded"
            required
          ></textarea>
        </div>
        <FileUpload files={files} setFiles={setFiles} />

        {/* Payload builder toggle */}
        <div className="flex items-center gap-2">
          <input
            id="useBuilder"
            type="checkbox"
            checked={useBuilder}
            onChange={(e) => setUseBuilder(e.target.checked)}
          />
          <label htmlFor="useBuilder" className="text-sm">
            Use Payload Builder
          </label>
        </div>

        {useBuilder && (
          <div className="p-3 border rounded bg-gray-50">
            <div className="flex flex-col mb-2">
              <label className="mb-1 text-sm font-medium">Builder Name</label>
              <input
                value={builder.name}
                onChange={(e) =>
                  setBuilder((b) => ({ ...b, name: e.target.value }))
                }
                className="p-2 border rounded"
              />
            </div>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="mb-1 text-sm font-medium">Bay Width</label>
                <input
                  type="number"
                  value={builder.bay_width}
                  onChange={(e) =>
                    setBuilder((b) => ({
                      ...b,
                      bay_width: Number(e.target.value),
                    }))
                  }
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 text-sm font-medium">Bay Height</label>
                <input
                  type="number"
                  value={builder.bay_height}
                  onChange={(e) =>
                    setBuilder((b) => ({
                      ...b,
                      bay_height: Number(e.target.value),
                    }))
                  }
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Items</h4>
                <button
                  type="button"
                  className="text-sm text-blue-600"
                  onClick={addBuilderItem}
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {(builder.items || []).map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={it.module_id ?? ""}
                      onChange={(e) =>
                        updateBuilderItem(idx, {
                          module_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="p-2 border rounded"
                    >
                      <option value="">Select module</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={it.x}
                      onChange={(e) =>
                        updateBuilderItem(idx, { x: Number(e.target.value) })
                      }
                      className="p-2 border rounded w-16"
                    />
                    <input
                      type="number"
                      value={it.y}
                      onChange={(e) =>
                        updateBuilderItem(idx, { y: Number(e.target.value) })
                      }
                      className="p-2 border rounded w-16"
                    />
                    <input
                      type="text"
                      value={it.label}
                      onChange={(e) =>
                        updateBuilderItem(idx, { label: e.target.value })
                      }
                      className="p-2 border rounded flex-1"
                      placeholder="label"
                    />
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => removeBuilderItem(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Create Experiment
        </button>
      </form>
      {success && (
        <div className="mt-6 max-w-md mx-auto p-4 border border-green-200 rounded bg-green-50">
          <h3 className="font-semibold text-green-800">Experiment Created</h3>
          <div className="text-sm text-green-700 mt-2">
            ID: {success.experiment_id}
          </div>
          <div className="text-sm text-green-700">
            Name: {success.experiment?.name}
          </div>
          <div className="text-sm text-green-700">
            Description: {success.experiment?.description}
          </div>
          <div className="text-sm text-green-700">
            Status: {success.experiment?.status}
          </div>
          <div className="text-sm text-green-700">
            Files saved: {success.files_saved ?? 0}
          </div>
        </div>
      )}

      {/* Modal popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-30"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded shadow-lg max-w-lg w-full p-6 z-10">
            <h2 className="text-lg font-semibold mb-2">Experiment Saved</h2>
            <div className="mb-4 text-sm">
              <div>
                <strong>ID:</strong> {success.experiment_id}
              </div>
              <div>
                <strong>Name:</strong> {success.experiment?.name}
              </div>
              <div>
                <strong>Description:</strong> {success.experiment?.description}
              </div>
              <div>
                <strong>Status:</strong> {success.experiment?.status}
              </div>
              <div>
                <strong>Files saved:</strong> {success.files_saved ?? 0}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All submissions list */}
      <div className="mt-8 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">All Submissions</h3>
        {submissions.length === 0 && (
          <div className="text-sm text-neutral-500">No submissions yet.</div>
        )}
        <ul className="space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="p-3 border rounded">
              <div className="font-medium">
                {s.name}{" "}
                <span className="text-xs text-neutral-500">(ID: {s.id})</span>
              </div>
              <div className="text-sm text-neutral-700">{s.description}</div>
              <div className="text-xs text-neutral-500">
                Status: {s.status} • Files: {s.files?.length ?? 0}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
