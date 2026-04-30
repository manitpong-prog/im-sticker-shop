import Link from 'next/link';
import EmojiFourGridViewer from '@/components/EmojiFourGridViewer';
import {
  formatPrice,
  formatSellingPrice,
  getSellingPrice,
  hasPromoPrice,
} from '@/lib/price-logic';
import {
  formatPromoDate,
  getTypeLabel,
  isAnimatedImageList,
  normalizeImageList,
} from '@/lib/product-display';

export default function ProductCard({ item, usePromoPrice = false }) {
  const sellingPrice = getSellingPrice(item.price);
  const hasSellingPrice = sellingPrice !== null;
  const hasPromotionPrice = hasPromoPrice(item);

  const isPromotionItem =
    item.is_promotion === true || item.official_promo === true;

  const shouldUsePromoPrice = usePromoPrice || isPromotionItem;

  const imageList = normalizeImageList(item.image_list);
  const isEmoji = item.type === 'emoji';
  const isAnimatedEmoji = isEmoji && isAnimatedImageList(imageList);
  const promoEndDate = formatPromoDate(item.promo_end_date);

  return (
    <Link
      href={`/product/${item.id}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
    >
      <div className="relative bg-gradient-to-br from-orange-50 via-white to-slate-50 p-3">
        {isEmoji && imageList.length > 0 ? (
          <EmojiFourGridViewer
            imageList={imageList}
            isAnimated={isAnimatedEmoji}
            alt={item.name}
          />
        ) : item.main_image ? (
          <img
            src={item.main_image}
            alt={item.name}
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-contain"
          />
        ) : (
          <div className="grid aspect-square w-full place-items-center rounded-2xl bg-orange-50 text-center text-xs text-slate-400">
            ไม่มีรูปภาพ
          </div>
        )}

        <div className="absolute left-5 top-5 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-bold text-white">
          {getTypeLabel(item.type)}
        </div>

        {item.is_promotion ? (
          <div className="absolute right-5 top-5 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-bold text-white">
            โปรลดราคา
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[42px] text-sm font-black leading-snug text-slate-900 transition group-hover:text-orange-700">
          {item.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          {shouldUsePromoPrice ? (
            hasPromotionPrice ? (
              <>
                <span className="text-xs text-slate-400 line-through">
                  ปกติ {formatPrice(item.price)}
                </span>

                <span className="text-base font-black text-orange-700">
                  {formatPrice(item.promo_price)}
                </span>
              </>
            ) : hasSellingPrice ? (
              <span className="text-base font-black text-orange-700">
                {formatSellingPrice(item.price)}
              </span>
            ) : (
              <span className="text-sm font-black text-orange-700">
                สอบถามราคาเพิ่มเติม
              </span>
            )
          ) : hasSellingPrice ? (
            <span className="text-base font-black text-orange-700">
              {formatSellingPrice(item.price)}
            </span>
          ) : (
            <span className="text-sm font-black text-orange-700">
              สอบถามราคาเพิ่มเติม
            </span>
          )}
        </div>

        {item.is_promotion ? (
          <p className="mt-2 text-xs font-bold leading-relaxed text-orange-700">
            ได้รับส่วนลดจากครีเอเตอร์
          </p>
        ) : null}

        {item.official_promo ? (
          <p className="mt-1 text-xs font-bold leading-relaxed text-blue-900">
            โปรโมชั่นจากทาง LINE
          </p>
        ) : null}

        {shouldUsePromoPrice && hasPromotionPrice && promoEndDate ? (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            หมดโปร {promoEndDate}
          </p>
        ) : null}
      </div>
    </Link>
  );
}