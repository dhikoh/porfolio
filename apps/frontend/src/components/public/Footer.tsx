'use client';

export default function Footer({ settings }: { settings?: Record<string, string> }) {
  const year = new Date().getFullYear();
  return (
    <footer className="py-12 bg-white border-t border-[#03151a]/10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm text-[#03151a]/60 text-center md:text-left">
              © {year} {settings?.footer_text || 'Dhiko Herlambang'}. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-sm text-[#03151a]/50 hover:text-[#5cf28e] transition-colors font-medium">Tentang</a>
            <a href="#work" className="text-sm text-[#03151a]/50 hover:text-[#5cf28e] transition-colors font-medium">Karya</a>
            <a href="#contact" className="text-sm text-[#03151a]/50 hover:text-[#5cf28e] transition-colors font-medium">Kontak</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
