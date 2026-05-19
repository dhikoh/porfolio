'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface StepItem { id: string; number: string; title: string; description: string; }

export default function ProcessSection({ steps, settings }: { steps: StepItem[], settings?: Record<string, string> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 bg-[#09090b] border-t border-white/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 max-w-2xl" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">{settings?.section_process_title || 'Cara Kerja Saya.'}</h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">{settings?.section_process_subtitle || 'Pendekatan sistematis dalam memecahkan masalah dan membangun solusi.'}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div key={step.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.1 }}>
              <div className="text-3xl font-bold text-zinc-800 mb-4">{step.number}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
