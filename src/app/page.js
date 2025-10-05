

"use client";
import { AboutCard, AboutProjectCard } from "../../components/card";
import "./globals.css";
import React, { useEffect, useState } from 'react';
import { auth } from "../lib/firebaseClient";

export default function Homepage() {
  const [userInfo, setUserInfo] = useState({ username: "", email: "" });
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserInfo({
          username: user.displayName || "",
          email: user.email || "",
        });
      } else {
        setUserInfo({ username: "", email: "" });
      }
    });
    return () => unsubscribe();
  }, []);

  let userDisplay = "";
  if (userInfo.username || userInfo.email) {
    userDisplay = userInfo.username ? userInfo.username : userInfo.email;
  }

  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Welcome{userDisplay ? `, ${userDisplay}` : ""}!
      </h1>
    </div>
  );
}
