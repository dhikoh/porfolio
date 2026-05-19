'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, User, FolderKanban, Zap, Briefcase, GraduationCap,
  Clock, BarChart3, Cog, MessageCircle, Image as ImageIcon, Settings,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Activity, FileDown,
  FileText, Combine,
} from 'lucide-react';
import { isAuthenticated, clearTokens, api } from '@/lib/api-client';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Profil', href: '/admin/profile', icon: User },
  { label: 'Proyek', href: '/admin/projects', icon: FolderKanban },
  { label: 'Keahlian', href: '/admin/skills', icon: Zap },
  { label: 'Pengalaman', href: '/admin/experiences', icon: Briefcase },
  { label: 'Pendidikan', href: '/admin/education', icon: GraduationCap },
  { label: 'Timeline', href: '/admin/timeline', icon: Clock },
  { label: 'Statistik', href: '/admin/stats', icon: BarChart3 },
  { label: 'Proses Kerja', href: '/admin/process-steps', icon: Cog },
  { label: 'Pesan', href: '/admin/messages', icon: MessageCircle },
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Analitik', href: '/admin/analytics', icon: Activity },
  { label: 'Export CV', href: '/admin/export', icon: FileDown },
  { label: 'Surat Lamaran', href: '/admin/surat-lamaran', icon: FileText },
  { label: 'Gabung Dokumen', href: '/admin/document-merger', icon: Combine },
  { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') { setReady(true); return; }
    if (!isAuthenticated()) { router.replace('/admin/login'); return; }
    setReady(true);
  }, [pathname, router]);

  const handleLogout = useCallback(async () => {
    try { await api.logout(); } catch { clearTokens(); }
    router.push('/admin/login');
  }, [router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!ready) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-pulse text-zinc-500">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col bg-zinc-900/50 border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          {!collapsed && <span className="text-white font-bold text-lg">Portfolio CMS</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-zinc-400 hover:text-white p-1">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-white bg-white/5 border-r-2 border-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center' : ''}`} title={collapsed ? item.label : undefined}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className={`flex items-center gap-3 text-sm text-zinc-500 hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-4 h-4" />{!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden h-14 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="ml-3 text-white font-semibold text-sm">Portfolio CMS</span>
        </header>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <nav className="relative bg-zinc-900 w-64 h-full py-4 space-y-1 overflow-y-auto">
              <div className="px-4 pb-4 mb-4 border-b border-white/5">
                <span className="text-white font-bold text-lg">Portfolio CMS</span>
              </div>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? 'text-white bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                    <item.icon className="w-4 h-4" /><span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 px-4 border-t border-white/5 mt-4">
                <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-zinc-500 hover:text-red-400"><LogOut className="w-4 h-4" /><span>Keluar</span></button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
