
"use client";
import Card, { HomeNavCards } from "../../components/card";
import Link from "next/link";
import "./globals.css";
import React, { useEffect, useState } from 'react';
import { auth } from "../lib/firebaseClient";

export default function Homepage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  function adminKeyForUid(uid) {
    return `isAdmin_${uid}`;
  }
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user && typeof window !== "undefined") {
        setIsAdmin(!!localStorage.getItem(adminKeyForUid(user.uid)));
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
    const interval = setInterval(updateAdminStatus, 500);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("admin", updateAdminStatus);
      clearInterval(interval);
    };
  }, [user]);

  let userDisplay = "";
  if (user) {
    userDisplay = user.displayName || user.email || "";
  }

  const navCards = [
    {
      href: "/experiments",
      title: "Experiments",
      description: "View your mission control dashboard and manage your satellite projects.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><title>Dashboard</title><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
      ),
    },
    {
      href: "/reports",
      title: "Reports",
      description: "View and analyze your satellite reports and data.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><title>Reports</title><path d="M7 2h7l5 5v12a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 19.5V4.5A2.5 2.5 0 0 1 7.5 2H7z" /><rect x="8.2" y="13" width="1.6" height="4.5" rx="0.3" fill="currentColor" /><rect x="11" y="10" width="1.6" height="7.5" rx="0.3" fill="currentColor" /><rect x="13.8" y="7" width="1.6" height="10.5" rx="0.3" fill="currentColor" /></svg>
      ),
    },
    {
      href: "/profile",
      title: "Profile",
      description: "View and edit your user profile and account settings.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><title>Profile</title><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" /></svg>
      ),
    },
    {
      href: "/contact",
      title: "Contact",
      description: "Get in touch with the Tungsten Satellite team.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><title>Contact</title><path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7" /><polyline points="21 15 21 19 17 19" /><line x1="21" y1="19" x2="14" y2="12" /></svg>
      ),
    },
    {
      href: "https://github.com/prthik/Tungsten-Satellite",
      title: "GitHub",
      description: "View the Tungsten Satellite project on GitHub.",
      external: true,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><title>GitHub</title><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 7.43c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48C19.13 20.54 22 16.74 22 12.26 22 6.58 17.52 2 12 2z" /></svg>
      ),
    },
  ];

  if (isAdmin) {
    navCards.push({
      href: "/requests",
      title: "Approvals",
      description: "Review and approve mission requests.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><title>Approvals</title><path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" /><path d="M9.5 12.5l2 2 4-4" /></svg>
      ),
      highlight: {
        className: "",
        borderClassName: "border-amber-500/70",
        backgroundClassName: "bg-amber-500/20",
        titleClassName: "text-amber-300 text-xl font-semibold mb-1",
        titleHoverClassName: "group-hover:text-amber-200",
        subtitleClassName: "text-left text-sm text-amber-200",
        subtitleHoverClassName: "group-hover:text-amber-100",
        iconClassName: "text-amber-300",
        titleColorClassName: "text-amber-300",
        subtitleColorClassName: "text-amber-200",
      },
    });
  }

  const isLoggedIn = Boolean(userDisplay);

  return (
    <div
      className={`w-full bg-neutral-800 text-white p-8 flex flex-col items-center ${
        isLoggedIn ? "" : "min-h-0 flex-1 justify-center"
      }`}
    >
      {userDisplay && (
        <React.Fragment>
          <div className="w-full flex flex-col items-start mb-8">
            <h1 className="text-4xl font-bold">Welcome, {userDisplay}!</h1>
          </div>
          <HomeNavCards cards={navCards} />
        </React.Fragment>
      )}
      {!isLoggedIn && (
        <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 py-8">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            className="w-full max-w-2xl rounded-lg border border-neutral-500 bg-black shadow-lg"
            style={{ backgroundColor: '#000', display: 'block' }}
          >
            <source src="/0000-0300.mp4" type="video/mp4" />
            Sorry, your browser does not support embedded videos.
          </video>
          <p className="text-neutral-400 text-center text-base max-w-xl">
            Experience the future of satellite education. Watch the demo and see how easy it is to get started with Tungsten Satellite.
          </p>
          <Link
            href="/login"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition text-lg inline-block text-center"
            style={{ minWidth: 180 }}
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
