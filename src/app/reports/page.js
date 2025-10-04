"use client";

import React from "react";
import Card from "../../../components/card";

export default function Profile() {
  return (
    <div className="min-h-screen flex justify-center bg-neutral-800 p-10">
      <div style={{ flex: 1 }}>
        <Card
          title="My Profile"
          subtitle="Manage your profile here."
          number="2"
          children="3"
        />
      </div>
    </div>
  );
}
