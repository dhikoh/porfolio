'use client';
import { useState } from 'react';
import { FileDown, ExternalLink } from 'lucide-react';
import { getAccessToken } from '@/lib/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Raw fetch with token — used instead of apiFetch because
 * we need raw Response (text/html), not parsed JSON.
 * Includes manual token-refresh retry on 401.
 */
async function authedFetch(url: string): Promise<Response> {
  const token = getAccessToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    // Try refreshing token
    const { tryRefreshToken } = await import('@/lib/api-client');
    const ok = await tryRefreshToken();
    if (ok) {
      const newToken = getAccessToken();
      return fetch(url, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
    }
    throw new Error('Sesi telah berakhir, silakan login ulang');
  }

  return res;
}

export default function AdminExportPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/export/cv`);
      if (!res.ok) throw new Error('Gagal mengexport');
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?(.+?)"?$/);
      a.download = match?.[1] || 'CV-Portfolio.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal mengexport: ' + (err instanceof Error ? err.message : 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await authedFetch(`${API_URL}/export/cv`);
      if (!res.ok) throw new Error('Gagal preview');
      const html = await res.text();
      const w = window.open('', '_blank');
      if (w) { w.document.write(html); w.document.close(); }
    } catch (err) {
      alert('Gagal preview: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-white">Export CV / Resume</h2>
      <p className="text-zinc-400 text-sm">Generate CV profesional dari data portfolio Anda. File HTML yang dihasilkan bisa langsung dicetak sebagai PDF melalui browser (Ctrl+P).</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={handlePreview} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors text-left">
          <ExternalLink className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="text-white font-medium mb-1">Preview CV</h3>
          <p className="text-zinc-500 text-xs">Lihat preview di tab baru</p>
        </button>

        <button onClick={handleExport} disabled={loading} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors text-left disabled:opacity-50">
          <FileDown className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="text-white font-medium mb-1">{loading ? 'Generating...' : 'Download CV'}</h3>
          <p className="text-zinc-500 text-xs">Download sebagai HTML, lalu print ke PDF</p>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5">
        <p className="text-zinc-500 text-xs">💡 Tip: Buka file HTML yang didownload di browser, lalu tekan <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">Ctrl+P</kbd> untuk mencetak sebagai PDF dengan layout profesional.</p>
      </div>
    </div>
  );
}
