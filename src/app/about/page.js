import React from 'react';
import { AboutCard, AboutProjectCard } from '../../../components/card';

const About = () => {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-neutral-800 text-white p-8">
      <div className="space-y-8">
        <AboutCard />
        <AboutProjectCard />
      </div>
    </div>
  );
}

export default About;
