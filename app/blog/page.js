import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 300;

export const metadata = {
  title: 'บล็อกบทความ | iM Sticker Shop',
  description:
    'รวมบทความเกี่ยวกับสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ เมโลดี้ไลน์ วิธีสั่งซื้อ และโปรโมชันจาก iM Sticker Shop',
};

const POSTS_PER_PAGE = 12;

const postSelect = `
  id,
  created_at,
  title,
  slug,
  excerpt,
  image_url,
  author,
  is_published
`;

function getSafePage(pageValue) {
  const page = Number(pageValue);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function formatPostDate(date) {
  if (!date) return '';

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function buildBlogUrl(page) {
  if (!page || page <= 1) {
    return '/blog';
  }

  return `/blog?page=${page}`;
}

async function getPosts(searchParams) {
  const page = getSafePage(searchParams?.page);
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select(postSelect, { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error(`[blog] ${error.message}`);

    return {
      posts: [],
      count: 0,
      page,
      totalPages: 1,
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

  return {
    posts: data || [],
    count: totalCount,
    page,
    totalPages,
  };
}

function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] bg-orange-50">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-orange-50 to-blue-50 px-6 text-center">
            <span className="text-2xl font-black tracking-tight text-blue-950">
              iM Sticker
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
          <span>{formatPostDate(post.created_at)}</span>
          <span>•</span>
          <span>{post.author || 'Manit'}</span>
        </div>

        <h2 className="line-clamp-2 text-xl font-black leading-snug text-blue-950 transition group-hover:text-orange-700">
          {post.title}
        </h2>

        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-5 inline-flex text-sm font-black text-orange-700">
          อ่านบทความ →
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-blue-950">
          ยังไม่มีบทความ
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          ตอนนี้ยังไม่มีบทความที่เผยแพร่ กลับไปเลือกดูสินค้าในหน้าแรกก่อนได้ครับ
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-blue-950 px-6 text-sm font-black text-white transition hover:bg-orange-700"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  );
}

function BlogPagination({ currentPage, totalPages }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-center gap-3 px-4 pb-12">
      {currentPage > 1 ? (
        <Link
          href={buildBlogUrl(currentPage - 1)}
          className="inline-flex h-10 items-center justify-center rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
        >
          ก่อนหน้า
        </Link>
      ) : null}

      <span className="text-sm font-black text-blue-950">
        หน้า {currentPage.toLocaleString('th-TH')} /{' '}
        {totalPages.toLocaleString('th-TH')}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildBlogUrl(currentPage + 1)}
          className="inline-flex h-10 items-center justify-center rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-blue-950 transition hover:border-orange-400 hover:text-orange-700"
        >
          ถัดไป
        </Link>
      ) : null}
    </nav>
  );
}

export default async function BlogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { posts, count, page, totalPages } = await getPosts(resolvedSearchParams);

  return (
    <main className="min-h-screen bg-[#fffaf3] text-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
              Blog
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-blue-950 md:text-6xl">
              บล็อกบทความ
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              รวมบทความเกี่ยวกับสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ เมโลดี้ไลน์
              วิธีสั่งซื้อ และข้อควรรู้ก่อนเลือกซื้อของขวัญผ่าน LINE
            </p>

            <p className="mt-4 text-sm font-black text-blue-950">
              ทั้งหมด {count.toLocaleString('th-TH')} บทความ
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

      {posts.length > 0 ? (
        <>
          <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </section>

          <BlogPagination currentPage={page} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState />
      )}

      <SiteFooter />
    </main>
  );
}