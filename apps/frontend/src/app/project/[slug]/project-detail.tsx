'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Code2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toDirectImageUrl } from '@/lib/image-utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ProjectDetail({ project }: { project: any }) {
  let tags: string[] = [];
  try { tags = JSON.parse(project.tags); } catch { tags = []; }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-[#002329] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/#work" className="flex items-center gap-2 text-sm text-white/70 hover:text-[#5cf28e] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="flex gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#5cf28e] text-[#002329] rounded-full text-sm font-bold hover:bg-[#50c878] transition-colors">
                <ExternalLink className="w-4 h-4" /> Live
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
                <Code2 className="w-4 h-4" /> Code
              </a>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {project.imageUrl && (
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#002329]/5 mb-8 border border-[#03151a]/5">
              <Image src={toDirectImageUrl(project.imageUrl)} alt={project.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-[#002329] text-white text-xs font-medium rounded-full">{tag}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#03151a] tracking-tight mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>{project.title}</h1>
          {project.domain && <p className="text-[#03151a]/40 font-mono text-sm mb-6">{project.domain}</p>}
          <p className="text-lg text-[#03151a]/70 leading-relaxed mb-8">{project.description}</p>
          {project.longDesc && (
            <div className="prose max-w-none text-[#03151a]/60 leading-relaxed whitespace-pre-wrap">{project.longDesc}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
