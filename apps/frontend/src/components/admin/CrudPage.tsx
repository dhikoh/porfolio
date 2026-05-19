'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

interface CrudPageProps {
  title: string;
  fields: FieldConfig[];
  fetchAll: () => Promise<Record<string, unknown>[]>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  displayField?: string;
  secondaryField?: string;
}

export default function CrudPage({ title, fields, fetchAll, create, update, remove, displayField = 'name', secondaryField }: CrudPageProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await fetchAll()); } catch { setError('Gagal memuat data'); }
    setLoading(false);
  }, [fetchAll]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => { defaults[f.key] = f.defaultValue ?? (f.type === 'number' ? 0 : f.type === 'checkbox' ? false : ''); });
    setEditing(defaults);
    setIsNew(true);
    setError('');
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing({ ...item });
    setIsNew(false);
    setError('');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await create(editing);
      } else {
        // Strip system fields that the backend DTO does not accept
        const { id, createdAt, updatedAt, ...payload } = editing;
        await update(id as string, payload);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    try {
      await remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus');
    }
  };

  const setField = (key: string, value: unknown) => {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="text-zinc-500 text-sm mt-1">{items.length} item</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{isNew ? `Tambah ${title}` : `Edit ${title}`}</h2>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-zinc-400 block mb-1.5">{field.label}{field.required && <span className="text-red-400 ml-1">*</span>}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={(editing[field.key] as string) || ''} onChange={(e) => setField(field.key, e.target.value)} placeholder={field.placeholder} rows={4} className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none" />
                  ) : field.type === 'select' ? (
                    <select value={(editing[field.key] as string) || ''} onChange={(e) => setField(field.key, e.target.value)} className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20">
                      {field.options?.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={!!editing[field.key]} onChange={(e) => setField(field.key, e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-zinc-300">{field.placeholder || field.label}</span>
                    </label>
                  ) : (
                    <input type={field.type} value={editing[field.key] !== undefined && editing[field.key] !== null ? String(editing[field.key]) : ''} onChange={(e) => setField(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={field.placeholder} required={field.required} className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-zinc-500 animate-pulse">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-zinc-600">Belum ada data. Klik &ldquo;Tambah&rdquo; untuk memulai.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id as string} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors group">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white font-medium truncate">{String(item[displayField] || item.id || '-')}</div>
                {secondaryField && item[secondaryField] ? (
                  <div className="text-xs text-zinc-500 truncate mt-0.5">{String(item[secondaryField])}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id as string)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
