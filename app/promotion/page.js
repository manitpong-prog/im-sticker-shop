import ProductListingPage from '@/components/ProductListingPage';

export const revalidate = 300;

const promotionConfig = {
  key: 'discount-promotion',
  title: 'โปรโมชั่นลดราคา',
  description:
    'รวมสินค้าได้รับส่วนลดจากครีเอเตอร์ สติกเกอร์ไลน์ราคาถูก โปรโมชั่น',
  badge: 'ลดราคา',
  basePath: '/promotion',
  hiddenParams: {},
  usePromoPrice: true,
  applyFilter: query => query.eq('is_promotion', true),
};

export const metadata = {
  title: 'โปรโมชั่นลดราคา | iM Sticker Shop',
  description:
    'รวมสินค้าได้รับส่วนลดจากครีเอเตอร์ สติกเกอร์ไลน์ราคาถูก โปรโมชั่น',
  openGraph: {
    title: 'โปรโมชั่นลดราคา | iM Sticker Shop',
    description:
      'รวมสินค้าได้รับส่วนลดจากครีเอเตอร์ สติกเกอร์ไลน์ราคาถูก โปรโมชั่น',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'โปรโมชั่นลดราคา | iM Sticker Shop',
    description:
      'รวมสินค้าได้รับส่วนลดจากครีเอเตอร์ สติกเกอร์ไลน์ราคาถูก โปรโมชั่น',
  },
};

export default async function PromotionPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <ProductListingPage
      config={promotionConfig}
      searchParams={resolvedSearchParams}
    />
  );
}