'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, Zap, Bot, Package } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Search, Zap, Bot, Package };

interface SkillItem { id: string; name: string; level: number; icon: string; description: string; }

export default function ExpertiseSection({ skills, settings }: { skills: SkillItem[], settings?: Record<string, string> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 bg-white relative" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 text-center" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-[#03151a] tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.2em' }}>
            {settings?.section_expertise_title || 'Keahlian Inti.'}
          </h2>
          <p className="text-[#03151a]/60 text-base sm:text-lg leading-relaxed max-w-[500px] mx-auto">
            {settings?.section_expertise_subtitle || 'Kompetensi utama yang menjadi fondasi dalam membangun solusi digital.'}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, idx) => {
            const Icon = iconMap[skill.icon] || Package;
            return (
              <motion.div key={skill.id} className="p-6 rounded-3xl bg-white border border-[#03151a]/10 hover:border-[#5cf28e]/50 hover:shadow-lg transition-all duration-300 group" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.1 }}>
                <div className="w-14 h-14 rounded-2xl bg-[#002329] flex items-center justify-center text-[#5cf28e] mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#03151a] mb-3" style={{ fontFamily: 'Satoshi, sans-serif' }}>{skill.name}</h3>
                <p className="text-sm text-[#03151a]/60 leading-relaxed">{skill.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
