// components/sidebar.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../src/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  // undefined = loading, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  function adminKeyForUid(uid) {
    return `isAdmin_${uid}`;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (u && typeof window !== "undefined") {
        setIsAdmin(!!localStorage.getItem(adminKeyForUid(u.uid)));
      } else {
        setIsAdmin(false);
      }
    });
    // Listen for storage changes (admin revoke in other tabs)
    function updateAdminStatus() {
      if (!user) return;
      setIsAdmin(!!localStorage.getItem(adminKeyForUid(user.uid)));
    }
    function onStorage(e) {
      if (!user || !e.key) return;
      const expectedKey = adminKeyForUid(user.uid);
      if (e.key === expectedKey) {
        updateAdminStatus();
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("admin", updateAdminStatus);
    // Also poll for admin status changes in this tab
    const interval = setInterval(updateAdminStatus, 500);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("admin", updateAdminStatus);
      clearInterval(interval);
    };
  }, [user]);

  // while we don't know auth state, return null to avoid flicker.
  if (user === undefined) return null;
  // not signed in -> hide sidebar
  if (!user) return null;

  return (
    <div className="flex h-full min-h-0 w-64 flex-col border-r border-neutral-500 bg-neutral-900 shrink-0 overflow-y-auto">
      <div className="py-8 px-6 space-y-6">
        {/* Home link */}
        <Link
          href="/"
          className={`flex flex-row gap-2 items-center px-4 py-2 rounded transition-all duration-200 text-base text-neutral-300 hover:text-white hover:bg-neutral-800 ${
            pathname === "/" ? "bg-neutral-800 text-white" : ""
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <title>Home</title>
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 10.5v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 17.5v-7" />
            <path d="M9 21v-6h6v6" />
          </svg>
          Home
        </Link>
        {/* Experiments link */}
        <Link
          href="/experiments"
          className={`flex flex-row gap-2 items-center px-4 py-2 rounded transition-all duration-200 text-base text-neutral-300 hover:text-white hover:bg-neutral-800 ${
            pathname === "/experiments" ? "bg-neutral-800 text-white" : ""
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <title>Experiments</title>
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" />
          </svg>
          Experiments
        </Link>
        {/* Reports link */}
        <Link
          href="/reports"
          className={`flex flex-row gap-2 items-center px-4 py-2 rounded transition-all duration-200 text-base text-neutral-300 hover:text-white hover:bg-neutral-800 ${
            pathname === "/reports" ? "bg-neutral-800 text-white" : ""
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <title>Reports</title>
            <path d="M7 2h7l5 5v12a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 19.5V4.5A2.5 2.5 0 0 1 7.5 2H7z" />
            <rect x="8.2" y="13" width="1.6" height="4.5" rx="0.3" fill="currentColor" />
            <rect x="11" y="10" width="1.6" height="7.5" rx="0.3" fill="currentColor" />
            <rect x="13.8" y="7" width="1.6" height="10.5" rx="0.3" fill="currentColor" />
          </svg>
          Reports
        </Link>
        {/* Approvals link (admin only) */}
        {isAdmin && (
          <>
            <div className="pt-4 border-t border-neutral-800" aria-hidden="true"></div>
            <Link
              href="/approvals"
              className={`flex flex-row gap-2 items-center px-4 py-2 rounded transition-all duration-200 text-base text-amber-300 hover:text-amber-400 hover:bg-neutral-800 ${
                pathname === "/approvals" ? "bg-neutral-800 text-amber-400" : ""
              }`}
              style={{ marginTop: '0rem' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <title>Approvals</title>
                <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                <path d="M9.5 12.5l2 2 4-4" />
              </svg>
              Approvals
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
