import { notFound } from 'next/navigation';
import ProductListingPage from '@/components/ProductListingPage';

export const revalidate = 300;

const categoryConfig = {
  official_sticker: {
    title: 'สติกเกอร์ทางการ',
    newTitle: 'สติกเกอร์ทางการมาใหม่',
    description:
      'รวมสติกเกอร์ไลน์ทางการยอดนิยมและรายการมาใหม่ พร้อมบริการส่งของขวัญราคาคุ้มค่า',
    newDescription:
      'รวมสติกเกอร์ไลน์ทางการมาใหม่ อัปเดตล่าสุด พร้อมบริการส่งของขวัญราคาคุ้มค่า',
    badge: 'Official Sticker',
  },
  creator_sticker: {
    title: 'สติกเกอร์ครีเอเตอร์',
    description:
      'รวมสติกเกอร์ไลน์ครีเอเตอร์ยอดนิยม หลากหลายสไตล์ สำหรับส่งเป็นของขวัญผ่าน LINE',
    badge: 'Creator Sticker',
  },
  official_emoji: {
    title: 'อิโมจิทางการ',
    description:
      'รวมอิโมจิไลน์ทางการ สำหรับแชทให้น่ารักขึ้น พร้อมบริการส่งของขวัญผ่าน LINE',
    badge: 'Official Emoji',
  },
  creator_emoji: {
    title: 'อิโมจิครีเอเตอร์',
    description:
      'รวมอิโมจิไลน์จากครีเอเตอร์ยอดนิยม ใช้งานง่าย น่ารัก และเหมาะสำหรับแชททุกวัน',
    badge: 'Creator Emoji',
  },
  official_theme: {
    title: 'ธีมทางการ',
    description:
      'รวมธีมไลน์ทางการ สำหรับตกแต่งแอป LINE ให้สวยขึ้น พร้อมบริการส่งของขวัญ',
    badge: 'Official Theme',
  },
  creator_theme: {
    title: 'ธีมครีเอเตอร์',
    description:
      'รวมธีมไลน์จากครีเอเตอร์ยอดนิยม หลากหลายลาย สำหรับตกแต่งแอป LINE',
    badge: 'Creator Theme',
  },
  indo_50c: {
  title: 'สติกเกอร์ดุ๊กดิ๊ก 50c อินโด',
  description:
    'รวมสติกเกอร์ดุ๊กดิ๊ก 50c อินโด สำหรับเลือกซื้อและส่งเป็นของขวัญผ่าน iM Sticker Shop',
  badge: 'Indonesia 50c',
  tableName: 'test_indo',
  tableMode: 'minimal',
  filterCategory: 'top_50c_indo',
},

indo_10c: {
  title: 'สติกเกอร์ดุ๊กดิ๊ก 10c อินโด',
  description:
    'รวมสติกเกอร์ดุ๊กดิ๊ก 10c อินโด ราคาคุ้มค่า สำหรับเลือกซื้อและส่งเป็นของขวัญผ่าน iM Sticker Shop',
  badge: 'Indonesia 10c',
  tableName: 'test_indo',
  tableMode: 'minimal',
  filterCategory: 'top_creator_id',
},

taiwan: {
  title: 'สติกเกอร์ทางการไต้หวัน',
  description:
    'รวมสติกเกอร์ทางการไต้หวัน สำหรับเลือกซื้อและส่งเป็นของขวัญผ่าน iM Sticker Shop',
  badge: 'Taiwan Official',
  tableName: 'test_taiwan',
  tableMode: 'minimal',
  categoryOverride: 'taiwan',
},
};

function isNewOfficialStickerPage(category, searchParams) {
  return category === 'official_sticker' && searchParams?.new === 'true';
}

function getPageConfig(category, searchParams = {}) {
  const config = categoryConfig[category];

  if (!config) {
    return null;
  }

  const isNewPage = isNewOfficialStickerPage(category, searchParams);

  if (category === 'official_sticker' && !isNewPage) {
  return null;
}

  return {
  key: isNewPage ? 'new-official-sticker' : category,
  title: isNewPage && config.newTitle ? config.newTitle : config.title,
  description:
    isNewPage && config.newDescription
      ? config.newDescription
      : config.description,
  badge: config.badge,
  basePath: `/category/${category}`,
  hiddenParams: isNewPage ? { new: 'true' } : {},
  tableName: config.tableName || 'test_stickers',
  tableMode: config.tableMode || 'full',
  categoryOverride: config.categoryOverride,
  usePromoPrice: false,
  applyFilter: query => {
    if (config.tableName) {
      if (config.filterCategory) {
        return query.eq('category', config.filterCategory);
      }

      return query;
    }

    let finalQuery = query.eq('category', category);

    if (isNewPage) {
      finalQuery = finalQuery.eq('is_new_sticker_official', true);
    }

    return finalQuery;
  },
};
}

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const config = getPageConfig(
    resolvedParams.category,
    resolvedSearchParams
  );

  if (!config) {
    return {
      title: 'ไม่พบหมวดหมู่ | iM Sticker Shop',
      description: 'ไม่พบหมวดหมู่สินค้าที่ต้องการ',
    };
  }

  return {
    title: `${config.title} | iM Sticker Shop`,
    description: config.description,
    openGraph: {
      title: `${config.title} | iM Sticker Shop`,
      description: config.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.title} | iM Sticker Shop`,
      description: config.description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const config = getPageConfig(
    resolvedParams.category,
    resolvedSearchParams
  );

  if (!config) {
    notFound();
  }

  return (
    <ProductListingPage
      config={config}
      searchParams={resolvedSearchParams}
    />
  );
}
