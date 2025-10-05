"use client";

import React, { useEffect, useState } from "react";
import "../globals.css";

function downloadBase64File(base64, filename) {
  const link = document.createElement('a');
  link.href = `data:application/octet-stream;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ReportsPage() {
  const [users, setUsers] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Fetch users
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
        // Fetch subscriptions
        const subsRes = await fetch("/api/subscriptions");
        const subsData = await subsRes.json();
        setSubscriptions(Array.isArray(subsData) ? subsData : []);
        // Fetch experiments
        const expRes = await fetch("/api/experiments");
        const expData = await expRes.json();
        setExperiments(Array.isArray(expData) ? expData : []);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch report data");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  function getUserSubscription(userId) {
    return subscriptions.find(s => s.user_id === userId) || {};
  }
  function getUserExperiments(userId) {
    return experiments.filter(e => e.user_id === userId);
  }

  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8">
      {loading ? (
        <div><h1 className="text-3xl font-bold mb-8">Loading...</h1></div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            users.map(user => (
              <div key={user.id} className="border border-neutral-700 rounded-lg p-6 bg-neutral-950">
                <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
                <div className="mb-2 text-neutral-400">Credits: {user.credits_available}</div>
                <div className="mb-2 text-neutral-400">Subscription Plan: {getUserSubscription(user.id).plan_id || "N/A"}</div>
                <div className="mb-2 text-neutral-400">Subscription Credits: {getUserSubscription(user.id).credits_available || 0}</div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Experiments</h3>
                  {getUserExperiments(user.id).length === 0 ? (
                    <div className="text-neutral-500">No experiments found.</div>
                  ) : (
                    <ul className="space-y-4">
                      {getUserExperiments(user.id).map(exp => (
                        <li key={exp.id} className="border border-neutral-800 rounded p-4">
                          <div className="font-medium">{exp.name} <span className="text-xs text-neutral-500">(ID: {exp.id})</span></div>
                          <div className="text-sm text-neutral-400">{exp.description}</div>
                          <div className="text-xs text-neutral-500">Status: {exp.status}</div>
                          <div className="mt-2">
                            <h4 className="font-semibold text-sm mb-1">Files</h4>
                            {Array.isArray(exp.files) && exp.files.length > 0 ? (
                              <ul className="space-y-1">
                                {exp.files.map(f => (
                                  <li key={f.id} className="flex items-center gap-2">
                                    <span>{f.filename} ({f.size} bytes)</span>
                                    <button
                                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                                      onClick={() => downloadBase64File(f.base64 || f.data, f.filename)}
                                    >
                                      Download
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-neutral-500">No files.</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
