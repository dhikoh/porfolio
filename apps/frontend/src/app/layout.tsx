import type { Metadata } from "next";
import "./globals.css";
import { serverFetch } from "@/lib/api-client";

export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, string> = {};
  let profile: Record<string, string> | null = null;

  try {
    [settings, profile] = await Promise.all([
      serverFetch<Record<string, string>>('/settings'),
      serverFetch<Record<string, string>>('/profile'),
    ]);
  } catch {
    // Fallback if API is not ready
  }

  const title = settings.site_title || (profile?.fullName
    ? `${profile.fullName} | Digital Builder`
    : 'Dhiko Herlambang | Problem Solver & Digital Systems Builder');

  const description = settings.site_description || profile?.summary || 'Portfolio Dhiko Herlambang — Pemecah masalah yang membangun sistem digital secara otodidak.';

  const keywords = settings.metaKeywords
    ? settings.metaKeywords.split(',').map((k: string) => k.trim())
    : ['portfolio', 'digital builder', 'problem solver', 'Dhiko Herlambang', 'AI'];

  return {
    title,
    description,
    keywords,
    authors: [{ name: profile?.fullName || 'Dhiko Herlambang' }],
    openGraph: { title, description, type: 'website' },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#09090b] text-zinc-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
