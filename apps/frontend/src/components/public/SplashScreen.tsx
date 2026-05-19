'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 1500);
    const removeTimer = setTimeout(() => setRemoved(true), 2000);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, []);

  if (removed) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#09090b] flex items-center justify-center transition-opacity duration-500 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#09090b] text-2xl font-extrabold animate-pulse">
          D
        </div>
        <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: '100%', animation: 'loading 1.2s ease-in-out' }} />
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
