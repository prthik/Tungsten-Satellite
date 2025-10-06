"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportsCard, ReportDetailsModal } from "../../../components/card";
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
        <ReportsCard
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          requests={filteredRequests}
          onViewDetails={viewRequest}
        />
      </div>

      {/* Modal (render when selected) */}
      {selected && (
        <ReportDetailsModal
          request={selected}
          onClose={closeModal}
          onDownloadFile={downloadBase64File}
        />
      )}
    </div>
  );
}
