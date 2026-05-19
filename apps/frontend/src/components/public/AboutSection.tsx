'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { toDirectImageUrl } from '@/lib/image-utils';

interface AboutProps {
  profile: { fullName: string; summary: string; avatarUrl: string };
  settings?: Record<string, string>;
}

export default function AboutSection({ profile, settings }: AboutProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const paragraphs = profile.summary.split('\n').filter(Boolean);

  return (
    <section id="about" className="py-24 md:py-32 bg-white relative glow-green" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 max-w-2xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-[#03151a] tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.2em' }}>
            {settings?.section_about_title || 'Tentang Saya'}
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <motion.div className="md:col-span-4 flex justify-center md:justify-start" initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-[#002329] border border-[#002329]/10 overflow-hidden flex items-center justify-center relative shadow-xl">
                {profile.avatarUrl ? (
                  <Image src={toDirectImageUrl(profile.avatarUrl)} alt={profile.fullName} fill className="object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl md:text-7xl font-bold text-white/30">{profile.fullName.split(' ').map(n => n[0]).join('')}</div>
                    <p className="text-white/30 text-xs mt-2">{profile.fullName}</p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-[#5cf28e] border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-lg">🇮🇩</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="md:col-span-8 space-y-5" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }}>
            {paragraphs.map((p, idx) => (
              <p key={idx} className={`leading-relaxed ${idx === 0 ? 'text-lg md:text-xl text-[#03151a]' : 'text-base text-[#03151a]/70'}`}>{p}</p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
