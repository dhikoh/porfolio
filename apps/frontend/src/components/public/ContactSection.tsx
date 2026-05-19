'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';

interface ContactProps {
  profile: { fullName: string; summary: string; ctaEmail: string };
  settings?: Record<string, string>;
}

export default function ContactSection({ profile, settings }: ContactProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', content: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.sendMessage(formData);
      setSent(true);
      setFormData({ name: '', email: '', phone: '', content: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSending(false);
    }
  };

  const displayTitle = settings?.section_contact_title || 'Punya ide? *Mari wujudkan bersama.*';

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#002329] relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 dot-pattern pointer-events-none" />
      {/* Green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5cf28e]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl sm:text-5xl md:text-[60px] font-medium text-white tracking-tight mb-6" style={{ fontFamily: 'Satoshi, sans-serif', lineHeight: '1.1em' }}>
            {displayTitle.split('*').length === 3 ? (
              <>{displayTitle.split('*')[0]}<br className="hidden md:block" /><span className="text-[#5cf28e]">{displayTitle.split('*')[1]}</span>{displayTitle.split('*')[2]}</>
            ) : displayTitle.replace(/\*/g, '')}
          </h2>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto">{settings?.section_contact_subtitle || 'Kirimkan pesan dan saya akan merespons dalam waktu 24 jam.'}</p>
        </motion.div>
        <motion.form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
          {sent ? (
            <div className="text-center p-8 rounded-3xl bg-white/5 border border-[#5cf28e]/30">
              <Sparkles className="w-8 h-8 text-[#5cf28e] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Pesan Terkirim!</h3>
              <p className="text-white/60">Terima kasih telah menghubungi saya. Saya akan segera merespons.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm text-white/40 hover:text-white transition-colors">Kirim pesan lagi</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Nama" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#5cf28e]/50 transition-colors" />
                <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#5cf28e]/50 transition-colors" />
              </div>
              <input type="tel" placeholder="No. WhatsApp (opsional)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#5cf28e]/50 transition-colors" />
              <textarea placeholder="Ceritakan ide atau project Anda..." required rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#5cf28e]/50 transition-colors resize-none" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={sending} className="w-full px-8 py-4 bg-[#5cf28e] text-[#002329] rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#50c878] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_-10px_rgba(92,242,142,0.5)]">
                {sending ? 'Mengirim...' : 'Kirim Pesan'} <Send className="w-5 h-5" />
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}
