import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'เกี่ยวกับเรา | iM Sticker Shop',
  description:
    'iM Sticker Shop ร้านค้าทางการที่ได้รับอนุญาตจาก Line Sticker หมายเลข LVS0454 บริการส่งของขวัญสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และเมโลดี้ไลน์ ราคาถูกกว่ากดซื้อเอง',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffaf3] text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
              ร้านค้าทางการ Line Sticker หมายเลข LVS0454
            </div>

            <h1 className="text-5xl font-black leading-none tracking-[-0.08em] text-blue-950 md:text-7xl">
              iM Sticker Shop
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              ร้านค้าทางการที่ได้รับอนุญาตจาก Line Sticker บริการส่งของขวัญ
              สติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และเมโลดี้ไลน์
              ราคาถูกกว่ากดซื้อเอง ส่งเอง ส่งไวทันใจ
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-blue-950">
                ทำไมต้องสั่งกับเรา?
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600">
                iM Sticker Shop ให้บริการส่งของขวัญไลน์ สติกเกอร์ อิโมจิ ธีม
                และเมโลดี้ไลน์ ในราคาคุ้มกว่า เหมาะสำหรับคนที่ต้องการส่งของขวัญให้เพื่อน
                คนรัก หรือคนในครอบครัวได้ง่าย ๆ ผ่าน LINE
              </p>

              <p className="mt-4 text-base leading-8 text-slate-600">
                จุดสำคัญของร้านคือความปลอดภัยและความน่าเชื่อถือ
                เพราะเป็นร้านค้าที่ได้รับอนุญาตจาก Line Sticker หมายเลข{' '}
                <span className="font-black text-orange-700">LVS0454</span>
              </p>

              <div className="mt-6 inline-flex rounded-3xl border border-orange-100 bg-orange-50 px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Premium Shop Number
                  </p>
                  <p className="mt-1 text-2xl font-black text-orange-700">
                    LVS0454
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-[#fffaf3] p-5 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-950 text-xl text-white">
                  ✓
                </div>
                <p className="mt-3 text-sm font-black text-blue-950">
                  ปลอดภัย
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  สั่งซื้อกับร้านที่มีหมายเลขอนุญาตชัดเจน
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[#fffaf3] p-5 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-700 text-xl text-white">
                  ⚡
                </div>
                <p className="mt-3 text-sm font-black text-blue-950">
                  ส่งไว
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  ติดต่อสั่งซื้อผ่าน LINE ได้โดยตรง
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[#fffaf3] p-5 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#06C755] text-xl text-white">
                  L
                </div>
                <p className="mt-3 text-sm font-black text-blue-950">
                  ของขวัญ LINE
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  ส่งให้เพื่อนผ่าน LINE ได้สะดวก
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[#fffaf3] p-5 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-xl text-orange-700">
                  ฿
                </div>
                <p className="mt-3 text-sm font-black text-blue-950">
                  ราคาคุ้มกว่า
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  ถูกกว่ากดซื้อเองตามเรตราคาของร้าน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
          <h2 className="text-3xl font-black tracking-tight text-blue-950">
            เรตราคามาตรฐาน
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            ราคาปกติที่ไม่มีโปรโมชัน อัปเดตตามเรตราคาของร้าน
            สำหรับสั่งซื้อของขวัญ สติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และเมโลดี้ไลน์
          </p>

          <div className="mx-auto mt-7 max-w-md overflow-hidden rounded-[2rem] border border-orange-100 bg-orange-50 p-3 shadow-xl shadow-blue-950/5">
            <img
              src="/price-list.png"
              alt="เรตราคามาตรฐาน iM Sticker Shop"
              className="h-auto w-full rounded-[1.5rem]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12">
        <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-blue-950 to-blue-900 p-8 text-center text-white shadow-xl shadow-blue-950/10 md:p-12">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            ส่งเร็วส่งไว มั่นใจด้วยร้านทางการ LVS0454
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
            แอด LINE เพื่อสอบถามหรือสั่งซื้อได้โดยตรง
            หากพร้อมตอบจะดำเนินการให้ไวที่สุดครับ
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://line.me/ti/p/~rebornmmm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-7 text-sm font-black text-white shadow-lg shadow-green-500/20 transition hover:bg-[#04a947]"
            >
              แอดไลน์ ID: rebornmmm
            </a>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 text-sm font-black text-white transition hover:bg-white/20"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}