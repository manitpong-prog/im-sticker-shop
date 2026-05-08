import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProductCard from '@/components/ProductCard';

const DEFAULT_TABLE_NAME = 'test_stickers';
const PAGE_SIZE = 36;

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
  promo_end_date,
  updated_at
`;

function getSafePage(pageValue) {
  const page = Number(pageValue);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function getSafeSearch(searchValue) {
  if (!searchValue || typeof searchValue !== 'string') {
    return '';
  }

  return searchValue.trim();
}

function buildListingUrl(basePath, options = {}) {
  const params = new URLSearchParams();
  const hiddenParams = options.hiddenParams || {};

  Object.entries(hiddenParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  if (options.page && Number(options.page) > 1) {
    params.set('page', String(options.page));
  }

  if (options.q) {
    params.set('q', options.q);
  }

  const queryString = params.toString();

  return `${basePath}${queryString ? `?${queryString}` : ''}`;
}

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  if (currentPage <= 3) {
    items.add(2);
    items.add(3);
    items.add(4);
  }

  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 1);
    items.add(totalPages - 2);
    items.add(totalPages - 3);
  }

  return Array.from(items)
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

function normalizeProductItem(item, config = {}) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    category: config.categoryOverride || item.category,
    price: item.price,
    main_image: item.main_image,
    image_list: item.image_list,
    is_new_sticker_official: item.is_new_sticker_official ?? false,
    is_new_emoji_official: item.is_new_emoji_official ?? false,
    is_new_theme_official: item.is_new_theme_official ?? false,
    is_promotion: item.is_promotion ?? false,
    official_promo:
      config.officialPromoOverride === true
        ? true
        : item.official_promo ?? false,
    promo_price: item.promo_price ?? null,
    promo_end_date: item.promo_end_date ?? null,
    updated_at: item.updated_at,
  };
}

async function fetchListingProducts({ config, searchParams, sourceConfig = {} }) {
  const finalConfig = {
    ...config,
    ...sourceConfig,
  };

  const page = getSafePage(searchParams?.page);
  const searchQuery = getSafeSearch(searchParams?.q);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const tableName = finalConfig.tableName || DEFAULT_TABLE_NAME;
  const selectColumns =
    finalConfig.tableMode === 'minimal' ? minimalProductSelect : productSelect;

  let query = supabase
    .from(tableName)
    .select(selectColumns, { count: 'exact' });

  query = finalConfig.applyFilter ? finalConfig.applyFilter(query) : query;

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error(`[listing:${config.key}:${tableName}] ${error.message}`);

    return {
      items: [],
      count: 0,
      page,
      totalPages: 1,
      searchQuery,
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    items: (data || []).map(item => normalizeProductItem(item, finalConfig)),
    count: totalCount,
    page,
    totalPages,
    searchQuery,
  };
}

async function getListingProducts({ config, searchParams }) {
  const page = getSafePage(searchParams?.page);
  const searchQuery = getSafeSearch(searchParams?.q);

  if (!Array.isArray(config.sources) || config.sources.length === 0) {
    return fetchListingProducts({
      config,
      searchParams,
    });
  }

  const fetchLimit = page * PAGE_SIZE;

  const results = await Promise.all(
    config.sources.map(async sourceConfig => {
      const finalConfig = {
        ...config,
        ...sourceConfig,
      };

      const tableName = finalConfig.tableName || DEFAULT_TABLE_NAME;
      const selectColumns =
        finalConfig.tableMode === 'minimal'
          ? minimalProductSelect
          : productSelect;

      let query = supabase
        .from(tableName)
        .select(selectColumns, { count: 'exact' });

      query = finalConfig.applyFilter ? finalConfig.applyFilter(query) : query;

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order('updated_at', { ascending: false })
        .range(0, fetchLimit - 1);

      if (error) {
        console.error(`[listing:${config.key}:${tableName}] ${error.message}`);

        return {
          items: [],
          count: 0,
        };
      }

      return {
        items: (data || []).map(item => normalizeProductItem(item, finalConfig)),
        count: count || 0,
      };
    })
  );

  const mergedItems = results
    .flatMap(result => result.items)
    .sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;

      return dateB - dateA;
    });

  const uniqueItems = [];
  const seenIds = new Set();

  for (const item of mergedItems) {
    if (!item?.id) continue;
    if (seenIds.has(item.id)) continue;

    seenIds.add(item.id);
    uniqueItems.push(item);
  }

  const totalCount = results.reduce((sum, result) => sum + result.count, 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  return {
    items: uniqueItems.slice(from, to),
    count: totalCount,
    page,
    totalPages,
    searchQuery,
  };
}

function ListingHero({ config, count }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
            {config.badge}
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-blue-950 md:text-6xl">
            {config.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            {config.description}
          </p>

          <p className="mt-4 text-sm font-black text-blue-950">
            ทั้งหมด {count.toLocaleString('th-TH')} รายการ
          </p>

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-blue-950 shadow-sm transition hover:border-orange-400 hover:text-orange-700"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingSearchBox({ config, searchQuery }) {
  const hiddenParams = config.hiddenParams || {};

  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <form
        action={config.basePath}
        method="GET"
        className="flex flex-col gap-2 rounded-3xl border border-orange-100 bg-white p-2 shadow-xl shadow-blue-950/5 md:flex-row md:rounded-full"
      >
        {Object.entries(hiddenParams).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="ค้นหาสินค้าในหมวดนี้"
          aria-label="ค้นหาสินค้าในหมวดนี้"
          className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-5 text-sm outline-none placeholder:text-slate-400 md:text-base"
        />

        <button
          type="submit"
          className="h-12 rounded-full bg-blue-950 px-7 text-sm font-black text-white transition hover:bg-orange-700"
        >
          ค้นหา
        </button>

        {searchQuery ? (
          <Link
            href={buildListingUrl(config.basePath, {
              hiddenParams,
            })}
            className="inline-flex h-12 items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-6 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
          >
            ล้างคำค้นหา
          </Link>
        ) : null}
      </form>
    </section>
  );
}

function EmptyState({ config, searchQuery }) {
  const hiddenParams = config.hiddenParams || {};

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-blue-950">
          ไม่พบสินค้าในหมวดนี้
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          {searchQuery
            ? 'ลองค้นหาด้วยคำอื่น หรือกลับไปดูสินค้าทั้งหมดในหมวดนี้'
            : 'ตอนนี้ยังไม่มีสินค้าในหมวดนี้ ลองกลับไปดูหมวดอื่นหรือโปรโมชั่นลดราคา'}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {searchQuery ? (
            <Link
              href={buildListingUrl(config.basePath, {
                hiddenParams,
              })}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-950 px-6 text-sm font-black text-white transition hover:bg-orange-700"
            >
              ดูสินค้าทั้งหมดในหมวดนี้
            </Link>
          ) : null}

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-white px-6 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
          >
            กลับหน้าหลัก
          </Link>

          <Link
            href="/promotion"
            className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-6 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
          >
            ดูโปรโมชั่นลดราคา
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductGrid({ items, usePromoPrice }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {items.map(item => (
          <ProductCard
            key={item.id}
            item={item}
            usePromoPrice={usePromoPrice}
          />
        ))}
      </div>
    </section>
  );
}

function Pagination({ config, currentPage, totalPages, searchQuery }) {
  if (totalPages <= 1) {
    return null;
  }

  const hiddenParams = config.hiddenParams || {};
  const pages = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-2 px-4 pb-12"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={buildListingUrl(config.basePath, {
            page: currentPage - 1,
            q: searchQuery,
            hiddenParams,
          })}
          className="inline-flex h-10 items-center justify-center rounded-full border border-orange-200 bg-white px-4 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
        >
          ก่อนหน้า
        </Link>
      ) : null}

      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const shouldShowDots = previousPage && page - previousPage > 1;
        const isActive = page === currentPage;

        return (
          <span key={page} className="inline-flex items-center gap-2">
            {shouldShowDots ? (
              <span className="px-1 text-sm font-bold text-slate-400">
                ...
              </span>
            ) : null}

            <Link
              href={buildListingUrl(config.basePath, {
                page,
                q: searchQuery,
                hiddenParams,
              })}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition ${
                isActive
                  ? 'bg-blue-950 text-white'
                  : 'border border-orange-200 bg-white text-blue-950 hover:border-orange-400 hover:text-orange-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          </span>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={buildListingUrl(config.basePath, {
            page: currentPage + 1,
            q: searchQuery,
            hiddenParams,
          })}
          className="inline-flex h-10 items-center justify-center rounded-full border border-orange-200 bg-white px-4 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
        >
          ถัดไป
        </Link>
      ) : null}
    </nav>
  );
}

export default async function ProductListingPage({ config, searchParams }) {
  const result = await getListingProducts({
    config,
    searchParams,
  });

  const { items, count, page, totalPages, searchQuery } = result;
  const isOutOfRange = page > totalPages && count > 0;

  if (isOutOfRange) {
    return (
      <main className="min-h-screen bg-[#fffaf3] text-slate-900">
        <SiteHeader />
        <EmptyState config={config} searchQuery={searchQuery} />
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] text-slate-900">
      <SiteHeader />

      <ListingHero config={config} count={count} />

      <ListingSearchBox config={config} searchQuery={searchQuery} />

      {items.length > 0 ? (
        <>
          <ProductGrid
            items={items}
            usePromoPrice={config.usePromoPrice === true}
          />

          <Pagination
            config={config}
            currentPage={page}
            totalPages={totalPages}
            searchQuery={searchQuery}
          />
        </>
      ) : (
        <EmptyState config={config} searchQuery={searchQuery} />
      )}

      <SiteFooter />
    </main>
  );
}
