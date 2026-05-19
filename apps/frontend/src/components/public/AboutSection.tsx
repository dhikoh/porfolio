'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AboutProps {
  profile: { fullName: string; summary: string };
  settings?: Record<string, string>;
}

export default function AboutSection({ profile, settings }: AboutProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const paragraphs = profile.summary.split('\n').filter(Boolean);

  return (
    <section id="about" className="py-24 md:py-32 bg-white relative glow-green" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 text-center" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-[#03151a] tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.2em' }}>
            {settings?.section_about_title || 'Tentang Saya'}
          </h2>
        </motion.div>
        <motion.div className="max-w-3xl mx-auto space-y-5" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
          {paragraphs.map((p, idx) => (
            <p key={idx} className={`leading-relaxed text-center ${idx === 0 ? 'text-lg md:text-xl text-[#03151a]' : 'text-base text-[#03151a]/70'}`}>{p}</p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
