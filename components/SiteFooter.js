import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-8 bg-blue-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_0.6fr_0.8fr]">
        <div>
          <Link href="/" className="inline-flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-[-0.08em] text-white">
              iM
            </span>
            <span className="text-3xl font-black tracking-[-0.08em] text-orange-400">
              Sticker
            </span>
          </Link>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/75">
            iM Sticker Shop ร้านค้าทางการที่ได้รับอนุญาตจาก Line Sticker
            หมายเลข LVS0454 ขายส่งของขวัญ สติ๊กเกอร์ไลน์ อิโมจิไลน์
            ธีมไลน์ และเมโลดี้ไลน์ ราคาถูกกว่ากดซื้อเอง 
            ส่งเอง ส่งไวทันใจ 
            ต้องสติกเกอร์ไลน์ราคาถูกร้าน iM Sticker
          </p>
        </div>

        <div>
          <h2 className="text-base font-black">เมนู</h2>

          <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/about" className="w-fit hover:text-orange-300">
              เกี่ยวกับเรา
            </Link>
            <Link href="/promotion" className="w-fit hover:text-orange-300">
              โปรโมชั่นลดราคา
            </Link>
            <Link href="/blog" className="w-fit hover:text-orange-300">
              บล็อกบทความ
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-base font-black">สั่งซื้อ / ติดต่อ</h2>

          <p className="mt-4 text-sm leading-7 text-white/75">
            เพิ่มเพื่อน LINE เพื่อสอบถามและสั่งซื้อสินค้า
          </p>

          <a
            href="https://line.me/ti/p/~rebornmmm"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-6 text-sm font-black text-white transition hover:bg-[#04a947]"
          >
            เพิ่มเพื่อน LINE
          </a>
        </div>
      </div>
    </footer>
  );
}