'use client';
import { useState, useEffect } from 'react';
import { GooeyLoader } from '@/components/ui/GooeyLoader';

export default function SplashScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`splash-screen ${hidden ? 'hidden' : ''}`}>
      <GooeyLoader
        primaryColor="#5cf28e"
        secondaryColor="#002329"
        borderColor="#33824d"
      />
    </div>
  );
}
