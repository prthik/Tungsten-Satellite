// app/login/page.js
"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function Page() {
  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const modeRef = useRef("login"); // "login" or "register"
  const messageRef = useRef(null);
  const submitBtnRef = useRef(null);
  const headingRef = useRef(null);

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

  function setMode(newMode) {
    modeRef.current = newMode;
    // update header text and button text imperatively
    if (headingRef.current) {
      headingRef.current.textContent =
        newMode === "login" ? "Login" : "Create account";
    }
    if (submitBtnRef.current) {
      submitBtnRef.current.textContent =
        newMode === "login" ? "Login" : "Create account";
    }
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
    <div
      style={{
        maxWidth: 360,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h2 ref={headingRef} style={{ marginBottom: 12, color: "#111" }}>
        {modeRef.current === "login" ? "Login" : "Create account"}
      </h2>

      <div
        ref={messageRef}
        style={{ marginBottom: 12, minHeight: 18, color: "crimson" }}
      />

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 6,
              color: "#111", // ensure label is dark on white card
            }}
          >
            Email
          </label>
          <input
            ref={emailRef}
            type="email"
            style={{
              width: "100%",
              padding: 8,
              boxSizing: "border-box",
              color: "#111", // input text color
              border: "1px solid #ddd",
              borderRadius: 4,
              background: "#fff",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 6,
              color: "#111",
            }}
          >
            Password
          </label>
          <input
            ref={passwordRef}
            type="password"
            minLength={6}
            style={{
              width: "100%",
              padding: 8,
              boxSizing: "border-box",
              color: "#111",
              border: "1px solid #ddd",
              borderRadius: 4,
              background: "#fff",
            }}
            required
          />
        </div>

        <button
          ref={submitBtnRef}
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#3b99e0",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          {modeRef.current === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
        {modeRef.current === "login" ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => setMode("register")}
              style={{
                color: "#0ea5e9",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              style={{
                color: "#0ea5e9",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
