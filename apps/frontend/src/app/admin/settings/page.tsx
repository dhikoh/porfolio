'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';

const settingFields = [
  { key: 'site_title', label: 'Judul Website' },
  { key: 'site_description', label: 'Deskripsi Website' },
  { key: 'footer_text', label: 'Footer Text' },
  { key: 'whatsapp_number', label: 'Nomor WhatsApp (dengan kode negara)' },
  { key: 'whatsapp_message', label: 'Pesan Default WhatsApp' },
  { key: 'metaKeywords', label: 'Meta Keywords (pisahkan dengan koma)' },
  { key: 'section_about_title', label: 'Section About - Judul' },
  { key: 'section_process_title', label: 'Section Process - Judul' },
  { key: 'section_process_subtitle', label: 'Section Process - Subtitle' },
  { key: 'section_timeline_title', label: 'Section Timeline - Judul' },
  { key: 'section_timeline_subtitle', label: 'Section Timeline - Subtitle' },
  { key: 'section_resume_title', label: 'Section Resume - Judul' },
  { key: 'section_resume_subtitle', label: 'Section Resume - Subtitle' },
  { key: 'section_expertise_title', label: 'Section Expertise - Judul' },
  { key: 'section_expertise_subtitle', label: 'Section Expertise - Subtitle' },
  { key: 'section_skills_title', label: 'Section Skills - Judul' },
  { key: 'section_skills_subtitle', label: 'Section Skills - Subtitle' },
  { key: 'section_contact_title', label: 'Section Contact - Judul' },
  { key: 'section_contact_subtitle', label: 'Section Contact - Subtitle' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const entries = settingFields
        .filter((f) => settings[f.key] !== undefined && settings[f.key] !== '')
        .map((f) => ({ key: f.key, value: settings[f.key] || '' }));
      await api.updateSettings(entries);
      setMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal menyimpan');
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse text-zinc-500">Memuat pengaturan...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pengaturan</h1>
          <p className="text-zinc-500 text-sm mt-1">Konfigurasi website</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
        </button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{message}</div>}
      <div className="space-y-4">
        {settingFields.map((field) => (
          <div key={field.key}>
            <label className="text-sm text-zinc-400 block mb-1.5">{field.label}</label>
            <input type="text" value={settings[field.key] || ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
