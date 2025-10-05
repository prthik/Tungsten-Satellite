// src/app/login/page.js
"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import Card from "../../../components/card";

export default function Page() {
  const router = useRouter();

  // refs for inputs / DOM elements (imperative updates)
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const modeRef = useRef("login"); // keep for imperative parts
  const [mode, setModeState] = useState("login"); // React state for rendering
  const messageRef = useRef(null);
  const submitBtnRef = useRef(null);
  const headingRef = useRef(null);

  // ensure the submit button text is correct on first mount
  useEffect(() => {
    if (submitBtnRef.current) {
      submitBtnRef.current.textContent =
        mode === "login" ? "Login" : "Create account";
    }
  }, [mode]);

  function setMessage(text, color = "crimson") {
    if (messageRef.current) {
      messageRef.current.textContent = text;
      messageRef.current.style.color = color;
    }
  }

  function setLoading(isLoading) {
    if (submitBtnRef.current) {
      submitBtnRef.current.disabled = isLoading;
      submitBtnRef.current.style.cursor = isLoading ? "not-allowed" : "pointer";
      submitBtnRef.current.textContent = isLoading
        ? "Please wait..."
        : modeRef.current === "login"
        ? "Login"
        : "Create account";
    }
  }

  // update both ref and React state so UI + imperative parts stay in sync
  function setMode(newMode) {
    modeRef.current = newMode;
    setModeState(newMode);
    if (headingRef.current)
      headingRef.current.textContent =
        newMode === "login" ? "Login" : "Create account";
    if (submitBtnRef.current)
      submitBtnRef.current.textContent =
        newMode === "login" ? "Login" : "Create account";
    if (messageRef.current) messageRef.current.textContent = "";
  }

  function friendlyMessage(code, message) {
    if (!code) return message;
    if (code.includes("auth/wrong-password")) return "Wrong password.";
    if (code.includes("auth/user-not-found"))
      return "No account found with that email.";
    if (code.includes("auth/email-already-in-use"))
      return "An account with that email already exists.";
    if (code.includes("auth/weak-password"))
      return "Password must be at least 6 characters.";
    if (code.includes("auth/invalid-email"))
      return "Please enter a valid email address.";
    return message || "An error occurred.";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      if (modeRef.current === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // success -> redirect
      router.push("/");
    } catch (err) {
      setMessage(friendlyMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-800 flex justify-center px-4 py-12">
      <div className="w-full max-w-md mt-8">
        <Card>
          <h2
            ref={headingRef}
            className="text-neutral-500 text-2xl font-semibold mb-4"
          >
            {mode === "login" ? "Login" : "Create account"}
          </h2>

          <div ref={messageRef} className="min-h-[1.125rem] mb-2 text-sm" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                Email
              </label>
              <input
                ref={emailRef}
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                Password
              </label>
              <input
                ref={passwordRef}
                type="password"
                minLength={6}
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              ref={submitBtnRef}
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400 focus:outline-none"
            >
              {mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-sm text-neutral-400">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-indigo-300 hover:underline ml-1"
                  style={{ float: "right" }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-indigo-300 hover:underline ml-1"
                  style={{ float: "right" }}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
