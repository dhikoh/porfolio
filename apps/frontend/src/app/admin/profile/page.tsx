'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';

const profileFields = [
  { key: 'fullName', label: 'Nama Lengkap', type: 'text' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'summary', label: 'Ringkasan', type: 'textarea' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Telepon', type: 'text' },
  { key: 'address', label: 'Alamat', type: 'textarea' },
  { key: 'birthPlace', label: 'Tempat Lahir', type: 'text' },
  { key: 'birthDate', label: 'Tanggal Lahir', type: 'text' },
  { key: 'instagram', label: 'Instagram', type: 'text' },
  { key: 'linkedin', label: 'LinkedIn', type: 'text' },
  { key: 'github', label: 'GitHub', type: 'text' },
  { key: 'facebook', label: 'Facebook', type: 'text' },
  { key: 'twitter', label: 'Twitter/X', type: 'text' },
  { key: 'website', label: 'Website', type: 'text' },
  { key: 'avatarUrl', label: 'Avatar URL', type: 'text' },
  { key: 'resumeUrl', label: 'Resume URL', type: 'text' },
  { key: 'heroTitle', label: 'Hero Title', type: 'text' },
  { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea' },
  { key: 'availableText', label: 'Status Text', type: 'text' },
  { key: 'ctaText', label: 'CTA Text', type: 'text' },
  { key: 'ctaEmail', label: 'CTA Email', type: 'email' },
];

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage('');
    try {
      // Strip non-DTO fields before sending
      const { id, createdAt, updatedAt, ...profileData } = profile;
      const updated = await api.updateProfile(profileData);
      setProfile(updated as Record<string, unknown>);
      setMessage('Profil berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal menyimpan');
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse text-zinc-500">Memuat profil...</div>;
  if (!profile) return <div className="text-zinc-500">Profil belum tersedia. Jalankan seed terlebih dahulu.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Profil</h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola informasi personal</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
        </button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileFields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="text-sm text-zinc-400 block mb-1.5">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea value={(profile[field.key] as string) || ''} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })} rows={4} className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none" />
            ) : (
              <input type={field.type} value={(profile[field.key] as string) || ''} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })} className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
