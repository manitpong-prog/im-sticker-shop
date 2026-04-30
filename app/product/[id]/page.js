import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import EmojiFourGridViewer from '@/components/EmojiFourGridViewer';
import {
  formatPrice,
  formatSellingPrice,
  getProductPriceInfo,
} from '@/lib/price-logic';
import {
  formatPromoDate,
  getCategoryHref,
  getCategoryLabel,
  getLineStoreUrl,
  getTypeLabel,
  isAnimatedImageList,
  normalizeImageList,
} from '@/lib/product-display';

export const revalidate = 300;

const PRODUCT_TABLES = [
  {
    name: 'test_stickers',
    mode: 'full',
  },
  {
    name: 'test_indo',
    mode: 'minimal',
  },
  {
    name: 'test_taiwan',
    mode: 'minimal',
    categoryOverride: 'taiwan',
  },
];

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
function normalizeProductItem(item, tableConfig = {}) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    category: tableConfig.categoryOverride || item.category,
    price: item.price,
    main_image: item.main_image,
    image_list: item.image_list,
    is_new_sticker_official: item.is_new_sticker_official ?? false,
    is_new_emoji_official: item.is_new_emoji_official ?? false,
    is_new_theme_official: item.is_new_theme_official ?? false,
    is_promotion: item.is_promotion ?? false,
    official_promo: item.official_promo ?? false,
    promo_price: item.promo_price ?? null,
    promo_end_date: item.promo_end_date ?? null,
    updated_at: item.updated_at,
  };
}
async function getProduct(id) {
  for (const tableConfig of PRODUCT_TABLES) {
    const selectColumns =
      tableConfig.mode === 'minimal' ? minimalProductSelect : productSelect;

    const { data, error } = await supabase
      .from(tableConfig.name)
      .select(selectColumns)
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return normalizeProductItem(data, tableConfig);
    }
  }

  return null;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return {
      title: 'ไม่พบสินค้า | iM Sticker Shop',
      description: 'ไม่พบสินค้าที่ต้องการ',
    };
  }

  const imageList = normalizeImageList(product.image_list);
  const socialImage = product.main_image || imageList[0] || null;

  const title = `${product.name} | iM Sticker Shop`;
  const description = `ดูรายละเอียด${getTypeLabel(product.type)} ${product.name} พร้อมราคาส่งของขวัญผ่าน LINE`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: socialImage ? [socialImage] : [],
    },
  };
}

function MainProductImage({ product, imageList, isAnimated }) {
  const isEmoji = product.type === 'emoji';

  if (isEmoji && imageList.length > 0) {
    return (
      <EmojiFourGridViewer
        imageList={imageList}
        isAnimated={isAnimated}
        alt={product.name}
      />
    );
  }

  if (product.main_image) {
    return (
      <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-[2rem] bg-orange-50 p-5">
        <img
          src={product.main_image}
          alt={product.name}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="grid aspect-square w-full place-items-center rounded-[2rem] bg-orange-50 text-sm font-bold text-slate-400">
      ไม่มีรูปภาพ
    </div>
  );
}

function ProductPriceBox({ product }) {
  const priceInfo = getProductPriceInfo(product);
  const promoEndDate = formatPromoDate(product.promo_end_date);

  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
      <div className="mb-3 text-sm font-black text-blue-950">ราคา</div>

      {priceInfo.mode === 'promo' ? (
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-sm text-slate-400 line-through">
              ปกติ {formatPrice(product.price)}
            </span>

            <span className="text-3xl font-black text-orange-700">
              {formatPrice(product.promo_price)}
            </span>
          </div>

          {product.is_promotion ? (
            <p className="mt-3 text-sm font-bold leading-relaxed text-orange-700">
              ได้รับส่วนลดจากครีเอเตอร์
            </p>
          ) : null}

          {promoEndDate ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              หมดเขต {promoEndDate}
            </p>
          ) : null}
        </div>
      ) : priceInfo.mode === 'normal' ? (
        <div className="text-3xl font-black text-orange-700">
          {formatSellingPrice(product.price)}
        </div>
      ) : (
        <div className="text-xl font-black text-orange-700">
          สอบถามราคาเพิ่มเติม
        </div>
      )}
    </div>
  );
}

function ImageGallery({ imageList, productName }) {
  if (!imageList || imageList.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-blue-950">
          รูปตัวอย่างทั้งหมด
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          รูปย่อยทั้งหมดจากสินค้า ใช้สำหรับดูตัวอย่างก่อนสั่งซื้อ
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {imageList.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-orange-50 p-2"
          >
            <img
              src={url || '/placeholder.png'}
              alt={`${productName} รูปที่ ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const imageList = normalizeImageList(product.image_list);
  const isAnimated = isAnimatedImageList(imageList);
  const lineStoreUrl = getLineStoreUrl(product);
  const categoryHref = getCategoryHref(product.category);

  return (
    <main className="min-h-screen bg-[#fffaf3] text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-start md:py-12">
          <div className="rounded-[2.25rem] border border-orange-100 bg-white p-4 shadow-xl shadow-blue-950/5">
            <MainProductImage
              product={product}
              imageList={imageList}
              isAnimated={isAnimated}
            />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-black text-white">
                {getTypeLabel(product.type)}
              </span>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                {getCategoryLabel(product.category)}
              </span>

              {isAnimated ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  ดุ๊กดิ๊ก
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-blue-950 md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              เลือกดูรายละเอียดสินค้า ก่อนสั่งซื้อเป็นของขวัญผ่าน LINE กับ iM
              Sticker Shop
            </p>

            <div className="mt-6">
              <ProductPriceBox product={product} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="https://line.me/ti/p/~rebornmmm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-6 text-sm font-black text-white shadow-lg shadow-green-500/20 transition hover:bg-[#04a947]"
              >
                สั่งซื้อในไลน์
              </a>

              <a
                href={lineStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-950 px-6 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:bg-orange-700"
              >
                เปิดใน LINE
              </a>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
              >
                กลับหน้าหลัก
              </Link>

              <Link
                href={categoryHref}
                className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-5 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
              >
                กลับหน้าหมวดหมู่
              </Link>
            </div>

            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-black text-blue-950">
                ข้อมูลสินค้า
              </h2>

              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">ชื่อ</dt>
                  <dd className="font-bold text-slate-900">{product.name}</dd>
                </div>

                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">ประเภท</dt>
                  <dd className="font-bold text-slate-900">
                    {getTypeLabel(product.type)}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">หมวดหมู่</dt>
                  <dd className="font-bold text-slate-900">
                    {getCategoryLabel(product.category)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12">
        <ImageGallery imageList={imageList} productName={product.name} />
      </div>

      <SiteFooter />
    </main>
  );
}