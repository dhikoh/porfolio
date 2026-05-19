'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface StepItem { id: string; number: string; title: string; description: string; }

export default function ProcessSection({ steps, settings }: { steps: StepItem[], settings?: Record<string, string> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 bg-white border-t border-[#03151a]/5" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 text-center" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-[#03151a] tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.2em' }}>
            {settings?.section_process_title || 'Cara Kerja Saya.'}
          </h2>
          <p className="text-[#03151a]/60 text-base sm:text-lg leading-relaxed max-w-[500px] mx-auto">
            {settings?.section_process_subtitle || 'Pendekatan sistematis dalam memecahkan masalah dan membangun solusi.'}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => (
            <motion.div key={step.id} className="p-6 rounded-3xl bg-white border border-[#03151a]/10 hover:border-[#5cf28e]/50 hover:shadow-lg transition-all duration-300" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.1 }}>
              <div className="text-4xl font-bold text-[#5cf28e]/30 mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>{step.number}</div>
              <h3 className="text-lg font-bold text-[#03151a] mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>{step.title}</h3>
              <p className="text-sm text-[#03151a]/60 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
