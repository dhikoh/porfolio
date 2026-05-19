'use client';
import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Trash2, Loader2, Upload, Plus, X, Pencil } from 'lucide-react';
import { api } from '@/lib/api-client';

const defaultClosingID = 'Demikian surat lamaran ini saya buat dengan sebenarnya. Atas perhatian dan kebijaksanaan Bapak/Ibu, saya ucapkan banyak terima kasih.';
const defaultClosingEN = 'This application letter is made truthfully. Thank you for your time and consideration.';

type Tab = 'create' | 'history';

interface FormData {
  language: string;
  city: string;
  date: string;
  position: string;
  companyName: string;
  recipientTitle: string;
  companyAddress: string;
  jobSource: string;
  openingParagraph: string;
  bodyParagraph: string;
  closingParagraph: string;
  attachments: string[];
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  education: string;
  phone: string;
  email: string;
  website: string;
  signatureUrl: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatDateID = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateEN = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const initialForm: FormData = {
  language: 'id',
  city: '',
  date: todayISO(),
  position: '',
  companyName: '',
  recipientTitle: 'HRD',
  companyAddress: '',
  jobSource: '',
  openingParagraph: '',
  bodyParagraph: '',
  closingParagraph: defaultClosingID,
  attachments: ['Curriculum Vitae (CV)', 'Fotokopi Ijazah Terakhir', 'Fotokopi KTP & KK'],
  fullName: '',
  birthPlace: '',
  birthDate: '',
  gender: 'Laki-laki',
  address: '',
  education: '',
  phone: '',
  email: '',
  website: '',
  signatureUrl: '',
};

export default function SuratLamaranPage() {
  const [tab, setTab] = useState<Tab>('create');
  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [letters, setLetters] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sigPreview, setSigPreview] = useState('');
  const [newAttachment, setNewAttachment] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-fill from profile on first load
  useEffect(() => {
    Promise.all([
      api.getProfile().catch(() => null),
      api.getEducation().catch(() => []),
    ]).then(([profile, education]) => {
      if (profile) {
        setForm(prev => ({
          ...prev,
          fullName: (profile.fullName as string) || prev.fullName,
          phone: (profile.phone as string) || prev.phone,
          email: (profile.email as string) || prev.email,
          birthPlace: (profile.birthPlace as string) || prev.birthPlace,
          birthDate: (profile.birthDate as string) || prev.birthDate,
          address: (profile.address as string) || prev.address,
          city: (profile.address as string)?.split(',').pop()?.trim() || prev.city,
          website: 'dhiko.muatin.id',
        }));
      }
      if (Array.isArray(education) && education.length > 0) {
        const latest = education[0];
        setForm(prev => ({
          ...prev,
          education: `${latest.degree || ''}, ${latest.institution || ''}`,
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoading(true);
    try { setLetters(await api.getCoverLetters()); } catch { /* ignore */ }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(prev => ({ ...initialForm, fullName: prev.fullName, phone: prev.phone, email: prev.email, birthPlace: prev.birthPlace, birthDate: prev.birthDate, address: prev.address, education: prev.education, city: prev.city, website: prev.website, date: todayISO() }));
    setSigPreview('');
  };

  const handleSave = async () => {
    if (!form.position || !form.companyName) {
      setMessage('Posisi dan nama perusahaan wajib diisi');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      // Format date string for the document
      const formattedDate = form.language === 'en' ? formatDateEN(form.date) : formatDateID(form.date);
      const payload = { ...form, date: formattedDate } as unknown as Record<string, unknown>;

      if (editingId) {
        await api.updateCoverLetter(editingId, payload);
        setMessage('Surat berhasil diperbarui!');
      } else {
        await api.createCoverLetter(payload);
        setMessage('Surat berhasil disimpan!');
      }
      setEditingId(null);
      setTab('history');
      await loadHistory();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal menyimpan');
    }
    setSaving(false);
  };

  const handleEdit = (letter: Record<string, unknown>) => {
    const fd = JSON.parse((letter.formData as string) || '{}');
    setForm({ ...initialForm, ...fd, date: todayISO() });
    setEditingId(letter.id as string);
    setSigPreview('');
    if (fd.signatureUrl) setSigPreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${fd.signatureUrl}`);
    setTab('create');
    setMessage('');
  };

  const handleGenerate = async (id: string, format: 'pdf' | 'docx') => {
    setGenerating(`${id}-${format}`);
    try { await api.generateCoverLetter(id, format); }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Gagal generate'); }
    setGenerating(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus surat lamaran ini?')) return;
    try { await api.deleteCoverLetter(id); await loadHistory(); }
    catch { /* ignore */ }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Ukuran file maksimal 2MB');
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setMessage('Hanya file PNG atau JPG yang diizinkan');
      return;
    }
    setUploading(true);
    try {
      const result = await api.uploadSignature(file);
      setForm(prev => ({ ...prev, signatureUrl: result.signatureUrl }));
      setSigPreview(URL.createObjectURL(file));
      setMessage('');
    } catch (err) {
      setMessage('Gagal upload tanda tangan');
    }
    setUploading(false);
    e.target.value = '';
  };

  const addAttachment = () => {
    if (!newAttachment.trim()) return;
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment.trim()] }));
    setNewAttachment('');
  };

  const removeAttachment = (idx: number) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
  };

  const handleLanguageChange = (lang: string) => {
    setForm(prev => ({
      ...prev,
      language: lang,
      closingParagraph: lang === 'en' ? defaultClosingEN : defaultClosingID,
      gender: lang === 'en' ? 'Male' : 'Laki-laki',
    }));
  };

  const updateField = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Surat Lamaran Kerja</h1>
          <p className="text-zinc-500 text-sm mt-1">Buat surat lamaran profesional</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setTab('create'); if (!editingId) resetForm(); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'create' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <Plus className="w-4 h-4 inline mr-1" /> {editingId ? 'Edit Surat' : 'Buat Baru'}
        </button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'history' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
          <FileText className="w-4 h-4 inline mr-1" /> History
        </button>
        {editingId && (
          <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4 inline mr-1" /> Batal Edit
          </button>
        )}
      </div>

      {tab === 'create' && (
        <div className="space-y-6">
          {editingId && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400">
              ✏️ Mode edit — perubahan akan memperbarui surat yang sudah ada
            </div>
          )}

          {/* Language */}
          <div className="flex gap-3 items-center">
            <label className="text-sm text-zinc-400">Bahasa:</label>
            <button onClick={() => handleLanguageChange('id')} className={`px-3 py-1 rounded-lg text-xs font-medium ${form.language === 'id' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              Indonesia
            </button>
            <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1 rounded-lg text-xs font-medium ${form.language === 'en' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              English
            </button>
          </div>

          {/* Surat Header */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Header Surat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Kota" value={form.city} onChange={v => updateField('city', v)} />
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Tanggal Surat</label>
                <input type="date" value={form.date} onChange={e => updateField('date', e.target.value)} className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 [color-scheme:dark]" />
              </div>
              <Field label="Posisi Dilamar *" value={form.position} onChange={v => updateField('position', v)} />
              <Field label="Nama Perusahaan *" value={form.companyName} onChange={v => updateField('companyName', v)} />
              <Field label="Jabatan Tujuan" value={form.recipientTitle} onChange={v => updateField('recipientTitle', v)} placeholder="e.g. HRD, HRD Manager" />
              <Field label="Sumber Info Lowongan" value={form.jobSource} onChange={v => updateField('jobSource', v)} placeholder="e.g. LinkedIn, Glints" />
            </div>
            <div className="mt-4">
              <Field label="Alamat Perusahaan" value={form.companyAddress} onChange={v => updateField('companyAddress', v)} multiline />
            </div>
          </div>

          {/* Data Diri */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Data Diri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nama Lengkap" value={form.fullName} onChange={v => updateField('fullName', v)} />
              <Field label="Tempat Lahir" value={form.birthPlace} onChange={v => updateField('birthPlace', v)} />
              <Field label="Tanggal Lahir" value={form.birthDate} onChange={v => updateField('birthDate', v)} />
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Jenis Kelamin</label>
                <div className="flex gap-3 mt-2">
                  {(form.language === 'en' ? ['Male', 'Female'] : ['Laki-laki', 'Perempuan']).map(opt => (
                    <button key={opt} onClick={() => updateField('gender', opt)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${form.gender === opt ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Pendidikan Terakhir" value={form.education} onChange={v => updateField('education', v)} />
              <Field label="Telepon / WA" value={form.phone} onChange={v => updateField('phone', v)} />
              <Field label="Email" value={form.email} onChange={v => updateField('email', v)} />
              <Field label="Website Portofolio" value={form.website} onChange={v => updateField('website', v)} />
            </div>
            <div className="mt-4">
              <Field label="Alamat Lengkap" value={form.address} onChange={v => updateField('address', v)} multiline />
            </div>
          </div>

          {/* Isi Surat */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Isi Surat</h3>
            <div className="space-y-4">
              <Field label="Paragraf Pembuka" value={form.openingParagraph} onChange={v => updateField('openingParagraph', v)} multiline rows={4} placeholder="Berdasarkan informasi lowongan..." />
              <Field label="Paragraf Isi / Pengalaman" value={form.bodyParagraph} onChange={v => updateField('bodyParagraph', v)} multiline rows={6} placeholder="Pengalaman dan kualifikasi Anda..." />
              <Field label="Paragraf Penutup" value={form.closingParagraph} onChange={v => updateField('closingParagraph', v)} multiline rows={3} />
            </div>
          </div>

          {/* Lampiran */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Lampiran</h3>
            <div className="space-y-2 mb-3">
              {form.attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-800/50 rounded-xl px-4 py-2">
                  <span className="text-sm text-zinc-300 flex-1">{i + 1}. {att}</span>
                  <button onClick={() => removeAttachment(i)} className="text-zinc-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newAttachment} onChange={e => setNewAttachment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAttachment()} placeholder="Tambah lampiran..." className="flex-1 px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
              <button onClick={addAttachment} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-sm text-white">Tambah</button>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-2">Tanda Tangan Digital</h3>
            <p className="text-xs text-zinc-600 mb-4">PNG (transparan) atau JPG — maks 2MB</p>
            <div className="flex items-center gap-4">
              {sigPreview ? (
                <div className="relative">
                  <img src={sigPreview} alt="Signature" className="h-16 bg-white/10 rounded-lg p-2 border border-white/5" />
                  <button onClick={() => { setSigPreview(''); setForm(prev => ({ ...prev, signatureUrl: '' })); }} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-white/10 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Upload Tanda Tangan (PNG/JPG)'}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={handleSignatureUpload} className="hidden" />
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {editingId ? 'Perbarui Surat' : 'Simpan Surat Lamaran'}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {loading ? (
            <div className="text-zinc-500 animate-pulse">Memuat...</div>
          ) : letters.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada surat lamaran tersimpan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {letters.map((letter) => {
                const fd = JSON.parse((letter.formData as string) || '{}');
                return (
                  <div key={letter.id as string} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium">{fd.position || 'Untitled'}</h3>
                        <p className="text-zinc-500 text-sm">{fd.companyName} · {new Date(letter.createdAt as string).toLocaleDateString('id-ID')}</p>
                        <p className="text-zinc-600 text-xs mt-1">{letter.language === 'en' ? 'English' : 'Bahasa Indonesia'}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button onClick={() => handleEdit(letter)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-medium transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleGenerate(letter.id as string, 'pdf')} disabled={generating === `${letter.id}-pdf`} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-medium transition-colors disabled:opacity-50" title="Download PDF">
                          {generating === `${letter.id}-pdf` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} PDF
                        </button>
                        <button onClick={() => handleGenerate(letter.id as string, 'docx')} disabled={generating === `${letter.id}-docx`} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-medium transition-colors disabled:opacity-50" title="Download DOCX">
                          {generating === `${letter.id}-docx` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} DOCX
                        </button>
                        <button onClick={() => handleDelete(letter.id as string)} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-xl text-xs transition-colors" title="Hapus">
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
      )}
    </div>
  );
}

function Field({ label, value, onChange, multiline, rows, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; rows?: number; placeholder?: string; type?: string;
}) {
  const cls = 'w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20';
  return (
    <div>
      <label className="text-sm text-zinc-400 block mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows || 3} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}
