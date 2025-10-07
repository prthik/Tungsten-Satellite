// src/app/profile/page.js
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileCard } from "../../../components/card";
import { auth } from "../../lib/firebaseClient";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";

/**
 * NOTE (prototype): This file implements a purely client-side admin toggle.
 * It stores admin status in localStorage under the key `isAdmin_<uid>`.
 * This is insecure and for prototyping only. Do NOT use in production.
 */

export default function Profile() {
  const router = useRouter();

  const nameSpanRef = useRef(null);
  const emailSpanRef = useRef(null);
  const messageRef = useRef(null);

  const newNameRef = useRef(null);
  const adminCodeRef = useRef(null);

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const changeNameBtnRef = useRef(null);
  const changePassBtnRef = useRef(null);
  const signOutBtnRef = useRef(null);
  const deleteBtnRef = useRef(null);
  const makeAdminBtnRef = useRef(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const adminKeyForUid = useCallback((uid) => `isAdmin_${uid}`, []);

  const notifyAdminListeners = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("admin"));
    }
  }, []);

  // helper to set message text
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

  const updateAdminFlag = useCallback(
    (user) => {
      if (!user || typeof window === "undefined") {
        setIsAdmin(false);
        notifyAdminListeners();
        return;
      }
      const key = adminKeyForUid(user.uid);
      const nextIsAdmin = !!localStorage.getItem(key);
      setIsAdmin(nextIsAdmin);
      notifyAdminListeners();
    },
    [adminKeyForUid, notifyAdminListeners]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (nameSpanRef.current)
          nameSpanRef.current.textContent = user.displayName || "—";
        if (emailSpanRef.current)
          emailSpanRef.current.textContent = user.email || "—";
        if (newNameRef.current)
          newNameRef.current.value = user.displayName || "";
        updateAdminFlag(user);
      } else {
        // not signed in -> redirect to login
        setIsAdmin(false);
        notifyAdminListeners();
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router, updateAdminFlag]);

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

  // Update display name
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

  // Change password (re-auth via signInWithEmailAndPassword)
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
      setMessage(friendlyMessage(code, err?.message));
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
      setIsAdmin(false);
      notifyAdminListeners();
      // clear admin UI state for safety on signout
      const user = auth.currentUser;
      if (user && typeof window !== "undefined") {
        // do not remove localStorage so admin flag persists across sessions if intended
        // Uncomment next line to remove localStorage admin flag on sign-out:
        // localStorage.removeItem(adminKeyForUid(user.uid));
      }
      router.push("/");
    } catch (err) {
      setMessage("Sign out failed.");
    } finally {
      setBtnLoading(signOutBtnRef, false);
    }
  }

  // Delete account handler (unchanged)
  async function handleDeleteAccount() {
    setMessage("");
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
      await deleteUser(user);
      setMessage("Account deleted. Redirecting...", "green");
      try {
        await signOut(auth);
      } catch (_) {}
      router.push("/");
    } catch (err) {
      const code = err?.code || "";
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
          await signInWithEmailAndPassword(auth, user.email, pw);
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

  // ---------- Client-side admin (prototype, insecure) ----------
  async function handleMakeAdmin(e) {
    e.preventDefault();
    setMessage("");
    const code = adminCodeRef.current?.value?.trim() || "";
    if (!code) return setMessage("Please enter the admin code.");

    setBtnLoading(makeAdminBtnRef, true);

    const user = auth.currentUser;
    if (!user) {
      setMessage("Not signed in.");
      setBtnLoading(makeAdminBtnRef, false);
      return;
    }

    try {
      // Prototype check: require exact admin code "metaldetector"
      if (code !== "metaldetector") {
        setMessage("Invalid admin code.");
        setBtnLoading(makeAdminBtnRef, false);
        return;
      }

      const key = adminKeyForUid(user.uid);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, "1");
      }

      setIsAdmin(true);
      notifyAdminListeners();
      setMessage(
        "Account granted admin privileges (client-side only).",
        "green"
      );
    } catch (err) {
      console.error("make-admin (client) error:", err);
      setMessage("Failed to mark as admin (client-side).");
    } finally {
      setBtnLoading(makeAdminBtnRef, false);
      // clear the input
      if (adminCodeRef.current) adminCodeRef.current.value = "";
    }
  }

  // helper to revoke admin (for prototype convenience)
  function handleRevokeAdmin() {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Not signed in.");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(adminKeyForUid(user.uid));
    }
    setIsAdmin(false);
    notifyAdminListeners();
    setMessage("Admin privileges revoked (client-side).", "crimson");
    router.refresh();
  }

  return (
    <div className="flex min-h-0 w-full flex-1 items-start justify-center bg-neutral-800 py-12 px-6">
      <div className="w-full max-w-3xl">
        <ProfileCard
          nameSpanRef={nameSpanRef}
          emailSpanRef={emailSpanRef}
          isAdmin={isAdmin}
          newNameRef={newNameRef}
          changeNameBtnRef={changeNameBtnRef}
          onChangeName={handleChangeName}
          currentPasswordRef={currentPasswordRef}
          newPasswordRef={newPasswordRef}
          changePassBtnRef={changePassBtnRef}
          onChangePassword={handleChangePassword}
          adminCodeRef={adminCodeRef}
          makeAdminBtnRef={makeAdminBtnRef}
          onMakeAdmin={handleMakeAdmin}
          onRevokeAdmin={handleRevokeAdmin}
          signOutBtnRef={signOutBtnRef}
          onSignOut={handleSignOut}
          deleteBtnRef={deleteBtnRef}
          onDeleteAccount={handleDeleteAccount}
          messageRef={messageRef}
        />
      </div>
    </div>
  );
}
