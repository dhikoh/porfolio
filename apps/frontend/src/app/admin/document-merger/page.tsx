'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Combine, Upload, Trash2, Download, Loader2, FileText, Image as ImageIcon, File, GripVertical, X, AlertCircle, CheckCircle2, Shrink, Stamp, ChevronDown, ChevronUp, RotateCw } from 'lucide-react';
import { api } from '@/lib/api-client';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const FILE_ICONS: Record<string, typeof FileText> = { 'application/pdf': FileText, 'image/jpeg': ImageIcon, 'image/png': ImageIcon };
const PRESETS = [
  { label: 'Tengah Bawah', x: 50, y: 95, r: 0 },
  { label: 'Tengah', x: 50, y: 50, r: 0 },
  { label: 'Diagonal', x: 50, y: 50, r: -35 },
  { label: 'Kiri Bawah', x: 10, y: 95, r: 0 },
  { label: 'Kanan Bawah', x: 90, y: 95, r: 0 },
];

// A4 canvas dimensions (scaled)
const CANVAS_W = 280;
const CANVAS_H = Math.round(CANVAS_W * (297 / 210)); // ~396

export default function DocumentMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('err');
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Watermark
  const [wmOpen, setWmOpen] = useState(false);
  const [wmText, setWmText] = useState('');
  const [wmX, setWmX] = useState(50);
  const [wmY, setWmY] = useState(95);
  const [wmOpacity, setWmOpacity] = useState(30);
  const [wmSize, setWmSize] = useState(10);
  const [wmRotation, setWmRotation] = useState(0);
  const [draggingWm, setDraggingWm] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Compress
  const [compressId, setCompressId] = useState<string | null>(null);
  const [cQuality, setCQuality] = useState(50);
  const [cTarget, setCTarget] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [cResult, setCResult] = useState<{ originalSize: number; compressedSize: number; reduction: string } | null>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => { setLoading(true); try { setHistory(await api.getMergedDocuments()); } catch {} setLoading(false); };
  const flash = (t: string, ok: boolean) => { setMsg(t); setMsgType(ok ? 'ok' : 'err'); if (ok) setTimeout(() => setMsg(''), 5000); };

  const addFiles = useCallback((list: File[]) => {
    const errs: string[] = [], ok: File[] = [];
    list.forEach(f => { if (!ALLOWED_MIMES.includes(f.type)) errs.push(`"${f.name}" tipe tidak didukung`); else if (f.size > MAX_FILE_SIZE) errs.push(`"${f.name}" > 100MB`); else ok.push(f); });
    if (errs.length) flash(errs.join('\n'), false);
    if (ok.length) setFiles(p => [...p, ...ok]);
  }, []);

  // Drag-reorder
  const reorder = (e: React.DragEvent, idx: number) => { e.preventDefault(); if (dragIdx === null || dragIdx === idx) return; setFiles(p => { const a = [...p]; const [it] = a.splice(dragIdx, 1); a.splice(idx, 0, it); return a; }); setDragIdx(idx); };

  // Watermark drag on canvas
  const handleCanvasPointer = (e: React.PointerEvent | React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    setWmX(Math.round(x)); setWmY(Math.round(y));
  };

  const handleMerge = async () => {
    if (files.length < 2) { flash('Minimal 2 file', false); return; }
    setMerging(true); setMsg('');
    try {
      const wm = wmText.trim() ? { text: wmText.trim(), x: wmX, y: wmY, opacity: wmOpacity, size: wmSize, rotation: wmRotation } : undefined;
      await api.mergeDocuments(files, title || undefined, wm);
      flash('Dokumen berhasil digabungkan!', true); setFiles([]); setTitle(''); await loadHistory();
    } catch (e) { flash(e instanceof Error ? e.message : 'Gagal', false); }
    setMerging(false);
  };

  const handleCompress = async () => {
    if (!compressId) return; setCompressing(true); setCResult(null);
    try {
      const r = await api.compressMergedDocument(compressId, cQuality, cTarget ? parseFloat(cTarget) : undefined);
      setCResult(r); flash(`Dikompres! -${r.reduction}`, true); await loadHistory();
    } catch (e) { flash(e instanceof Error ? e.message : 'Gagal', false); }
    setCompressing(false);
  };

  const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-semibold text-white">Gabung Dokumen</h1><p className="text-zinc-500 text-sm mt-1">Gabung · Watermark · Kompresi</p></div>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-xl text-sm flex items-start gap-2 ${msgType === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{msgType === 'ok' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}<span className="whitespace-pre-line">{msg}</span></div>}

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
        <div className="mb-4"><label className="text-sm text-zinc-400 block mb-1.5">Judul (opsional)</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Berkas Lamaran" className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20" /></div>

        {/* Watermark Collapsible */}
        <div className="mb-4 border border-white/5 rounded-xl overflow-hidden">
          <button onClick={() => setWmOpen(!wmOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"><span className="flex items-center gap-2 text-sm text-zinc-400"><Stamp className="w-4 h-4" />Watermark {wmText.trim() && <span className="text-emerald-400 text-xs">· aktif</span>}</span>{wmOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}</button>
          {wmOpen && (
            <div className="p-4 border-t border-white/5 space-y-4">
              <div><label className="text-xs text-zinc-500 block mb-1">Teks</label><input value={wmText} onChange={e => setWmText(e.target.value)} placeholder="e.g. Dokumen milik Dhiko" className="w-full px-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20" /></div>

              {wmText.trim() && (
                <>
                  {/* Canvas + Controls side by side */}
                  <div className="flex gap-5 flex-col md:flex-row">
                    {/* A4 Canvas */}
                    <div className="flex-shrink-0">
                      <p className="text-[10px] text-zinc-600 mb-1.5 text-center">Klik / drag untuk posisi</p>
                      <div ref={canvasRef} className="relative bg-white rounded-lg cursor-crosshair select-none border-2 border-zinc-700" style={{ width: CANVAS_W, height: CANVAS_H }}
                        onMouseDown={(e) => { handleCanvasPointer(e); setDraggingWm(true); }}
                        onMouseMove={(e) => { if (draggingWm) handleCanvasPointer(e); }}
                        onMouseUp={() => setDraggingWm(false)}
                        onMouseLeave={() => setDraggingWm(false)}>
                        {/* Grid lines */}
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.04) 1px, transparent 1px)', backgroundSize: '20% 20%' }} />
                        {/* Center cross */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-200/40 pointer-events-none" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-200/40 pointer-events-none" />
                        {/* Watermark text */}
                        <div className="absolute pointer-events-none" style={{ left: `${wmX}%`, top: `${wmY}%`, transform: `translate(-50%, -50%) rotate(${wmRotation}deg)`, fontSize: `${Math.max(6, Math.min(wmSize * 0.8, 32))}px`, opacity: wmOpacity / 100, color: '#666', whiteSpace: 'nowrap', fontFamily: 'Helvetica, sans-serif' }}>
                          {wmText}
                        </div>
                        {/* Position dot */}
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none" style={{ left: `${wmX}%`, top: `${wmY}%`, transform: 'translate(-50%, -50%)' }} />
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1 text-center font-mono">x:{wmX}% y:{wmY}% r:{wmRotation}°</p>
                      {/* Presets */}
                      <div className="flex flex-wrap gap-1 mt-2 justify-center">{PRESETS.map(p => <button key={p.label} onClick={() => { setWmX(p.x); setWmY(p.y); setWmRotation(p.r); }} className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors">{p.label}</button>)}</div>
                    </div>

                    {/* Sliders */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div><div className="flex justify-between mb-1"><label className="text-xs text-zinc-500">Opacity</label><span className="text-xs text-white">{wmOpacity}%</span></div><input type="range" min={5} max={100} step={5} value={wmOpacity} onChange={e => setWmOpacity(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" /><div className="flex justify-between text-[9px] text-zinc-700"><span>Transparan</span><span>Solid</span></div></div>
                      <div><div className="flex justify-between mb-1"><label className="text-xs text-zinc-500">Ukuran</label><span className="text-xs text-white">{wmSize}pt</span></div><input type="range" min={6} max={72} step={1} value={wmSize} onChange={e => setWmSize(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" /><div className="flex justify-between text-[9px] text-zinc-700"><span>Kecil</span><span>Besar</span></div></div>
                      <div><div className="flex justify-between mb-1"><label className="text-xs text-zinc-500 flex items-center gap-1"><RotateCw className="w-3 h-3" />Rotasi</label><span className="text-xs text-white">{wmRotation}°</span></div><input type="range" min={-180} max={180} step={5} value={wmRotation} onChange={e => setWmRotation(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" /><div className="flex justify-between text-[9px] text-zinc-700"><span>-180°</span><span>0°</span><span>180°</span></div></div>
                      <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-zinc-500 block mb-1">X %</label><input type="number" min={0} max={100} value={wmX} onChange={e => setWmX(Math.max(0, Math.min(100, Number(e.target.value))))} className="w-full px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white text-xs focus:outline-none" /></div><div><label className="text-xs text-zinc-500 block mb-1">Y %</label><input type="number" min={0} max={100} value={wmY} onChange={e => setWmY(Math.max(0, Math.min(100, Number(e.target.value))))} className="w-full px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white text-xs focus:outline-none" /></div></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }} onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20'}`}>
          <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-white' : 'text-zinc-600'}`} /><p className="text-zinc-400 text-sm font-medium">Drag & drop atau klik browse</p>
          <div className="flex justify-center gap-3 mt-2"><span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-md">PDF</span><span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-md">JPG</span><span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-md">PNG</span></div>
          <p className="text-zinc-700 text-[10px] mt-2">Maks 100MB/file · 20 file</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ''; }} className="hidden" />

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3"><p className="text-sm text-zinc-400"><span className="text-white font-medium">{files.length}</span> file · <span className="text-white font-medium">{fmt(files.reduce((s, f) => s + f.size, 0))}</span></p><button onClick={() => setFiles([])} className="text-xs text-zinc-500 hover:text-red-400">Hapus semua</button></div>
            <div className="space-y-1.5">{files.map((f, i) => { const Ic = FILE_ICONS[f.type] || File; return (
              <div key={`${f.name}-${i}`} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => reorder(e, i)} onDragEnd={() => setDragIdx(null)} className={`flex items-center gap-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-xl px-4 py-2.5 cursor-grab ${dragIdx === i ? 'opacity-40' : ''}`}>
                <GripVertical className="w-4 h-4 text-zinc-700" /><span className="text-zinc-600 text-[10px] font-mono w-5 text-center">{i + 1}</span><Ic className="w-4 h-4 text-zinc-400" /><div className="flex-1 min-w-0"><p className="text-sm text-zinc-300 truncate">{f.name}</p></div><span className="text-xs text-zinc-600 w-16 text-right">{fmt(f.size)}</span><button onClick={e => { e.stopPropagation(); setFiles(p => p.filter((_, j) => j !== i)); }} className="text-zinc-600 hover:text-red-400 p-1"><X className="w-3.5 h-3.5" /></button>
              </div>); })}</div>
            {files.length < 2 && <div className="mt-3 text-xs text-amber-400/80 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> +1 file lagi</div>}
            <button onClick={handleMerge} disabled={merging || files.length < 2} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-zinc-950 rounded-xl text-sm font-semibold hover:bg-zinc-200 disabled:opacity-40 mt-4">{merging ? <><Loader2 className="w-4 h-4 animate-spin" /> Menggabungkan...</> : <><Combine className="w-4 h-4" /> Gabungkan {files.length} File</>}</button>
          </div>
        )}
      </div>

      {/* Compress Modal */}
      {compressId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60" onClick={() => { setCompressId(null); setCResult(null); }} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-white flex items-center gap-2"><Shrink className="w-5 h-5" /> Kompres</h2><button onClick={() => { setCompressId(null); setCResult(null); }} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><div className="flex justify-between mb-1"><label className="text-sm text-zinc-400">Kualitas</label><span className="text-xs text-white bg-zinc-800 px-2 py-0.5 rounded">{cQuality}%</span></div><input type="range" min={10} max={100} step={5} value={cQuality} onChange={e => setCQuality(Number(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" /></div>
              <div><label className="text-sm text-zinc-400 block mb-1">Target MB (opsional)</label><input type="number" min={0.5} step={0.5} value={cTarget} onChange={e => setCTarget(e.target.value)} placeholder="e.g. 5" className="w-full px-4 py-2.5 bg-zinc-800/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none" /></div>
              {cResult && <div className="bg-emerald-500/10 rounded-xl p-3 text-sm text-emerald-400">Sebelum: {fmt(cResult.originalSize)} → Sesudah: {fmt(cResult.compressedSize)} <span className="font-medium">(-{cResult.reduction})</span></div>}
              <button onClick={handleCompress} disabled={compressing} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">{compressing ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengompresi...</> : <><Shrink className="w-4 h-4" /> Kompres</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div><h2 className="text-lg font-medium text-white mb-4">Riwayat</h2>
        {loading ? <div className="text-zinc-500 flex gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>
        : history.length === 0 ? <div className="text-center py-16 text-zinc-600"><Combine className="w-14 h-14 mx-auto mb-4 opacity-20" /><p className="text-sm">Belum ada</p></div>
        : <div className="space-y-3">{history.map(doc => { const src = JSON.parse((doc.sourceFiles as string) || '[]'); return (
          <div key={doc.id as string} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-red-400" /></div>
              <div className="flex-1 min-w-0"><h3 className="text-white font-medium text-sm">{doc.title as string}</h3><div className="flex items-center gap-2 mt-1 text-xs text-zinc-500"><span>{src.length} file</span><span className="text-zinc-700">·</span><span>{doc.pageCount as number} hal</span><span className="text-zinc-700">·</span><span>{fmt(doc.fileSize as number)}</span></div><p className="text-zinc-700 text-[10px] mt-1">{new Date(doc.createdAt as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                <button onClick={() => { setCompressId(doc.id as string); setCResult(null); setCQuality(50); setCTarget(''); }} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-xl text-xs font-medium transition-colors"><Shrink className="w-3.5 h-3.5" /> Kompres</button>
                <button onClick={async () => { try { await api.downloadMergedDocument(doc.id as string, doc.title as string); } catch (e) { flash(e instanceof Error ? e.message : 'Gagal', false); } }} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-medium transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
                <button onClick={async () => { if (!confirm('Hapus?')) return; try { await api.deleteMergedDocument(doc.id as string); await loadHistory(); } catch {} }} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-xl text-xs transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>); })}</div>}
      </div>
    </div>
  );
}
