'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Tentang', href: '#about' },
  { label: 'Perjalanan', href: '#journey' },
  { label: 'Karya', href: '#work' },
  { label: 'Resume', href: '#resume' },
  { label: 'Kontak', href: '#contact' },
];

export default function Navbar({ fullName }: { fullName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#002329]/95 backdrop-blur-xl shadow-lg' : 'bg-[#002329]'}`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <a href="/" className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          {fullName?.split(' ')[0] || 'Portfolio'}
        </a>
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-white/70 hover:text-[#5cf28e] transition-colors font-medium">
              {item.label}
            </a>
          ))}
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/70 hover:text-white" aria-label="Toggle menu">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#002329]/98 backdrop-blur-xl border-t border-white/10 py-4">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block px-6 py-3 text-sm text-white/70 hover:text-[#5cf28e] transition-colors font-medium">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
