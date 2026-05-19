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
    <div className="min-h-screen bg-[#09090b]">
      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/#work" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="flex gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors">
                <ExternalLink className="w-4 h-4" /> Live
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors">
                <Code2 className="w-4 h-4" /> Code
              </a>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {project.imageUrl && (
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-800 mb-8">
              <Image src={toDirectImageUrl(project.imageUrl)} alt={project.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-full border border-white/5">{tag}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">{project.title}</h1>
          {project.domain && <p className="text-zinc-500 font-mono text-sm mb-6">{project.domain}</p>}
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">{project.description}</p>
          {project.longDesc && (
            <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed whitespace-pre-wrap">{project.longDesc}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
