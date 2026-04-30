import ProductListingPage from '@/components/ProductListingPage';

export const revalidate = 300;

const officialPromotionConfig = {
  key: 'official-promotion',
  title: 'โปรโมชั่นจากทางไลน์',
  description:
    'รวมสินค้าที่มีโปรโมชั่นจากทาง LINE สติกเกอร์ไลน์ อิโมจิไลน์ และธีมไลน์ ราคาพิเศษ',
  badge: 'LINE Promo',
  basePath: '/promotion/official',
  hiddenParams: {},
  usePromoPrice: true,
  applyFilter: query => query.eq('official_promo', true),
};

export const metadata = {
  title: 'โปรโมชั่นจากทางไลน์ | iM Sticker Shop',
  description:
    'รวมสินค้าที่มีโปรโมชั่นจากทาง LINE สติกเกอร์ไลน์ อิโมจิไลน์ และธีมไลน์ ราคาพิเศษ',
  openGraph: {
    title: 'โปรโมชั่นจากทางไลน์ | iM Sticker Shop',
    description:
      'รวมสินค้าที่มีโปรโมชั่นจากทาง LINE สติกเกอร์ไลน์ อิโมจิไลน์ และธีมไลน์ ราคาพิเศษ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'โปรโมชั่นจากทางไลน์ | iM Sticker Shop',
    description:
      'รวมสินค้าที่มีโปรโมชั่นจากทาง LINE สติกเกอร์ไลน์ อิโมจิไลน์ และธีมไลน์ ราคาพิเศษ',
  },
};

export default async function OfficialPromotionPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <ProductListingPage
      config={officialPromotionConfig}
      searchParams={resolvedSearchParams}
    />
  );
}