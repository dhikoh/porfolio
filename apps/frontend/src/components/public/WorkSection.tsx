'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { toDirectImageUrl } from '@/lib/image-utils';

interface ProjectItem { id: string; title: string; slug: string; description: string; domain: string; liveUrl: string; imageUrl: string; videoUrl: string; tags: string; }

export default function WorkSection({ projects }: { projects: ProjectItem[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="work" className="py-24 md:py-32 bg-[#002329] relative" ref={ref}>
      <div className="absolute inset-0 dot-pattern pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-white tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.2em' }}>Karya Digital.</h2>
            <p className="text-white/60 text-base sm:text-lg leading-relaxed">Produk digital yang dibangun untuk memecahkan masalah nyata — dari logistik, edukasi, hingga manajemen peternakan.</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => {
            let tags: string[] = [];
            try { tags = JSON.parse(project.tags); } catch { tags = []; }
            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.1 }} className="group relative rounded-3xl bg-[#003038] border border-white/5 overflow-hidden hover:border-[#5cf28e]/30 transition-all duration-300">
                <div className="relative aspect-video bg-[#001a1f] overflow-hidden">
                  {project.imageUrl ? (
                    <Image src={toDirectImageUrl(project.imageUrl)} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><span className="text-6xl font-bold text-white/10">{project.title[0]}</span></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002329]/80 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (<span key={tag} className="px-2.5 py-1 bg-[#002329]/70 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/10">{tag}</span>))}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>{project.title}</h3>
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5cf28e]/10 flex items-center justify-center text-[#5cf28e] hover:bg-[#5cf28e] hover:text-[#002329] transition-all duration-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {project.domain && <p className="text-sm text-white/40 mb-3 font-mono">{project.domain}</p>}
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{project.description}</p>
                  <a href={`/project/${project.slug}`} className="inline-flex items-center gap-2 text-sm text-[#5cf28e] font-medium hover:gap-3 transition-all">
                    Lihat Detail <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
