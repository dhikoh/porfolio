import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#002329] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl md:text-[180px] font-extrabold text-white/5 leading-none select-none" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          404
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white mt-4 mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex px-8 py-4 bg-[#5cf28e] text-[#002329] rounded-full font-bold hover:bg-[#50c878] transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(92,242,142,0.5)]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
