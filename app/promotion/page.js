import ProductListingPage from '@/components/ProductListingPage';

export const revalidate = 300;

const SITE_URL = 'https://www.imstickerpro.shop';
const PAGE_URL = `${SITE_URL}/promotion`;

const pageTitle =
  'ซื้อสติกเกอร์ไลน์ลดราคา | โปรสติ๊กเกอร์ไลน์ราคาถูก';

const pageDescription =
  'รวมโปรซื้อสติกเกอร์ไลน์ลดราคา และโปรโมชั่นสติ๊กเกอร์ไลน์ราคาถูกจากครีเอเตอร์ มีทั้งสติกเกอร์น่ารัก กวน ๆ ใช้ทำงาน พร้อมราคาพิเศษและวันหมดโปร';

const promotionConfig = {
  key: 'discount-promotion',
  title: 'ซื้อสติกเกอร์ไลน์ลดราคา โปรโมชั่นราคาถูกจากครีเอเตอร์',
  description:
    'รวมโปรโมชั่นสติกเกอร์ไลน์ราคาถูกจากครีเอเตอร์ สำหรับคนที่กำลังมองหาที่ซื้อสติกเกอร์ไลน์หรือซื้อสติ๊กเกอร์ไลน์ในราคาพิเศษ มีทั้งสติกเกอร์น่ารัก กวน ๆ ใช้ทำงาน ใช้คุยกับเพื่อน พร้อมราคาปกติ ราคาลด และวันหมดโปรให้ดูชัดเจน',
  badge: 'โปรลดราคา',
  basePath: '/promotion',
  hiddenParams: {},
  usePromoPrice: true,
  applyFilter: query => query.eq('is_promotion', true),
};

export const metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'ซื้อสติกเกอร์ไลน์',
    'ซื้อสติ๊กเกอร์ไลน์',
    'ซื้อสติกเกอร์ไลน์ลดราคา',
    'ซื้อสติ๊กเกอร์ไลน์ราคาถูก',
    'สติกเกอร์ไลน์ราคาถูก',
    'สติ๊กเกอร์ไลน์ราคาถูก',
    'โปรโมชั่นสติกเกอร์ไลน์',
    'โปรสติ๊กเกอร์ไลน์',
    'สติกเกอร์ไลน์ลดราคา',
    'สติ๊กเกอร์ไลน์ลดราคา',
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: PAGE_URL,
    siteName: 'iM Sticker Pro',
    type: 'website',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'ซื้อสติกเกอร์ไลน์ลดราคา',
  alternateName: 'ซื้อสติ๊กเกอร์ไลน์ราคาถูก',
  description: pageDescription,
  url: PAGE_URL,
  isPartOf: {
    '@type': 'WebSite',
    name: 'iM Sticker Pro',
    url: SITE_URL,
  },
  about: [
    'ซื้อสติกเกอร์ไลน์',
    'ซื้อสติ๊กเกอร์ไลน์',
    'สติกเกอร์ไลน์ลดราคา',
    'สติ๊กเกอร์ไลน์ราคาถูก',
    'โปรโมชั่นสติกเกอร์ไลน์',
  ],
};

export default async function PromotionPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <ProductListingPage
        config={promotionConfig}
        searchParams={resolvedSearchParams}
      />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">
            วิธีซื้อสติกเกอร์ไลน์โปรโมชั่น
          </h2>

          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-gray-700">
            <li>เลือกชุดสติกเกอร์ไลน์ลดราคาที่ต้องการจากหน้านี้</li>
            <li>ตรวจสอบราคาปกติ ราคาพิเศษ และวันหมดโปรโมชั่นก่อนสั่งซื้อ</li>
            <li>กดดูรายละเอียด หรือกดติดต่อผ่าน LINE เพื่อสอบถามเพิ่มเติม</li>
            <li>แจ้งชื่อชุดสติกเกอร์ที่ต้องการซื้อ แล้วรอรับรายละเอียดการสั่งซื้อ</li>
          </ol>

          <div className="mt-6">
            <h2 className="text-xl font-bold">
              คำถามที่พบบ่อยเกี่ยวกับการซื้อสติ๊กเกอร์ไลน์ราคาถูก
            </h2>

            <div className="mt-4 space-y-5 text-sm leading-7 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">
                  ซื้อสติ๊กเกอร์ไลน์ราคาถูกได้ที่ไหน?
                </h3>
                <p>
                  สามารถเลือกดูโปรโมชั่นสติกเกอร์ไลน์ลดราคาจากครีเอเตอร์ได้ในหน้านี้
                  โดยมีข้อมูลราคาปกติ ราคาลด และวันหมดโปรให้ดูก่อนตัดสินใจ
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  สติกเกอร์ไลน์ลดราคาใช้ได้เหมือนสติกเกอร์ปกติไหม?
                </h3>
                <p>
                  โดยทั่วไปสติกเกอร์ไลน์โปรโมชั่นสามารถใช้งานได้เหมือนสติกเกอร์ไลน์ปกติ
                  หลังซื้อแล้วสามารถนำไปใช้ในแชท LINE ได้ตามเงื่อนไขของ LINE
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  โปรสติ๊กเกอร์ไลน์หมดเมื่อไหร่?
                </h3>
                <p>
                  แต่ละชุดอาจมีวันหมดโปรโมชั่นไม่เท่ากัน
                  ควรตรวจสอบวันที่หมดโปรในหน้ารายการหรือหน้ารายละเอียดสินค้าก่อนสั่งซื้อ
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  ซื้อสติ๊กเกอร์ไลน์ผ่านร้านที่นี่ปลอดภัยไหม?
                </h3>
                <p>
                  ซื้อสติกเกอร์ไลน์กับพ่อค้าปลอดภัยไม่โดนดึงคืน
                  เพราะซื้อสติ๊กเกอร์ไลน์กับทางร้านทางการ LVS0454
                  ใช้เหรียญแท้จากระบบไลน์ปลอดภัยไม่โดนดึงคืน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
