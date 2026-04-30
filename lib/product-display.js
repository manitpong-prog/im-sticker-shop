export function normalizeImageList(imageList) {
  if (Array.isArray(imageList)) {
    return imageList;
  }

  if (typeof imageList === 'string') {
    try {
      const parsed = JSON.parse(imageList);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function isAnimatedImageList(imageList) {
  return imageList.some(url => {
    if (typeof url !== 'string') return false;

    return (
      url.includes('animation') ||
      url.includes('animated') ||
      url.includes('sticker_animation') ||
      url.includes('emoji_animation') ||
      url.includes('_animation')
    );
  });
}

export function formatPromoDate(date) {
  if (!date) return null;

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getTypeLabel(type) {
  const labels = {
    sticker: 'สติกเกอร์',
    emoji: 'อิโมจิ',
    theme: 'ธีม',
  };

  return labels[type] || type;
}

export function getCategoryLabel(category) {
  const labels = {
    official_sticker: 'สติกเกอร์ทางการ',
    creator_sticker: 'สติกเกอร์ครีเอเตอร์',
    official_emoji: 'อิโมจิทางการ',
    creator_emoji: 'อิโมจิครีเอเตอร์',
    official_theme: 'ธีมทางการ',
    creator_theme: 'ธีมครีเอเตอร์',
    top_50c_indo: 'สติกเกอร์ดุ๊กดิ๊ก 50c อินโด',
    top_creator_id: 'สติกเกอร์ดุ๊กดิ๊ก 10c อินโด',
    taiwan: 'สติกเกอร์ทางการไต้หวัน',
  };

  return labels[category] || category;
}

export function getCategoryHref(category) {
  const hrefMap = {
    top_50c_indo: '/category/indo_50c',
    top_creator_id: '/category/indo_10c',
    taiwan: '/category/taiwan',
  };

  if (!category) return '/';

  return hrefMap[category] || `/category/${category}`;
}

export function getLineStoreUrl(product) {
  const id = encodeURIComponent(product.id);

  if (product.type === 'emoji') {
    return `https://line.me/S/emoji/?id=${id}`;
  }

  if (product.type === 'theme') {
    return `https://line.me/S/shop/theme/detail?id=${id}`;
  }

  return `https://line.me/S/sticker/${id}`;
}