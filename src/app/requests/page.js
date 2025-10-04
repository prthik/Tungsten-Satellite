// src/app/admin/approvals/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../components/card";
import { auth } from "../../lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Admin approvals UI (client-only).
 * Prototype admin check: localStorage key isAdmin_<uid>.
 *
 * Table columns: Requester, Type, View Request
 * Modal shows extra details + Confirm Completed (removes from list)
 */

function adminKeyForUid(uid) {
  return `isAdmin_${uid}`;
}
const MOCK_REQUESTS = [
  {
    id: "r1",
    userEmail: "alice@example.com",
    type: "Material request",
    createdAt: "2025-09-25T12:10:00Z",
    details:
      "Request 250g of Carbon Nanotube feedstock. Priority: High. Notes: High purity required.",
  },
  {
    id: "r2",
    userEmail: "bob@example.com",
    type: "Lab time booking",
    createdAt: "2025-09-29T09:22:00Z",
    details:
      "Request 3 hours of microfabrication lab time on Oct 3. Notes: Need supervisor.",
  },
  {
    id: "r3",
    userEmail: "charlie@example.com",
    type: "Shipping request",
    createdAt: "2025-10-01T08:00:00Z",
    details: "Request shipping supplies (foam inserts). Priority: Normal.",
  },
];

export default function RequestsPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [selected, setSelected] = useState(null); // selected request object
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoadingAuth(false);
      if (!user) {
        // not signed in -> redirect to home/login
        router.push("/");
        return;
      }
      const adminFlag =
        typeof window !== "undefined" &&
        !!localStorage.getItem(adminKeyForUid(user.uid));
      if (!adminFlag) {
        // not admin -> redirect away
        router.push("/");
        return;
      }
      setIsAdmin(true);
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

  // Confirm completed: remove from requests
  async function confirmCompleted(id) {
    setProcessing(true);
    // Simulate small delay for UX
    await new Promise((r) => setTimeout(r, 400));
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setProcessing(false);
    closeModal();
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center p-6">
        <div className="text-neutral-400">Checking auth...</div>
      </div>
    );
  }

  if (!isAdmin) {
    // short-circuit; redirect already done in effect but guard here
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-800 p-8">
      <div className="max-w-6xl mx-auto">
        <Card title="Approvals" subtitle="Review and confirm pending requests.">
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
                        className="border-b border-neutral-800 hover:bg-neutral-900/30"
                      >
                        <td className="px-4 py-3 align-middle">
                          {r.userEmail}
                        </td>
                        <td className="px-4 py-3 align-middle">{r.type}</td>
                        <td className="px-4 py-3 align-middle text-neutral-400">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <button
                            onClick={() => viewRequest(r)}
                            className="rounded-md bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-500"
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
            <div className="bg-neutral-950 rounded-lg border border-neutral-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selected.type}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {selected.userEmail}
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

              <div className="mt-4 text-sm text-neutral-300">
                <p className="mb-2">
                  <strong>Details</strong>
                </p>
                <p className="whitespace-pre-wrap">{selected.details}</p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => confirmCompleted(selected.id)}
                  disabled={processing}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    processing
                      ? "bg-neutral-700 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {processing ? "Confirming..." : "Confirm completed"}
                </button>

                <button
                  onClick={closeModal}
                  className="rounded-lg border border-neutral-700 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
