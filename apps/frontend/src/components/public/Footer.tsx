'use client';

export default function Footer({ settings }: { settings?: Record<string, string> }) {
  const footerText = settings?.footer_text || `© ${new Date().getFullYear()} Dhiko Herlambang. All rights reserved.`;

  return (
    <footer className="border-t border-white/5 py-8 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-zinc-600 text-sm">{footerText}</p>
        <p className="text-zinc-700 text-xs">Built with dedication</p>
      </div>
    </footer>
  );
}
