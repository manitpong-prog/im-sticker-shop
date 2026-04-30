import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-[#fff7ec]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:h-20 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0">
        <Link href="/" className="inline-flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-[-0.08em] text-blue-950">
            iM
          </span>
          <span className="text-3xl font-black tracking-[-0.08em] text-orange-700">
            Sticker
          </span>
        </Link>

        <nav className="flex gap-5 overflow-x-auto text-sm font-bold text-blue-950 md:justify-center">
          <Link href="/" className="whitespace-nowrap hover:text-orange-700">
            หน้าหลัก
          </Link>
          <Link
            href="/promotion"
            className="whitespace-nowrap hover:text-orange-700"
          >
            โปรโมชั่นลดราคา
          </Link>
          <Link
            href="/blog"
            className="whitespace-nowrap hover:text-orange-700"
          >
            บล็อกบทความ
          </Link>
        </nav>

        <a
          href="https://line.me/ti/p/~rebornmmm"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#06C755] px-5 text-sm font-black text-white shadow-lg shadow-green-500/20 transition hover:bg-[#04a947]"
        >
          สั่งซื้อ / ติดต่อไลน์
        </a>
      </div>
    </header>
  );
}