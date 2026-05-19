'use client';

import { useEffect, useState } from 'react';
import { BarChart3, MessageCircle, FolderKanban, Eye, Activity, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalytics().catch(() => null),
      api.getMessages().catch(() => []),
      api.getAdminProjects().catch(() => []),
    ]).then(([a, m, p]) => {
      setAnalytics(a as Record<string, unknown>);
      setMessages(m as Record<string, unknown>[]);
      setProjects(p as Record<string, unknown>[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse text-zinc-500">Memuat dashboard...</div>;

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const totalViews = (analytics as { totalViews?: number })?.totalViews || 0;
  const todayViews = (analytics as { todayViews?: number })?.todayViews || 0;

  const statCards = [
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Views Hari Ini', value: todayViews.toLocaleString(), icon: BarChart3, color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Total Proyek', value: projects.length, icon: FolderKanban, color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Pesan Belum Dibaca', value: unreadCount, icon: MessageCircle, color: 'bg-amber-500/10 text-amber-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Selamat datang di Portfolio CMS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-semibold text-white">{card.value}</div>
            <div className="text-sm text-zinc-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-zinc-500" />
            <h2 className="text-white font-medium">Pesan Terbaru</h2>
          </div>
          <div className="space-y-3">
            {messages.length === 0 && <p className="text-zinc-600 text-sm">Belum ada pesan.</p>}
            {messages.slice(0, 5).map((msg) => (
              <div key={msg.id as string} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.isRead ? 'bg-zinc-700' : 'bg-emerald-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white font-medium truncate">{msg.name as string}</div>
                  <p className="text-xs text-zinc-500 truncate">{msg.content as string}</p>
                </div>
                <div className="text-xs text-zinc-600 flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.createdAt as string).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-zinc-500" />
            <h2 className="text-white font-medium">Status Sistem</h2>
          </div>
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}

function SystemHealth() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.getHealth().then((h) => setHealth(h as Record<string, unknown>)).catch(() => {});
  }, []);

  if (!health) return <p className="text-zinc-600 text-sm">Checking...</p>;

  const memory = health.memory as { used: number; total: number; unit: string } | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30">
        <span className="text-sm text-zinc-400">Status</span>
        <span className={`text-sm font-medium ${health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>{health.status === 'healthy' ? '● Healthy' : '● Unhealthy'}</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30">
        <span className="text-sm text-zinc-400">Database</span>
        <span className={`text-sm font-medium ${health.database === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>{health.database === 'connected' ? '● Connected' : '● Disconnected'}</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30">
        <span className="text-sm text-zinc-400">Memory</span>
        <span className="text-sm text-zinc-300">{memory ? `${memory.used}/${memory.total} ${memory.unit}` : '-'}</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30">
        <span className="text-sm text-zinc-400">Uptime</span>
        <span className="text-sm text-zinc-300">{typeof health.uptime === 'number' ? `${Math.floor((health.uptime as number) / 3600)}h ${Math.floor(((health.uptime as number) % 3600) / 60)}m` : '-'}</span>
      </div>
    </div>
  );
}
