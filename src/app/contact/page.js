"use client";

import React, { useState, useEffect } from "react";
import { ContactCard } from "../../../components/card";
import { auth } from "../../lib/firebaseClient";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || "");
    });
    return () => unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userEmail) {
      alert("You must be logged in to send a message.");
      return;
    }
    // Send to API route (not implemented here)
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, message }),
    });
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8 flex justify-center">
      <div className="w-full max-w-2xl mt-8">
        <ContactCard
          onSubmit={handleSubmit}
          message={message}
          onMessageChange={(e) => setMessage(e.target.value)}
          sent={sent}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
}
