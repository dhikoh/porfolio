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
    <section className="py-24 md:py-32 bg-[#09090b] relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 max-w-2xl" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">{settings?.section_expertise_title || 'Keahlian Inti.'}</h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">{settings?.section_expertise_subtitle || 'Kompetensi utama yang menjadi fondasi dalam membangun solusi digital.'}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill, idx) => {
            const Icon = iconMap[skill.icon] || Package;
            return (
              <motion.div key={skill.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all group" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.1 }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{skill.name}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{skill.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
