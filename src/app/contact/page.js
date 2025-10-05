"use client";

import React, { useState } from "react";
import { ContactCard } from "../../../components/card";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8 flex justify-center">
      <div className="w-full max-w-2xl mt-8">
        <ContactCard
          onSubmit={handleSubmit}
          message={message}
          onMessageChange={handleMessageChange}
          sent={sent}
        />
      </div>
    </div>
  );
}
