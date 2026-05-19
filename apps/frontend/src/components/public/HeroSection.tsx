'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toDirectImageUrl } from '@/lib/image-utils';

interface HeroSectionProps {
  profile: {
    fullName: string;
    heroTitle: string;
    heroSubtitle: string;
    availableText: string;
    ctaText: string;
    ctaEmail: string;
    resumeUrl: string;
    avatarUrl: string;
  };
}

export default function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-[#002329]">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10 w-full py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[588px]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-medium text-white/80 mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5cf28e] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5cf28e]" />
                </span>
                {profile.availableText}
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-medium text-white tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {profile.heroTitle.split('*').length === 3 ? (
                <>
                  {profile.heroTitle.split('*')[0]}
                  <br className="hidden md:block" />
                  <span className="text-[#5cf28e]">
                    {profile.heroTitle.split('*')[1]}
                  </span>
                  {profile.heroTitle.split('*')[2]}
                </>
              ) : (
                profile.heroTitle.replace(/\*/g, '')
              )}
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg text-white/60 max-w-[500px] mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {profile.heroSubtitle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <a href="#contact" className="w-full sm:w-auto px-8 py-3.5 bg-[#5cf28e] text-[#002329] rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#50c878] transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(92,242,142,0.5)]">
                {profile.ctaText} <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#work" className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white border border-white/20 rounded-full font-medium flex items-center justify-center hover:bg-white/5 transition-colors">
                Lihat Karya
              </a>
            </motion.div>
          </div>

          {/* Right - Avatar card */}
          <motion.div
            className="relative flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative w-[320px] h-[400px] md:w-[404px] md:h-[512px] rounded-3xl overflow-hidden bg-[#003038]">
              {profile.avatarUrl ? (
                <Image src={toDirectImageUrl(profile.avatarUrl)} alt={profile.fullName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl font-bold text-white/20">{profile.fullName?.split(' ').map(n => n[0]).join('')}</span>
                </div>
              )}
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 md:-left-12 px-5 py-3 rounded-2xl bg-white shadow-xl border border-gray-100">
              <p className="text-sm font-bold text-[#002329]">🚀 Digital Builder</p>
              <p className="text-xs text-gray-500">{profile.fullName}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
