"use client";

<<<<<<< HEAD
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
=======
import "../globals.css";

export default function ReportsPage() {
	return (
		<div className="min-h-screen bg-neutral-800 text-white p-8">
			<h1 className="text-4xl font-bold mb-8">Reports</h1>
			{/* Add your reports content here */}
		</div>
	);
>>>>>>> f2ec3e9271eef6bd6fd18058d2fdea2434fee486
}
