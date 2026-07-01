const sellingPriceMap = {
  7: 5,
  24: 20,
  31: 25,
  41: 35,
  55: 42,
  65: 50,
  75: 60,
  99: 75,
  2400: 5,   // เรตอินโด 10c / 50c
  12000: 25,  // เรตอินโด 50c
};

export function getSellingPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return null;
  }

  return sellingPriceMap[numericPrice] ?? null;
}

export function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return '-';
  }

  return `${Number(price).toLocaleString('th-TH')} บาท`;
}

export function formatSellingPrice(price) {
  const sellingPrice = getSellingPrice(price);

  if (sellingPrice === null) {
    return 'สอบถามราคาเพิ่มเติม';
  }

  return `${sellingPrice.toLocaleString('th-TH')} บาท`;
}

export function hasPromoPrice(product) {
  return (
    product?.promo_price !== null &&
    product?.promo_price !== undefined &&
    product?.promo_price !== ''
  );
}

export function getProductPriceInfo(product) {
  const hasPromo = hasPromoPrice(product);
  const sellingPrice = getSellingPrice(product?.price);
  const hasNormalSellingPrice = sellingPrice !== null;

  if (hasPromo) {
    return {
      mode: 'promo',
      originalPrice: product.price,
      finalPrice: product.promo_price,
      hasPrice: true,
    };
  }

  if (hasNormalSellingPrice) {
    return {
      mode: 'normal',
      originalPrice: null,
      finalPrice: sellingPrice,
      hasPrice: true,
    };
  }

  return {
    mode: 'unknown',
    originalPrice: null,
    finalPrice: null,
    hasPrice: false,
  };
}