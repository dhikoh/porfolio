import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl md:text-[180px] font-extrabold text-zinc-900 leading-none select-none">
          404
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold text-white mt-4 mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex px-8 py-4 bg-white text-zinc-950 rounded-full font-medium hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
