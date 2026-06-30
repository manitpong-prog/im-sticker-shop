
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'โปรโมชั่นลดทั้งครีเอเตอร์ | iM Sticker Shop',
  description:
    'รายละเอียดโปรโมชั่นลดราคาจากครีเอเตอร์ สติกเกอร์ไลน์และอิโมจิไลน์ราคาพิเศษ จาก iM Sticker Shop',
};

const stickerPromo15Authors = [
  {
    name: 'โซจูคือความสุขที่แน่นอน',
    url: 'https://line.me/S/shop/sticker/author/5303237/',
  },
    {
    name: 'Kanatsawan Saetang',
    url: 'https://line.me/S/shop/sticker/author/98656/',
  },
  {
    name: 'PPpig2018',
    url: 'https://line.me/S/shop/sticker/author/390030/',
  },
  {
    name: 'iM Sticker',
    url: 'https://line.me/S/shop/sticker/author/3443037/',
  },
];

const stickerPromo12Authors = [
  {
    name: 'Echino',
    url: 'https://line.me/S/shop/sticker/author/5863886/',
  },
  {
    name: 'Iris',
    url: 'https://line.me/S/shop/sticker/author/4059324/',
  },
  {
    name: 'Devil',
    url: 'https://line.me/S/shop/sticker/author/5658706/',
  },
];

const emojiPromo20Authors = [
  {
    name: 'Echino',
    url: 'https://line.me/S/shop/emoji/author/11351308/',
  },
  {
    name: 'Iris',
    url: 'https://line.me/S/shop/emoji/author/7717588/',
  },
];

function AuthorLinkList({ items, label }) {
  return (
    <div className="space-y-4 border-t border-slate-700/60 pt-5">
      {items.map(item => (
        <div key={item.url} className="flex flex-col gap-1">
          <span className="text-sm leading-6 text-slate-200">
            {label} {item.name}
          </span>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-xs font-bold text-blue-300 transition hover:text-orange-300 hover:underline"
          >
            {item.url}
          </a>
        </div>
      ))}
    </div>
  );
}

function PromoBlock({
  title,
  priceText,
  description,
  endDateText,
  children,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-700/70 bg-slate-900/50 p-6 shadow-xl shadow-black/10">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">🔅</span>
        <h3 className="text-xl font-black text-white">{title}</h3>
      </div>

      <p className="mb-2 text-lg font-black text-[#06C755]">
        {priceText}
      </p>

      <p className="mb-1 leading-7 text-slate-300">{description}</p>

      <p className="mb-6 font-black text-orange-400">{endDateText}</p>

      {children}
    </section>
  );
}

export default function PromotionCreatorsPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200">
      <SiteHeader />

      <section className="bg-gradient-to-b from-orange-600/20 to-transparent">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 md:py-20">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-[#06C755]"
          >
            <span className="transition group-hover:-translate-x-1">←</span>
            กลับหน้าหลัก
          </Link>

          <div className="mb-5 inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-sm font-black text-orange-300">
            ได้รับส่วนลดจากครีเอเตอร์
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            โปรโมชั่นลดทั้งครีเอเตอร์
            <span className="mt-3 block text-[#06C755]">
              รายละเอียดโปรโมชั่นพิเศษ
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            รวมรายละเอียดโปรโมชันลดราคาจากครีเอเตอร์ สำหรับสติกเกอร์ไลน์และอิโมจิไลน์
            ที่เข้าร่วมรายการกับ iM Sticker Shop
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 pb-20">
        <article className="rounded-[2rem] border border-slate-700/70 bg-slate-800/40 p-6 shadow-2xl backdrop-blur-sm md:p-10">
          <section>
            <h2 className="text-2xl font-black leading-tight text-orange-400 md:text-3xl">
              🔥 โปรโมชั่นลดราคาครั้งใหญ่ ได้รับส่วนลดจากครีเอเตอร์ 🔥
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-300">
              จัดเต็มเพื่อแฟนคลับสติกเกอร์ไลน์ พบกับสติกเกอร์จากครีเอเตอร์หลายท่าน
              ที่เรานำมาจัดแคมเปญลดราคาพิเศษ เพื่อให้คุณได้ส่งต่อความรู้สึกผ่านแชท
              ในราคาที่คุ้มค่าที่สุด
            </p>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-700 bg-slate-950/50 p-6">
            <h2 className="text-lg font-black text-white">
              📅 ระยะเวลาแคมเปญ
            </h2>

            <p className="mt-4 text-xl font-black text-[#06C755]">
              ตั้งแต่วันนี้ - 31 กรกฎาคม 2569
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              *หรือจนกว่าจะมีการเปลี่ยนแปลงเงื่อนไข
            </p>
          </section>

          <section className="mt-10">
            <h2 className="mb-6 text-2xl font-black text-white">
              ✅ เงื่อนไขและข้อกำหนด
            </h2>

            <div className="space-y-8">
              <PromoBlock
                title="โปรรวมผลงาน"
                priceText="❤️‍🔥 50© ลายละ 15 บาท ❤️‍🔥"
                description="ทุกลายในลิงก์นี้"
                endDateText="📌 ลดถึง 31/7/69"
              >
                <AuthorLinkList
                  items={stickerPromo15Authors}
                  label="👉 รายชื่อสติกเกอร์ LINE ของ"
                />
              </PromoBlock>

              <PromoBlock
                title="โปรรวมผลงาน"
                priceText="❤️‍🔥 เฉพาะ 50© ลายละ 12 บาท ❤️‍🔥"
                description="ทุกลายในลิงก์นี้"
                endDateText="📌 ลดถึง 31/7/69"
              >
                <AuthorLinkList
                  items={stickerPromo12Authors}
                  label="📌 รายชื่อสติกเกอร์ LINE ของ"
                />
              </PromoBlock>

              <PromoBlock
                title="โปรอิโมจิรวมผลงาน"
                priceText="❤️‍🔥 เฉพาะ 70© ลายละ 20 บาท ❤️‍🔥"
                description="อิโมจิทุกลายในลิงก์นี้"
                endDateText="📌 ลดถึง 31/7/69"
              >
                <AuthorLinkList
                  items={emojiPromo20Authors}
                  label="📌 รายชื่ออิโมจิ LINE ของ"
                />
              </PromoBlock>
            </div>
          </section>

          <section className="mt-10 border-t border-slate-700 pt-10 text-center">
            <p className="mb-6 text-slate-400">
              สนใจสั่งซื้อหรือสอบถามเพิ่มเติม
            </p>

            <a
              href="https://line.me/ti/p/~rebornmmm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#06C755] px-8 py-4 text-sm font-black text-white shadow-[0_0_20px_rgba(6,199,85,0.3)] transition hover:scale-105 hover:bg-[#05a346] active:scale-95 md:px-12"
            >
              💬 แอดไลน์สั่งเลย: rebornmmm
            </a>
          </section>
        </article>

        <p className="mt-8 text-center text-sm text-slate-600">
          ร้านทางการ ได้รับอนุญาตจาก Line Sticker LVS0454
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
