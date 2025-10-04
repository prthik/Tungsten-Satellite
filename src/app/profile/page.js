// src/app/profile/page.js
"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../components/card";
import { auth } from "../../lib/firebaseClient"; // ensure this path is correct
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";

export default function Profile() {
  const router = useRouter();

  const nameSpanRef = useRef(null);
  const emailSpanRef = useRef(null);
  const messageRef = useRef(null);

  const newNameRef = useRef(null);

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const changeNameBtnRef = useRef(null);
  const changePassBtnRef = useRef(null);
  const signOutBtnRef = useRef(null);
  const deleteBtnRef = useRef(null);

  function setMessage(text = "", color = "crimson") {
    if (!messageRef.current) return;
    messageRef.current.textContent = text;
    messageRef.current.style.color = color;
  }

  function setBtnLoading(ref, isLoading) {
    if (!ref?.current) return;
    ref.current.disabled = isLoading;
    ref.current.style.cursor = isLoading ? "not-allowed" : "pointer";
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (nameSpanRef.current)
          nameSpanRef.current.textContent = user.displayName || "—";
        if (emailSpanRef.current)
          emailSpanRef.current.textContent = user.email || "—";
        if (newNameRef.current)
          newNameRef.current.value = user.displayName || "";
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  function friendlyMessage(code, message) {
    if (!code) return message;
    if (code.includes("auth/wrong-password")) return "Wrong password.";
    if (code.includes("auth/requires-recent-login"))
      return "You need to sign in again before performing this action.";
    if (code.includes("auth/weak-password"))
      return "Password must be at least 6 characters.";
    if (code.includes("auth/invalid-email")) return "Invalid email.";
    return message || "An error occurred.";
  }

  async function handleChangeName(e) {
    e.preventDefault();
    setMessage("");
    const newName = newNameRef.current?.value?.trim() || "";
    if (!newName) return setMessage("Please enter a display name.");
    setBtnLoading(changeNameBtnRef, true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not signed in.");
      await updateProfile(user, { displayName: newName });
      if (nameSpanRef.current) nameSpanRef.current.textContent = newName;
      setMessage("Display name updated.", "green");
    } catch (err) {
      setMessage(friendlyMessage(err.code, err.message));
    } finally {
      setBtnLoading(changeNameBtnRef, false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage("");
    const currentPassword = currentPasswordRef.current?.value || "";
    const newPassword = newPasswordRef.current?.value || "";

    if (!currentPassword || !newPassword) {
      return setMessage("Please enter current and new password.");
    }
    if (newPassword.length < 6) {
      return setMessage("New password must be at least 6 characters.");
    }

    setBtnLoading(changePassBtnRef, true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not signed in.");

      await signInWithEmailAndPassword(auth, user.email, currentPassword);
      await updatePassword(auth.currentUser, newPassword);

      if (currentPasswordRef.current) currentPasswordRef.current.value = "";
      if (newPasswordRef.current) newPasswordRef.current.value = "";

      setMessage("Password updated successfully.", "green");
    } catch (err) {
      const code = err?.code || "";
      const msg = err?.message || "";
      setMessage(friendlyMessage(code, msg));
      if (code && code.includes("requires-recent-login")) {
        setMessage("Please sign out and sign in again, then retry.", "crimson");
      }
    } finally {
      setBtnLoading(changePassBtnRef, false);
    }
  }

  async function handleSignOut() {
    setMessage("");
    setBtnLoading(signOutBtnRef, true);
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      setMessage("Sign out failed.");
    } finally {
      setBtnLoading(signOutBtnRef, false);
    }
  }

  // ---- New: Delete account handler ----
  async function handleDeleteAccount() {
    setMessage("");
    // Explicit typed confirmation
    const typed = window.prompt(
      "Type DELETE to permanently delete your account. This action cannot be undone."
    );
    if (typed !== "DELETE") {
      setMessage("Account deletion cancelled.");
      return;
    }

    setBtnLoading(deleteBtnRef, true);

    const user = auth.currentUser;
    if (!user) {
      setMessage("Not signed in.");
      setBtnLoading(deleteBtnRef, false);
      return;
    }

    try {
      // Try delete directly
      await deleteUser(user);
      setMessage("Account deleted. Redirecting...", "green");
      // optional: sign out call is unnecessary because user is deleted, but safe
      try {
        await signOut(auth);
      } catch (_) {}
      router.push("/");
    } catch (err) {
      const code = err?.code || "";
      // If deletion requires recent login, ask for password and re-auth
      if (code && code.includes("requires-recent-login")) {
        const pw = window.prompt(
          "To delete your account we need to re-confirm your credentials. Please enter your current password:"
        );
        if (!pw) {
          setMessage("Account deletion cancelled.");
          setBtnLoading(deleteBtnRef, false);
          return;
        }

        try {
          // Re-authenticate
          await signInWithEmailAndPassword(auth, user.email, pw);
          // Retry delete
          await deleteUser(auth.currentUser);
          setMessage("Account deleted. Redirecting...", "green");
          try {
            await signOut(auth);
          } catch (_) {}
          router.push("/");
        } catch (err2) {
          setMessage(friendlyMessage(err2.code, err2.message));
        } finally {
          setBtnLoading(deleteBtnRef, false);
        }
      } else {
        setMessage(friendlyMessage(code, err?.message));
        setBtnLoading(deleteBtnRef, false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-800 flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-3xl">
        <Card title="My Profile" subtitle="Manage your profile here.">
          <hr className="border-neutral-800 my-2" />
          <div className="space-y-4">
            {/* Basic info */}
            <div>
              <p className="text-sm text-neutral-400 mb-1">Display name</p>
              <p ref={nameSpanRef} className="text-lg text-white mb-2">
                —
              </p>
              <p className="text-sm text-neutral-400 mb-1">Email</p>
              <p ref={emailSpanRef} className="text-sm text-neutral-300 mb-2">
                —
              </p>
            </div>

            {/* Change display name */}
            <form onSubmit={handleChangeName} className="space-y-2">
              <label className="block text-sm text-neutral-300">
                New display name
              </label>
              <input
                ref={newNameRef}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your display name"
              />
              <div className="flex gap-2">
                <button
                  ref={changeNameBtnRef}
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400"
                >
                  Update name
                </button>
              </div>
            </form>

            <hr className="border-neutral-800 my-2" />

            {/* Change password */}
            <form onSubmit={handleChangePassword} className="space-y-2">
              <label className="block text-sm text-neutral-300">
                Current password
              </label>
              <input
                ref={currentPasswordRef}
                type="password"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Current password"
              />
              <label className="block text-sm text-neutral-300">
                New password
              </label>
              <input
                ref={newPasswordRef}
                type="password"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="New password"
              />
              <div className="flex gap-2">
                <button
                  ref={changePassBtnRef}
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400"
                >
                  Change password
                </button>
              </div>
            </form>
            <hr className="border-neutral-800 my-2" />
            <div className="flex gap-2">
              <button
                ref={signOutBtnRef}
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-sm"
              >
                Sign out
              </button>

              {/* Delete account button */}
              <button
                ref={deleteBtnRef}
                type="button"
                onClick={handleDeleteAccount}
                className="ml-auto rounded-lg bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-500"
              >
                Delete account
              </button>
            </div>
            {/* message area */}
            <div ref={messageRef} className="min-h-[1rem] text-sm mt-2"></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
