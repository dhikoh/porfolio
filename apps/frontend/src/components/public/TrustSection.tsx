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
    <section className="py-16 bg-white border-y border-[#03151a]/5" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((stat, idx) => {
            const Icon = iconMap[stat.icon] || Package;
            return (
              <motion.div key={stat.id} className="text-center" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: idx * 0.15 }}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#002329] flex items-center justify-center text-[#5cf28e]">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#03151a] mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>{stat.value}</div>
                <div className="text-sm text-[#03151a]/50">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
