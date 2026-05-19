'use client';
import { useState, useEffect, useRef } from 'react';
import { Combine, Upload, Trash2, Download, Loader2, FileText, Image as ImageIcon, File, GripVertical, X } from 'lucide-react';
import { api } from '@/lib/api-client';

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png';
const FILE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'image/jpeg': ImageIcon,
  'image/png': ImageIcon,
};

export default function DocumentMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getMergedDocuments();
      setHistory(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => {
      const ext = f.name.toLowerCase().split('.').pop();
      return ['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '');
    });
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setFiles(prev => {
      const arr = [...prev];
      const [item] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, item);
      return arr;
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage('Minimal 2 file untuk digabungkan');
      return;
    }
    setMerging(true);
    setMessage('');
    try {
      await api.mergeDocuments(files, title || undefined);
      setMessage('Dokumen berhasil digabungkan!');
      setFiles([]);
      setTitle('');
      await loadHistory();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal menggabungkan');
    }
    setMerging(false);
  };

  const handleDownload = async (id: string, docTitle: string) => {
    try {
      await api.downloadMergedDocument(id, docTitle);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal download');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      await api.deleteMergedDocument(id);
      await loadHistory();
    } catch { /* ignore */ }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gabung Dokumen</h1>
          <p className="text-zinc-500 text-sm mt-1">Gabungkan beberapa file menjadi 1 PDF</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <label className="text-sm text-zinc-400 block mb-1.5">Judul Dokumen (opsional)</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Berkas Lamaran Kerja" className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20'}`}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-zinc-500" />
          <p className="text-zinc-400 text-sm">Drag & drop file di sini atau klik untuk browse</p>
          <p className="text-zinc-600 text-xs mt-1">PDF, JPG, PNG</p>
        </div>
        <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} multiple onChange={handleFileSelect} className="hidden" />

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-zinc-400 mb-2">{files.length} file dipilih — drag untuk mengatur urutan</p>
            {files.map((file, idx) => {
              const Icon = FILE_ICONS[file.type] || File;
              return (
                <div
                  key={`${file.name}-${idx}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 bg-zinc-800/50 rounded-xl px-4 py-3 transition-colors cursor-grab active:cursor-grabbing ${dragIdx === idx ? 'opacity-50' : ''}`}
                >
                  <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                  <Icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-600">{formatSize(file.size)}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeFile(idx); }} className="text-zinc-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            <button onClick={handleMerge} disabled={merging || files.length < 2} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4">
              {merging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Combine className="w-4 h-4" />}
              Gabungkan & Simpan
            </button>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">History</h2>
        {loading ? (
          <div className="text-zinc-500 animate-pulse">Memuat...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Combine className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada dokumen yang digabungkan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((doc) => {
              const sources = JSON.parse((doc.sourceFiles as string) || '[]');
              return (
                <div key={doc.id as string} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium">{doc.title as string}</h3>
                    <p className="text-zinc-500 text-sm">{sources.length} file · {doc.pageCount} halaman · {formatSize(doc.fileSize as number)}</p>
                    <p className="text-zinc-600 text-xs mt-1">{new Date(doc.createdAt as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownload(doc.id as string, doc.title as string)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-medium transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={() => handleDelete(doc.id as string)} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-xl text-xs transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
