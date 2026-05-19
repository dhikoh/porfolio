'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Combine, Upload, Trash2, Download, Loader2, FileText, Image as ImageIcon, File, GripVertical, X, AlertCircle, CheckCircle2, Shrink, Stamp } from 'lucide-react';
import { api } from '@/lib/api-client';

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

const FILE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'image/jpeg': ImageIcon,
  'image/png': ImageIcon,
};

export default function DocumentMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Compression modal state
  const [compressId, setCompressId] = useState<string | null>(null);
  const [compressQuality, setCompressQuality] = useState(50);
  const [compressTarget, setCompressTarget] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [compressResult, setCompressResult] = useState<{ originalSize: number; compressedSize: number; reduction: string } | null>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    try { setHistory(await api.getMergedDocuments()); } catch { /* ignore */ }
    setLoading(false);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    if (type === 'success') setTimeout(() => setMessage(''), 5000);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIMES.includes(file.type)) return `"${file.name}" — tipe tidak didukung.`;
    if (file.size > MAX_FILE_SIZE) return `"${file.name}" — ukuran melebihi 100MB.`;
    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const errors: string[] = [];
    const valid: File[] = [];
    newFiles.forEach(f => {
      const err = validateFile(f);
      if (err) errors.push(err);
      else valid.push(f);
    });
    if (errors.length > 0) showMessage(errors.join('\n'), 'error');
    if (valid.length > 0) setFiles(prev => [...prev, ...valid]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

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
    if (files.length < 2) { showMessage('Minimal 2 file', 'error'); return; }
    setMerging(true);
    setMessage('');
    try {
      await api.mergeDocuments(files, title || undefined, watermarkText || undefined);
      showMessage('Dokumen berhasil digabungkan!', 'success');
      setFiles([]);
      setTitle('');
      await loadHistory();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Gagal menggabungkan', 'error');
    }
    setMerging(false);
  };

  const handleCompress = async () => {
    if (!compressId) return;
    setCompressing(true);
    setCompressResult(null);
    try {
      const target = compressTarget ? parseFloat(compressTarget) : undefined;
      const result = await api.compressMergedDocument(compressId, compressQuality, target);
      setCompressResult(result);
      showMessage(`Berhasil dikompres! Pengurangan: ${result.reduction}`, 'success');
      await loadHistory();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Gagal mengompresi', 'error');
    }
    setCompressing(false);
  };

  const handleDownload = async (id: string, docTitle: string) => {
    try { await api.downloadMergedDocument(id, docTitle); }
    catch (err) { showMessage(err instanceof Error ? err.message : 'Gagal download', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try { await api.deleteMergedDocument(id); await loadHistory(); showMessage('Dihapus', 'success'); }
    catch { /* ignore */ }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const qualityLabel = (q: number) => {
    if (q <= 25) return 'Rendah (layar)';
    if (q <= 50) return 'Sedang (ebook)';
    if (q <= 75) return 'Baik (cetak)';
    return 'Tinggi (profesional)';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gabung Dokumen</h1>
          <p className="text-zinc-500 text-sm mt-1">Gabungkan file menjadi 1 PDF · watermark · kompresi</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-start gap-2 ${messageType === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {messageType === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="whitespace-pre-line">{message}</span>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Judul Dokumen (opsional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Berkas Lamaran Kerja" className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">
              <Stamp className="w-3.5 h-3.5 inline mr-1" />Watermark Footer (opsional)
            </label>
            <input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="e.g. Dokumen milik Dhiko Herlambang" className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${dragOver ? 'border-white/40 bg-white/5 scale-[1.01]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-white' : 'text-zinc-600'}`} />
          <p className="text-zinc-400 text-sm font-medium">Drag & drop file di sini</p>
          <p className="text-zinc-600 text-xs mt-1">atau klik untuk browse</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-md">PDF</span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-md">JPG</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-md">PNG</span>
          </div>
          <p className="text-zinc-700 text-[10px] mt-2">Maks 100MB per file · Maks 20 file</p>
        </div>
        <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} multiple onChange={handleFileSelect} className="hidden" />

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">
                <span className="text-white font-medium">{files.length}</span> file · <span className="text-white font-medium">{formatSize(totalSize)}</span>
              </p>
              <button onClick={() => setFiles([])} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Hapus semua</button>
            </div>
            <div className="space-y-1.5">
              {files.map((file, idx) => {
                const Icon = FILE_ICONS[file.type] || File;
                const ext = file.name.split('.').pop()?.toUpperCase() || '';
                return (
                  <div key={`${file.name}-${idx}-${file.size}`} draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-xl px-4 py-2.5 transition-all cursor-grab active:cursor-grabbing ${dragIdx === idx ? 'opacity-40 scale-95' : ''}`}>
                    <GripVertical className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                    <span className="text-zinc-600 text-[10px] font-mono w-5 text-center">{idx + 1}</span>
                    <Icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0"><p className="text-sm text-zinc-300 truncate">{file.name}</p></div>
                    <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-zinc-800 rounded">{ext}</span>
                    <span className="text-xs text-zinc-600 w-16 text-right">{formatSize(file.size)}</span>
                    <button onClick={e => { e.stopPropagation(); removeFile(idx); }} className="text-zinc-600 hover:text-red-400 transition-colors p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                );
              })}
            </div>
            {files.length < 2 && (
              <div className="mt-3 text-xs text-amber-400/80 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Tambahkan minimal 1 file lagi
              </div>
            )}
            <button onClick={handleMerge} disabled={merging || files.length < 2} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-zinc-950 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-40 mt-4">
              {merging ? <><Loader2 className="w-4 h-4 animate-spin" /> Menggabungkan...</> : <><Combine className="w-4 h-4" /> Gabungkan {files.length} File → 1 PDF</>}
            </button>
          </div>
        )}
      </div>

      {/* Compression Modal */}
      {compressId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setCompressId(null); setCompressResult(null); }} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Shrink className="w-5 h-5" /> Kompres PDF</h2>
              <button onClick={() => { setCompressId(null); setCompressResult(null); }} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              {/* Quality slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-400">Kualitas</label>
                  <span className="text-xs text-white bg-zinc-800 px-2 py-0.5 rounded">{compressQuality}% — {qualityLabel(compressQuality)}</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={compressQuality} onChange={e => setCompressQuality(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>Kecil</span><span>Sedang</span><span>Besar</span>
                </div>
              </div>

              {/* Target size */}
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Target Ukuran (MB) — opsional</label>
                <input type="number" min={0.5} step={0.5} value={compressTarget} onChange={e => setCompressTarget(e.target.value)} placeholder="e.g. 5"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
                <p className="text-[10px] text-zinc-600 mt-1">Kosongkan jika hanya ingin mengatur kualitas</p>
              </div>

              {/* Result */}
              {compressResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm">
                  <p className="text-emerald-400 font-medium">Berhasil dikompres!</p>
                  <div className="flex gap-4 mt-1 text-xs text-emerald-400/80">
                    <span>Sebelum: {formatSize(compressResult.originalSize)}</span>
                    <span>→</span>
                    <span>Sesudah: {formatSize(compressResult.compressedSize)}</span>
                    <span className="text-emerald-300 font-medium">-{compressResult.reduction}</span>
                  </div>
                </div>
              )}

              <button onClick={handleCompress} disabled={compressing} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {compressing ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengompresi...</> : <><Shrink className="w-4 h-4" /> Kompres Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">Riwayat Penggabungan</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Combine className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Belum ada dokumen yang digabungkan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((doc) => {
              const sources = JSON.parse((doc.sourceFiles as string) || '[]');
              return (
                <div key={doc.id as string} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm">{doc.title as string}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-zinc-500">{sources.length} file</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-zinc-500">{doc.pageCount as number} hal</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-zinc-500">{formatSize(doc.fileSize as number)}</span>
                      </div>
                      <p className="text-zinc-700 text-[10px] mt-1">{new Date(doc.createdAt as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                      <button onClick={() => { setCompressId(doc.id as string); setCompressResult(null); setCompressQuality(50); setCompressTarget(''); }} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-xl text-xs font-medium transition-colors" title="Kompres PDF">
                        <Shrink className="w-3.5 h-3.5" /> Kompres
                      </button>
                      <button onClick={() => handleDownload(doc.id as string, doc.title as string)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-medium transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button onClick={() => handleDelete(doc.id as string)} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-xl text-xs transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
