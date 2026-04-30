import { normalizeImageList } from '@/lib/product-display';

export default function EmojiFourGridViewer({ imageList, isAnimated, alt }) {
  const safeImageList = normalizeImageList(imageList);

  if (!Array.isArray(safeImageList) || safeImageList.length < 4) {
    return (
      <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-orange-50 p-2">
        <img
          src={safeImageList[0] || '/placeholder.png'}
          alt={alt || 'emoji line'}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  const displayImages = safeImageList.slice(0, 4);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-orange-50 p-2">
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1">
        {displayImages.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="flex items-center justify-center rounded-xl bg-white/70 p-1"
          >
            <img
              src={url || '/placeholder.png'}
              alt={alt || 'emoji line'}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>

      {isAnimated ? (
        <div className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full border border-white/60 bg-blue-950/80 text-white shadow-md backdrop-blur">
          <svg
            className="h-3.5 w-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}