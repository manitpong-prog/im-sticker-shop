import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProductCard from '@/components/ProductCard';

export const revalidate = 300;

export const metadata = {
  title: 'iM Sticker Shop | ซื้อสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ ราคาถูก',
  description:
    'iM Sticker Shop บริการส่งของขวัญสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และเมโลดี้ไลน์ ราคาถูกกว่ากดซื้อเอง เหมาะสำหรับคนที่ต้องการซื้อสติกเกอร์ไลน์หรือซื้อสติ๊กเกอร์ไลน์ในราคาคุ้มค่า',
};

const DEFAULT_TABLE_NAME = 'test_stickers';
const SECTION_LIMIT = 6;

const productSelect = `
  id,
  name,
  type,
  category,
  price,
  main_image,
  image_list,
  is_new_sticker_official,
  is_new_emoji_official,
  is_new_theme_official,
  is_promotion,
  official_promo,
  promo_price,
  promo_end_date,
  updated_at
`;

const minimalProductSelect = `
  id,
  name,
  type,
  category,
  price,
  main_image,
  image_list,
  is_promotion,
  updated_at
`;

const sectionsConfig = [
  {
    key: 'discount-promotion',
    title: 'ซื้อสติกเกอร์ไลน์ลดราคา',
    subtitle:
      'รวมโปรสติ๊กเกอร์ไลน์ราคาถูกจากครีเอเตอร์ พร้อมราคาพิเศษและวันหมดโปรโมชั่น',
    href: '/promotion',
    badge: 'โปรลดราคา',
    linkLabel: 'ดูโปรสติกเกอร์ไลน์ลดราคา',
    applyFilter: query => query.eq('is_promotion', true),
  },
  {
  key: 'official-promotion',
  title: 'โปรโมชั่นจากทางไลน์',
  subtitle: 'รายการที่มีโปรโมชันจากทาง LINE',
  href: '/promotion/official',
  badge: 'LINE Promo',
  linkLabel: 'ดูโปรจาก LINE',
  sources: [
    {
      tableName: 'test_stickers',
      tableMode: 'full',
      applyFilter: query => query.eq('official_promo', true),
    },
    {
      tableName: 'test_taiwan',
      tableMode: 'minimal',
      categoryOverride: 'taiwan',
      officialPromoOverride: true,
      applyFilter: query => query.eq('is_line_sale', true),
    },
  ],
  applyFilter: query => query.eq('official_promo', true),
},
  {
    key: 'new-official-sticker',
    title: 'สติกเกอร์ทางการมาใหม่',
    subtitle: 'สติกเกอร์ทางการอัปเดตใหม่ล่าสุด',
    href: '/category/official_sticker?new=true',
    badge: 'มาใหม่',
    applyFilter: query =>
      query
        .eq('category', 'official_sticker')
        .eq('is_new_sticker_official', true),
  },
  {
    key: 'top-official-sticker',
    title: 'สติกเกอร์ทางการสุดฮิต',
    subtitle: 'รวมสติกเกอร์ทางการยอดนิยม',
    href: '/category/official_sticker',
    badge: 'Official',
    applyFilter: query => query.eq('category', 'official_sticker'),
  },
  {
    key: 'top-creator-sticker',
    title: 'สติกเกอร์ครีเอเตอร์สุดฮิต',
    subtitle: 'สติกเกอร์จากครีเอเตอร์ยอดนิยม',
    href: '/category/creator_sticker',
    badge: 'Creator',
    applyFilter: query => query.eq('category', 'creator_sticker'),
  },
  {
    key: 'new-official-emoji',
    title: 'อิโมจิทางการมาใหม่',
    subtitle: 'อิโมจิไลน์ทางการสำหรับแชทให้น่ารักขึ้น',
    href: '/category/official_emoji',
    badge: 'Emoji',
    applyFilter: query => query.eq('category', 'official_emoji'),
  },
  {
    key: 'top-creator-emoji',
    title: 'อิโมจิครีเอเตอร์สุดฮิต',
    subtitle: 'อิโมจิจากครีเอเตอร์ที่น่าใช้',
    href: '/category/creator_emoji',
    badge: 'Creator Emoji',
    applyFilter: query => query.eq('category', 'creator_emoji'),
  },
  {
    key: 'new-official-theme',
    title: 'ธีมทางการมาใหม่',
    subtitle: 'ธีมไลน์ทางการสำหรับตกแต่งแอป LINE',
    href: '/category/official_theme',
    badge: 'Theme',
    applyFilter: query => query.eq('category', 'official_theme'),
  },
  {
    key: 'top-creator-theme',
    title: 'ธีมครีเอเตอร์สุดฮิต',
    subtitle: 'ธีมไลน์จากครีเอเตอร์ยอดนิยม',
    href: '/category/creator_theme',
    badge: 'Creator Theme',
    applyFilter: query => query.eq('category', 'creator_theme'),
  },
  {
    key: 'indo-50c',
    title: 'สติกเกอร์ดุ๊กดิ๊ก 50c อินโด',
    subtitle: 'รวมสติกเกอร์ดุ๊กดิ๊ก 50c อินโด อัปเดตล่าสุด',
    href: '/category/indo_50c',
    badge: 'Indonesia 50c',
    tableName: 'test_indo',
    tableMode: 'minimal',
    applyFilter: query => query.eq('category', 'top_50c_indo'),
  },
  {
    key: 'indo-10c',
    title: 'สติกเกอร์ดุ๊กดิ๊ก 10c อินโด',
    subtitle: 'รวมสติกเกอร์ดุ๊กดิ๊ก 10c อินโด อัปเดตล่าสุด',
    href: '/category/indo_10c',
    badge: 'Indonesia 10c',
    tableName: 'test_indo',
    tableMode: 'minimal',
    applyFilter: query => query.eq('category', 'top_creator_id'),
  },
  {
    key: 'taiwan-official',
    title: 'สติกเกอร์ทางการไต้หวัน',
    subtitle: 'รวมสติกเกอร์ทางการไต้หวัน อัปเดตล่าสุด',
    href: '/category/taiwan',
    badge: 'Taiwan Official',
    tableName: 'test_taiwan',
    tableMode: 'minimal',
    categoryOverride: 'taiwan',
    applyFilter: query => query,
  },
];

function normalizeProductItem(item, section = {}) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    category: section.categoryOverride || item.category,
    price: item.price,
    main_image: item.main_image,
    image_list: item.image_list,
    is_new_sticker_official: item.is_new_sticker_official ?? false,
    is_new_emoji_official: item.is_new_emoji_official ?? false,
    is_new_theme_official: item.is_new_theme_official ?? false,
    is_promotion: item.is_promotion ?? false,
    official_promo:
      section.officialPromoOverride === true
        ? true
        : item.official_promo ?? false,
    promo_price: item.promo_price ?? null,
    promo_end_date: item.promo_end_date ?? null,
    updated_at: item.updated_at,
  };
}

async function fetchSectionItems(section, sourceConfig = {}) {
  const config = {
    ...section,
    ...sourceConfig,
  };

  const tableName = config.tableName || DEFAULT_TABLE_NAME;
  const selectColumns =
    config.tableMode === 'minimal' ? minimalProductSelect : productSelect;

  const baseQuery = supabase
    .from(tableName)
    .select(selectColumns)
    .order('updated_at', { ascending: false })
    .limit(SECTION_LIMIT);

  const finalQuery = config.applyFilter
    ? config.applyFilter(baseQuery)
    : baseQuery;

  const { data, error } = await finalQuery;

  if (error) {
    console.error(`[${section.key}:${tableName}] ${error.message}`);
    return [];
  }

  return (data || []).map(item => normalizeProductItem(item, config));
}

async function getSectionItems(section) {
  if (Array.isArray(section.sources) && section.sources.length > 0) {
    const results = await Promise.all(
      section.sources.map(source => fetchSectionItems(section, source))
    );

    const mergedItems = results
      .flat()
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;

        return dateB - dateA;
      });

    const uniqueItems = [];

    for (const item of mergedItems) {
      if (uniqueItems.some(existingItem => existingItem.id === item.id)) {
        continue;
      }

      uniqueItems.push(item);

      if (uniqueItems.length >= SECTION_LIMIT) {
        break;
      }
    }

    return uniqueItems;
  }

  return fetchSectionItems(section);
}

function ProductSection({ section, items }) {
  if (!items || items.length === 0) {
    return null;
  }

  const usePromoPrice =
    section.key === 'discount-promotion' ||
    section.key === 'official-promotion';

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm md:p-7">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
            {section.badge}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-blue-950 md:text-3xl">
            {section.title}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500 md:text-base">
            {section.subtitle}
          </p>
        </div>

        <Link
          href={section.href}
          className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-5 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
        >
          {section.linkLabel || 'ดูทั้งหมด'}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {items.map(item => (
          <ProductCard
            key={item.id}
            item={item}
            usePromoPrice={usePromoPrice}
          />
        ))}
      </div>
    </section>
  );
}

function PromotionInternalLinkBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-4">
      <div className="overflow-hidden rounded-[2rem] border border-orange-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-black text-orange-700 md:text-sm">
              โปรสติ๊กเกอร์ไลน์ราคาถูก
            </div>

            <h2 className="text-2xl font-black leading-tight tracking-tight text-blue-950 md:text-3xl">
              ซื้อสติกเกอร์ไลน์ลดราคา พร้อมโปรพิเศษจากครีเอเตอร์
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              กำลังมองหาที่ซื้อสติกเกอร์ไลน์หรือซื้อสติ๊กเกอร์ไลน์ในราคาคุ้มค่าอยู่ใช่ไหม?
              เรารวมโปรโมชั่นสติกเกอร์ไลน์ลดราคาจากครีเอเตอร์ไว้ให้เลือกดูง่าย ๆ
              พร้อมราคาปกติ ราคาพิเศษ และวันหมดโปรในหน้าเดียว
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              ดูรายการทั้งหมดได้ที่หน้า{' '}
              <Link
                href="/promotion"
                className="font-black text-orange-700 underline decoration-orange-300 underline-offset-4 transition hover:text-orange-900"
              >
                ซื้อสติ๊กเกอร์ไลน์ราคาถูก
              </Link>{' '}
              เพื่อเลือกชุดที่ชอบก่อนโปรหมด
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/promotion"
              className="inline-flex h-12 items-center justify-center rounded-full bg-orange-700 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-800"
            >
              ดูโปรสติกเกอร์ไลน์ลดราคา →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoCreatorsBanner() {
  return (
    <Link
      href="/promotion/creators"
      className="group relative block overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-r from-orange-500 via-orange-400 to-[#06C755] p-[1px] shadow-xl shadow-orange-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30"
    >
      <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[#0f172a] px-6 py-7 md:px-8 md:py-8">
        <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-green-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black text-orange-300 md:text-sm">
              🔥โปรโมชันพิเศษ🔥
            </div>

            <h2 className="text-2xl font-black leading-tight tracking-tight text-white md:text-4xl">
              โปรโมชั่นลดทั้งครีเอเตอร์
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
              🔥รวมโปรโมชันราคาพิเศษจากครีเอเตอร์ ทั้งสติกเกอร์และอิโมจิ
              กดดูรายละเอียดแคมเปญทั้งหมดได้ที่หน้านี้🔥
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                50© ลายละ 15 บาท
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                50© ลายละ 12 บาท
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                อิโมจิ 70© ลายละ 20 บาท
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <div className="inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-6 text-sm font-black text-white shadow-lg shadow-green-500/20 transition group-hover:scale-105">
              ดูรายละเอียดโปรโมชั่น →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const sectionResults = await Promise.all(
    sectionsConfig.map(async section => {
      const items = await getSectionItems(section);

      return {
        section,
        items,
      };
    })
  );

  return (
    <main className="min-h-screen bg-[#fffaf3] text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 md:py-20">
          <div className="max-w-5xl">
            <div className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
              ร้านค้าทางการที่ได้รับอนุญาตจาก LINE Sticker หมายเลข LVS0454
            </div>

            <h1 className="text-5xl font-black leading-none tracking-[-0.08em] text-blue-950 md:text-7xl">
              iM Sticker Shop
              <span className="mt-4 block text-3xl leading-tight tracking-[-0.05em] text-blue-900 md:text-5xl">
                ส่งของขวัญสติกเกอร์ไลน์ ราคาถูกกว่ากดซื้อเอง
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              เลือกดูสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และเมโลดี้ไลน์
              พร้อมบริการส่งเอง ส่งไวทันใจ
            </p>

            <form
              action="/search"
              method="GET"
              className="mt-7 flex w-full max-w-3xl flex-col gap-2 rounded-3xl border border-orange-100 bg-white p-2 shadow-xl shadow-blue-950/5 md:flex-row md:rounded-full"
            >
              <input
                type="search"
                name="q"
                placeholder="ค้นหาชื่อสติกเกอร์ อิโมจิ หรือธีมไลน์"
                aria-label="ค้นหาสินค้า"
                className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-5 text-sm outline-none placeholder:text-slate-400 md:text-base"
              />

              <button
                type="submit"
                className="h-12 rounded-full bg-blue-950 px-7 text-sm font-black text-white transition hover:bg-orange-700"
              >
                ค้นหา
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/promotion"
                className="inline-flex h-12 items-center justify-center rounded-full bg-orange-700 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-800"
              >
                ซื้อสติกเกอร์ไลน์ลดราคา
              </Link>

              <a
                href="https://line.me/ti/p/~rebornmmm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-6 text-sm font-black text-white shadow-lg shadow-green-500/20 transition hover:bg-[#04a947]"
              >
                สั่งซื้อผ่าน LINE
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <strong className="block text-lg font-black text-blue-950">
            ราคาคุ้มกว่า
          </strong>
          <span className="mt-1 block text-sm leading-relaxed text-slate-500">
            ส่งเป็นของขวัญให้ถูกกว่าเติมเหรียญเอง
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <strong className="block text-lg font-black text-blue-950">
            ส่งไวทันใจ
          </strong>
          <span className="mt-1 block text-sm leading-relaxed text-slate-500">
            ติดต่อสั่งซื้อผ่าน LINE ได้โดยตรง
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <strong className="block text-lg font-black text-blue-950">
            ครบหลายประเภท
          </strong>
          <span className="mt-1 block text-sm leading-relaxed text-slate-500">
            สติกเกอร์ อิโมจิ ธีม และเมโลดี้ไลน์
          </span>
        </div>
      </section>

      <PromotionInternalLinkBanner />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:py-12">
        {sectionResults.map(({ section, items }) => (
          <div key={section.key} className="contents">
            {section.key === 'new-official-sticker' ? (
              <PromoCreatorsBanner />
            ) : null}
            <ProductSection section={section} items={items} />
          </div>
        ))}
      </div>

      <SiteFooter />
    </main>
  );
    }
