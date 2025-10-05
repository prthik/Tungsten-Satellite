import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8">      
      <div className="space-y-8">
        {/* About Us Section */}
        <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-500">
          <h2 className="text-neutral-500 text-2xl font-semibold mb-4">About Us</h2>
          <p>
            We are Tungsten Cube (legally distinct)
          </p>
        </div>

        {/* About Our Project Section */}
        <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-500">
          <h2 className="text-neutral-500 text-2xl font-semibold mb-4">About Our Project</h2>
          <p>
            Tungsten Satellite is a next-generation platform designed to empower users with advanced data analytics, seamless experiment management, and real-time collaboration. Building on the success of our previous service, Tungsten Orbit, this project introduces enhanced security, a modern user interface, and robust reporting tools. Our mission is to make complex scientific workflows accessible, efficient, and enjoyable for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
