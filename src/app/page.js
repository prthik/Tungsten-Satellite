// components/Homepage.js
import React from 'react';

const Homepage = () => {
  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome!</h1>
      
      <div className="space-y-8">
        {/* About Us Section */}
        <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-500">
          <h2 className="text-neutral-500 text-2xl font-semibold mb-4">About Us</h2>
          <p>
            We are Tungsten Cube...a team of high-schoolers who are a part of a FIRST Robotics Competition team
            called YETI Robotics, which is underneath a 501(c)(3) Non-Profit organization called Queen City Robotics
            Alliance based in Charlotte, North Carolina.
          </p>
        </div>

        {/* About Our Project Section */}
        <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-500">
          <h2 className="text-neutral-500 text-2xl font-semibold mb-4">About Our Project</h2>
          <p>
            Tungsten Orbit is a solar system modeling application that allows users to see major objects in the solar system 
            and learn facts about them, including orbit path, classification, and more. We use real-time NASA data libraries 
            to provide accurate orbital layouts for educational and informational purposes. Our goal was to create a user-friendly 
            program that was easy to understand and fun. We hope you enjoy our program!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
