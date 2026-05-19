'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface TimelineItem { id: string; year: string; title: string; description: string; }

export default function TimelineSection({ timeline, settings }: { timeline: TimelineItem[], settings?: Record<string, string> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="journey" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12" ref={ref}>
        <motion.div className="mb-16 md:mb-20 text-center" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-[#03151a] tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.2em' }}>
            {settings?.section_timeline_title || 'Perjalanan Saya.'}
          </h2>
          <p className="text-[#03151a]/60 text-base sm:text-lg leading-relaxed max-w-[500px] mx-auto">
            {settings?.section_timeline_subtitle || 'Dari hukum ke bisnis, dari bisnis ke teknologi — setiap langkah membawa saya lebih dekat ke solusi.'}
          </p>
        </motion.div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-[#5cf28e]/20 via-[#5cf28e] to-[#5cf28e]/20" />
          <div className="flex flex-col gap-8 md:gap-12">
            {timeline.map((item, idx) => (
              <motion.div key={item.id} className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.1 }}>
                <div className={`flex items-start md:w-1/2 ${idx % 2 === 0 ? 'md:justify-end md:pr-12' : 'md:justify-start md:pl-12'}`}>
                  <div className="ml-12 md:ml-0 p-6 rounded-3xl bg-white border border-[#03151a]/10 hover:border-[#5cf28e]/40 hover:shadow-lg transition-all duration-300 w-full md:max-w-md">
                    <div className="text-sm font-mono text-[#5cf28e] font-bold mb-2">{item.year}</div>
                    <h3 className="text-lg font-bold text-[#03151a] mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>{item.title}</h3>
                    <p className="text-sm text-[#03151a]/60 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 top-8 w-3.5 h-3.5 -translate-x-1/2 rounded-full bg-[#5cf28e] border-4 border-white z-10 shadow-[0_0_12px_rgba(92,242,142,0.5)]" />
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
