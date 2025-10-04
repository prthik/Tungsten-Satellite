// components/sidebar.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../src/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function Sidebar() {
  // undefined = not yet known, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // while we don't know auth state, return null to avoid flicker.
  // If you prefer a skeleton placeholder while loading, render it when user === undefined.
  if (!user) return null;

  return (
    <div className="flex flex-col w-64 h-full border-r border-neutral-500 bg-neutral-900 shrink-0">
      <div className="py-8 px-6 space-y-6">
        <div
          className="hover:underline cursor-pointer"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
          }}
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
          <Link href={"/"}>Home</Link>
        </div>
        <div
          className="hover:underline cursor-pointer"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
          }}
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
            <title>Dashboard</title>
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" />
          </svg>
          <Link href={"/dashboard"}> Dashboard</Link>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
          }}
          className="hover:underline cursor-pointer"
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
            <rect
              x="8.2"
              y="13"
              width="1.6"
              height="4.5"
              rx="0.3"
              fill="currentColor"
            />
            <rect
              x="11"
              y="10"
              width="1.6"
              height="7.5"
              rx="0.3"
              fill="currentColor"
            />
            <rect
              x="13.8"
              y="7"
              width="1.6"
              height="10.5"
              rx="0.3"
              fill="currentColor"
            />
          </svg>
          <Link href={"/reports"}> Reports</Link>
        </div>
      </div>
    </div>
  );
}
