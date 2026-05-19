'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Send, Sparkles, Mail, Phone, Globe } from 'lucide-react';
import { api } from '@/lib/api-client';

interface ContactProps {
  profile: {
    fullName: string;
    summary: string;
    ctaEmail: string;
    phone?: string;
    website?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    twitter?: string;
  };
  settings?: Record<string, string>;
}

const socialLinks = [
  { key: 'instagram', label: 'Instagram', urlPrefix: 'https://instagram.com/', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  )},
  { key: 'linkedin', label: 'LinkedIn', urlPrefix: 'https://linkedin.com/in/', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  )},
  { key: 'github', label: 'GitHub', urlPrefix: 'https://github.com/', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
  )},
  { key: 'facebook', label: 'Facebook', urlPrefix: 'https://facebook.com/', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  )},
  { key: 'twitter', label: 'Twitter/X', urlPrefix: 'https://x.com/', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
];

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
  const activeSocials = socialLinks.filter(s => (profile as Record<string, string>)[s.key]);

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#002329] relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 dot-pattern pointer-events-none" />
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

        {/* Contact info + Social links */}
        <motion.div className="flex flex-wrap items-center justify-center gap-4 mb-10" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
          {profile.ctaEmail && (
            <a href={`mailto:${profile.ctaEmail}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:border-[#5cf28e]/40 hover:text-white transition-all">
              <Mail className="w-4 h-4 text-[#5cf28e]" /> {profile.ctaEmail}
            </a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:border-[#5cf28e]/40 hover:text-white transition-all">
              <Phone className="w-4 h-4 text-[#5cf28e]" /> {profile.phone}
            </a>
          )}
          {profile.website && (
            <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:border-[#5cf28e]/40 hover:text-white transition-all">
              <Globe className="w-4 h-4 text-[#5cf28e]" /> {profile.website}
            </a>
          )}
        </motion.div>

        {/* Social media icons */}
        {activeSocials.length > 0 && (
          <motion.div className="flex items-center justify-center gap-3 mb-12" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.25 }}>
            {activeSocials.map((social) => {
              const handle = (profile as Record<string, string>)[social.key];
              const url = handle.startsWith('http') ? handle : `${social.urlPrefix}${handle}`;
              return (
                <a key={social.key} href={url} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#5cf28e] hover:border-[#5cf28e]/40 hover:bg-[#5cf28e]/10 transition-all duration-300"
                >
                  {social.icon}
                </a>
              );
            })}
          </motion.div>
        )}

        <motion.form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }}>
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
