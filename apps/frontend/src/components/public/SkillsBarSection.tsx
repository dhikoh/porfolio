'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SkillItem { id: string; name: string; category: string; level: number; icon: string; }

export default function SkillsBarSection({ skills, settings }: { skills: SkillItem[], settings?: Record<string, string> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const technicalSkills = skills.filter(s => s.category === 'technical');

  return (
    <section className="py-24 md:py-32 bg-[#09090b] border-t border-white/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 max-w-2xl" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">{settings?.section_skills_title || 'Technical Skills.'}</h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">{settings?.section_skills_subtitle || 'Kemampuan teknis yang terus diasah melalui pengalaman nyata.'}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {technicalSkills.map((skill, idx) => (
            <motion.div key={skill.id} initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: idx * 0.05 }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-300 font-medium">{skill.name}</span>
                <span className="text-xs text-zinc-500 font-mono">{skill.level}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-zinc-500 to-white rounded-full" initial={{ width: 0 }} animate={isInView ? { width: `${skill.level}%` } : { width: 0 }} transition={{ duration: 1, delay: 0.3 + idx * 0.05 }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
