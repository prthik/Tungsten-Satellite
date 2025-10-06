// src/app/admin/approvals/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequestsCard, RequestDetailsModal } from "../../../components/card";
import { auth } from "../../lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

/** @type {React.FC} */

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
// Fetch experiments from backend
export default function RequestsPage() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null); // selected experiment object
  const [processing, setProcessing] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editStatus, setEditStatus] = useState("pending approval");

  // Filter requests based on status
  const filteredRequests = requests.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter
  );

  // Fetch experiments from backend
  useEffect(() => {
    console.log("Fetching experiments...");
    fetch("/api/experiments")
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Received data:", data);
        // Store all requests and let the status filter handle filtering
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching experiments:", error);
      });
  }, []);
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
    setEditStatus(req.status);
    setConfirmationNotes(req.notes || "");
  }

  // close modal
  function closeModal() {
    setSelected(null);
    setEditStatus("pending approval");
    setConfirmationNotes("");
  }

  // Save changes to experiment
  async function saveChanges(id) {
    setProcessing(true);
    try {
      const res = await fetch("/api/experiments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experiment_id: id,
          status: editStatus,
          notes: confirmationNotes,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to save changes");
      }
      // Refresh experiments
      const updatedRes = await fetch("/api/experiments");
      const updatedData = await updatedRes.json();
      setRequests(Array.isArray(updatedData) ? updatedData : []);
      closeModal();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes: " + error.message);
    } finally {
      setProcessing(false);
    }
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
        <RequestsCard
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          requests={filteredRequests}
          onViewDetails={viewRequest}
        />
      </div>

      {/* Modal (render when selected) */}
      {selected && (
        <RequestDetailsModal
          request={selected}
          onClose={closeModal}
          status={editStatus}
          onStatusChange={setEditStatus}
          notes={confirmationNotes}
          onNotesChange={setConfirmationNotes}
          onSave={() => saveChanges(selected.id)}
          saving={processing}
        />
      )}
    </div>
  );
}
