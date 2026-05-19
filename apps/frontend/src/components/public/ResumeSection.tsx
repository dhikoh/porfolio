'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';

interface ExpItem { id: string; title: string; company: string; location: string; startDate: string; endDate: string; current: boolean; description: string; highlights: string; }
interface EduItem { id: string; degree: string; institution: string; year: number; description: string; }

export default function ResumeSection({ experiences, education, settings }: { experiences: ExpItem[]; education: EduItem[], settings?: Record<string, string> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="resume" className="py-24 md:py-32 bg-[#09090b] relative border-t border-white/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div className="mb-16 md:mb-20 max-w-2xl" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">{settings?.section_resume_title || 'Pengalaman & Pendidikan.'}</h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">{settings?.section_resume_subtitle || 'Perjalanan profesional dari dunia hukum, bisnis, hingga teknologi digital.'}</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"><Briefcase className="w-5 h-5" /></div>
              <h3 className="text-lg font-medium text-white">Pengalaman</h3>
            </div>
            <div className="space-y-6">
              {experiences.map((exp, idx) => {
                let highlights: string[] = [];
                try { highlights = JSON.parse(exp.highlights); } catch { highlights = []; }
                return (
                  <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: idx * 0.1 }} className="relative pl-6 border-l border-white/10">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-950" />
                    <div className="text-xs font-mono text-zinc-500 mb-1">{exp.startDate} — {exp.current ? 'Sekarang' : exp.endDate}</div>
                    <h4 className="text-white font-medium mb-0.5">{exp.title}</h4>
                    <p className="text-zinc-500 text-sm mb-2">{exp.company} • {exp.location}</p>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-3">{exp.description}</p>
                    {highlights.length > 0 && (
                      <ul className="space-y-1">
                        {highlights.map((h, i) => (<li key={i} className="text-zinc-500 text-xs flex items-start gap-2"><span className="text-zinc-600 mt-1">•</span> {h}</li>))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"><GraduationCap className="w-5 h-5" /></div>
              <h3 className="text-lg font-medium text-white">Pendidikan</h3>
            </div>
            <div className="space-y-6">
              {education.map((edu, idx) => (
                <motion.div key={edu.id} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: idx * 0.1 }} className="relative pl-6 border-l border-white/10">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-950" />
                  <div className="text-xs font-mono text-zinc-500 mb-1">{edu.year}</div>
                  <h4 className="text-white font-medium mb-0.5">{edu.degree}</h4>
                  <p className="text-zinc-500 text-sm mb-2">{edu.institution}</p>
                  {edu.description && <p className="text-zinc-400 text-sm leading-relaxed">{edu.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
