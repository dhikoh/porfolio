'use client';
import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Globe, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';

interface AnalyticsData {
  totalViews: number; todayViews: number; weekViews: number; monthViews: number;
  topPages: Array<{ path: string; count: number }>;
  recentViews: Array<{ path: string; userAgent: string; createdAt: string }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(d => { setData(d as unknown as AnalyticsData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-zinc-500">Gagal memuat data analitik</p>;

  const stats = [
    { label: 'Hari Ini', value: data.todayViews, icon: Clock, color: 'text-blue-400' },
    { label: '7 Hari', value: data.weekViews, icon: TrendingUp, color: 'text-emerald-400' },
    { label: '30 Hari', value: data.monthViews, icon: Globe, color: 'text-purple-400' },
    { label: 'Total', value: data.totalViews, icon: Eye, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-semibold text-white">Analitik Pengunjung</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-2xl font-semibold text-white">{s.value}</div>
            <div className="text-zinc-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <h3 className="text-sm font-medium text-white mb-4">Halaman Populer (30 hari)</h3>
          <div className="space-y-2">
            {(data.topPages || []).map((p, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 text-sm">
                <span className="text-zinc-400 truncate">{p.path || '/'}</span>
                <span className="text-white font-medium">{String(p.count)}</span>
              </div>
            ))}
            {(!data.topPages || data.topPages.length === 0) && <p className="text-zinc-600 text-sm">Belum ada data</p>}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <h3 className="text-sm font-medium text-white mb-4">Kunjungan Terbaru</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(data.recentViews || []).slice(0, 15).map((v, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 text-xs">
                <span className="text-zinc-400">{v.path}</span>
                <span className="text-zinc-600">{new Date(v.createdAt).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
