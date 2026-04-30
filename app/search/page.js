import ProductListingPage from '@/components/ProductListingPage';

export const revalidate = 300;

const searchConfig = {
  key: 'search',
  title: 'ค้นหาสินค้า',
  description:
    'ค้นหาสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และสินค้า LINE ทั้งหมดจาก iM Sticker Shop',
  badge: 'Search',
  basePath: '/search',
  hiddenParams: {},
  usePromoPrice: true,
  applyFilter: query => query,
};

export const metadata = {
  title: 'ค้นหาสินค้า | iM Sticker Shop',
  description:
    'ค้นหาสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และสินค้า LINE ทั้งหมดจาก iM Sticker Shop',
  openGraph: {
    title: 'ค้นหาสินค้า | iM Sticker Shop',
    description:
      'ค้นหาสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และสินค้า LINE ทั้งหมดจาก iM Sticker Shop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ค้นหาสินค้า | iM Sticker Shop',
    description:
      'ค้นหาสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และสินค้า LINE ทั้งหมดจาก iM Sticker Shop',
  },
};

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <ProductListingPage
      config={searchConfig}
      searchParams={resolvedSearchParams}
    />
  );
}