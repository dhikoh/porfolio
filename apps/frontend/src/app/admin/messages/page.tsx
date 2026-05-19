'use client';
import { useState, useEffect } from 'react';
import { Trash2, Mail, MailOpen, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.getMessages().then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleRead = async (msg: Record<string, unknown>) => {
    await api.updateMessage(msg.id as string, { isRead: !msg.isRead });
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: !m.isRead } : m));
    if (selected?.id === msg.id) setSelected({ ...selected, isRead: !msg.isRead });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pesan ini?')) return;
    await api.deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (loading) return <div className="animate-pulse text-zinc-500">Memuat pesan...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Inbox Pesan</h1>
        <p className="text-zinc-500 text-sm mt-1">{messages.filter(m => !m.isRead).length} pesan belum dibaca</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {messages.length === 0 && <p className="text-zinc-600 text-sm">Belum ada pesan.</p>}
          {messages.map((msg) => (
            <div key={msg.id as string} onClick={() => { setSelected(msg); if (!msg.isRead) toggleRead(msg); }} className={`p-4 rounded-xl cursor-pointer transition-colors ${selected?.id === msg.id ? 'bg-white/5 border border-white/10' : 'bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.isRead ? 'bg-zinc-700' : 'bg-emerald-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white font-medium truncate">{msg.name as string}</div>
                  <div className="text-xs text-zinc-500 truncate">{msg.email as string}</div>
                  <p className="text-xs text-zinc-600 mt-1 truncate">{msg.content as string}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selected.name as string}</h2>
                  <p className="text-sm text-zinc-500">{selected.email as string}{selected.phone ? ` • ${selected.phone}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleRead(selected)} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title={selected.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}>
                    {selected.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(selected.id as string)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-600 mb-4">
                <Clock className="w-3 h-3" />
                {new Date(selected.createdAt as string).toLocaleString('id-ID')}
              </div>
              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{selected.content as string}</div>
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-600">Pilih pesan untuk membaca</div>
          )}
        </div>
      </div>
    </div>
  );
}
