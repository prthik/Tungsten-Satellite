"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../components/card";
import { auth } from "../../lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

function downloadBase64File(base64, filename) {
  const link = document.createElement("a");
  link.href = `data:application/octet-stream;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ReportsPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null); // selected experiment object
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter requests based on status and user
  const filteredRequests = requests.filter(
    (r) =>
      (statusFilter === "all" ? true : r.status === statusFilter) &&
      r.user_email === user?.email
  );

  // Fetch experiments from backend
  useEffect(() => {
    if (!user?.email) return;

    console.log("Fetching experiments...");
    fetch("/api/experiments")
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Received data:", data);
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching experiments:", error);
      });
  }, [user?.email]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoadingAuth(false);
      if (!user) {
        // not signed in -> redirect to home/login
        router.push("/");
        return;
      }
      setUser(user);
    });
    return () => unsub();
  }, [router]);

  // open modal
  function viewRequest(req) {
    setSelected(req);
  }

  // close modal
  function closeModal() {
    setSelected(null);
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center p-6">
        <div className="text-neutral-400">Checking auth...</div>
      </div>
    );
  }

  if (!user) {
    // short-circuit; redirect already done in effect but guard here
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-800 p-8">
      <div className="max-w-6xl mx-auto">
        <Card
          title="My Experiments"
          subtitle="View your experiment requests and their status."
        >
          <div className="mb-4 flex items-center gap-4">
            <label className="text-neutral-400">Filter by Status:</label>
            <select
              className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-neutral-200"
              onChange={(e) => setStatusFilter(e.target.value)}
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
            {filteredRequests.length === 0 ? (
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
                    {filteredRequests.map((r) => (
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
                            onClick={() => viewRequest(r)}
                            className="rounded-md bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-500"
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
      </div>

      {/* Modal (render when selected) */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />

          {/* panel */}
          <div className="relative z-10 w-full max-w-2xl mx-4">
            <div className="bg-neutral-950 rounded-lg border border-neutral-700 p-6 max-h-[85vh] flex flex-col">
              {/* Fixed Header */}
              <div className="flex items-start justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selected.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Submitted:{" "}
                    {selected.created_at
                      ? new Date(selected.created_at).toLocaleString()
                      : selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-neutral-400 hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-800 my-4 flex-shrink-0"></div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2 text-sm text-neutral-300 space-y-4 modal-scroll">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-white">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-neutral-400">ID</p>
                      <p className="font-medium">{selected.id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Status</p>
                      <p className="font-medium">{selected.status}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Experiment Type</p>
                      <p className="font-medium">
                        {selected.experimentType || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Modules Needed</p>
                      <p className="font-medium">
                        {selected.ModulesNeeded || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-white">
                    Description
                  </h4>
                  <p className="whitespace-pre-wrap bg-neutral-900 p-3 rounded-md">
                    {selected.description || "No description provided"}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-white">
                    Status Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-neutral-400">Current Status</p>
                      <p className="font-medium">{selected.status}</p>
                    </div>
                    {selected.notes && (
                      <div className="col-span-2">
                        <p className="text-neutral-400">Notes</p>
                        <p className="font-medium">
                          {selected.notes || "No notes provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payload Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-white">
                    Payload Information
                  </h4>
                  {selected.payload && (
                    <div className="space-y-6">
                      {/* Builder Configuration */}
                      <div className="bg-neutral-900 p-4 rounded-md">
                        <h5 className="font-medium text-white mb-3">
                          Payload Builder Configuration
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-neutral-400 text-sm">Bay Name</p>
                            <p className="font-medium">
                              {JSON.parse(selected.payload)?.payload_builder
                                ?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-400 text-sm">
                              Created At
                            </p>
                            <p className="font-medium">
                              {JSON.parse(selected.payload)?.payload_builder
                                ?.created_at
                                ? new Date(
                                    JSON.parse(
                                      selected.payload
                                    ).payload_builder.created_at
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-400 text-sm">
                              Bay Dimensions
                            </p>
                            <p className="font-medium">
                              {JSON.parse(selected.payload)?.payload_builder
                                ?.bay_width || 0}{" "}
                              ×{" "}
                              {JSON.parse(selected.payload)?.payload_builder
                                ?.bay_height || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payload Items Table */}
                      <div className="bg-neutral-900 p-4 rounded-md">
                        <h5 className="font-medium text-white mb-3">
                          Payload Items
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-neutral-800">
                                <th className="text-left py-2 px-3 text-neutral-400">
                                  Module
                                </th>
                                <th className="text-left py-2 px-3 text-neutral-400">
                                  Position
                                </th>
                                <th className="text-left py-2 px-3 text-neutral-400">
                                  Mass
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(
                                JSON.parse(selected.payload)?.builder_items ||
                                []
                              ).map((item, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-neutral-800"
                                >
                                  <td className="py-2 px-3">{item.label}</td>
                                  <td className="py-2 px-3">
                                    x: {item.x}, y: {item.y}
                                  </td>
                                  <td className="py-2 px-3">
                                    {item.massKg} kg
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Files */}
                {selected.files && selected.files.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-white">
                      Attached Files
                    </h4>
                    <ul className="list-disc list-inside">
                      {selected.files.map((file, index) => (
                        <li key={index} className="text-neutral-400">
                          {file.filename} ({(file.size / 1024).toFixed(2)} KB)
                          <button
                            className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                            onClick={() =>
                              downloadBase64File(
                                file.base64 || file.data,
                                file.filename
                              )
                            }
                          >
                            Download
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="mt-4 pt-4 border-t border-neutral-800 flex-shrink-0 flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg border border-neutral-700 px-4 py-2 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
