"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// Adjust this path if your file is elsewhere:
import { auth } from "../src/lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null); // null => signed out, object => signed in
  const ref = useRef(null);

  // subscribe to firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // u is null when signed out, user object when signed in
      setUser(u);
    });
    return () => unsub();
  }, []);

  // close dropdown on outside click / Escape
  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut(auth);
      setOpen(false);
      // firebase will call onAuthStateChanged -> setUser(null)
    } catch (err) {
      console.error("Sign-out failed", err);
      // optionally show a toast / message
    }
  }

  // label to show in nav button
  const label = user ? user.displayName || user.email || "Profile" : "Profile";

  return (
    <div className="flex w-full justify-between py-6 px-10 border-b bg-neutral-950 border-neutral-500">
      <div className="text-2xl font-bold">
        <Link href={"/"}>Tungsten Satellite</Link>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div className="hover:underline cursor-pointer">
          <Link href={"/alerts"}>Alerts</Link>
        </div>

        {/* Profile dropdown */}
        <div ref={ref} className="relative inline-block text-left">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1 rounded hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <span className="hover:underline cursor-pointer select-none text-sm">
              {label}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.77l3.71-3.58a.75.75 0 011.04 1.08l-4.25 4.1a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50 text-neutral-900"
            >
              <div className="py-1">
                {!user && (
                  <Link
                    href="/login"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setOpen(false)}
                  >
                    Login or register
                  </Link>
                )}

                {user && (
                  <>
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
