'use client';
import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api-client';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getMedia().then(setMedia).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadMedia(file);
      const updated = await api.getMedia();
      setMedia(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload gagal');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus media ini?')) return;
    await api.deleteMedia(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="animate-pulse text-zinc-500">Memuat media...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Media Manager</h1>
          <p className="text-zinc-500 text-sm mt-1">{media.length} file</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium cursor-pointer hover:bg-zinc-200 transition-colors">
          <Upload className="w-4 h-4" />{uploading ? 'Uploading...' : 'Upload'}
          <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*,video/*,application/pdf" />
        </label>
      </div>
      {media.length === 0 ? (
        <div className="text-center py-12 text-zinc-600">Belum ada media. Upload file pertama Anda.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id as string} className="group relative rounded-xl bg-zinc-900/50 border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
              <div className="aspect-square bg-zinc-800 flex items-center justify-center">
                {(item.mimeType as string)?.startsWith('image/') ? (
                  <img src={item.url as string} alt={item.filename as string} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-zinc-400 truncate">{item.filename as string}</p>
                <p className="text-xs text-zinc-600">{((item.size as number) / 1024).toFixed(0)} KB</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyUrl(item.url as string)} className="p-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-lg text-zinc-400 hover:text-white">
                  {copied === item.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button onClick={() => handleDelete(item.id as string)} className="p-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-lg text-zinc-400 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
