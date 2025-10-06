import React from 'react';
import { AboutCard, AboutProjectCard } from '../../../components/card';

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-800 text-white p-8">
      <div className="space-y-8">
        <AboutCard />
        <AboutProjectCard />
      </div>
    </div>
  );
}

export default About;
