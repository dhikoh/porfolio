'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, Package, GraduationCap } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { TrendingUp, Package, GraduationCap };

interface StatItem { id: string; label: string; value: string; icon: string; }

export default function TrustSection({ stats }: { stats: StatItem[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 bg-[#09090b] border-y border-white/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((stat, idx) => {
            const Icon = iconMap[stat.icon] || Package;
            return (
              <motion.div key={stat.id} className="text-center" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.15 }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl md:text-4xl font-semibold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
