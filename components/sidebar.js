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
        <div className="hover:underline cursor-pointer">
          <Link href={"/"}>Home</Link>
        </div>
        <div className="hover:underline cursor-pointer">
          <Link href={"/dashboard"}> Dashboard</Link>
        </div>
        <div className="hover:underline cursor-pointer">
          <Link href={"/reports"}> Reports</Link>
        </div>
      </div>
    </div>
  );
}
