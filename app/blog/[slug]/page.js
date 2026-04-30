import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 300;

const postSelect = `
  id,
  created_at,
  title,
  slug,
  content,
  excerpt,
  image_url,
  author,
  is_published
`;

function formatPostDate(date) {
  if (!date) return '';

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

async function getPost(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    return {
      title: 'ไม่พบบทความ | iM Sticker Shop',
      description: 'ไม่พบบทความที่ต้องการ',
    };
  }

  const title = `${post.title} | iM Sticker Shop`;
  const description =
    post.excerpt ||
    'บทความจาก iM Sticker Shop เกี่ยวกับสติกเกอร์ไลน์ อิโมจิไลน์ ธีมไลน์ และเมโลดี้ไลน์';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: post.image_url
        ? [
            {
              url: post.image_url,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

function ArticleContent({ content }) {
  if (!content) {
    return (
      <p className="text-base leading-8 text-slate-600">
        ยังไม่มีเนื้อหาบทความ
      </p>
    );
  }

  const safeContent = content.trim();
  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(safeContent);

  if (hasHtmlTag) {
    return (
      <div
        className="
          text-base leading-9 text-slate-700 md:text-lg
          [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-blue-950
          [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-blue-950
          [&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-xl [&_h4]:font-black [&_h4]:text-blue-950
          [&_p]:mb-5 [&_p]:leading-9
          [&_strong]:font-black [&_strong]:text-blue-950
          [&_a]:font-bold [&_a]:text-orange-700 [&_a]:underline
          [&_ul]:mb-5 [&_ul]:ml-6 [&_ul]:list-disc
          [&_ol]:mb-5 [&_ol]:ml-6 [&_ol]:list-decimal
          [&_li]:mb-2
          [&_img]:my-6 [&_img]:rounded-3xl [&_img]:border [&_img]:border-orange-100
          [&_blockquote]:my-6 [&_blockquote]:rounded-3xl [&_blockquote]:border-l-4 [&_blockquote]:border-orange-400 [&_blockquote]:bg-orange-50 [&_blockquote]:p-5 [&_blockquote]:font-bold [&_blockquote]:text-blue-950
        "
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    );
  }

  return (
    <div className="whitespace-pre-line text-base leading-9 text-slate-700 md:text-lg">
      {content}
    </div>
  );
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] text-slate-900">
      <SiteHeader />

      <article>
        <section className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />

          <div className="relative mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
            <div className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
              บทความ
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-blue-950 md:text-6xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <span>{formatPostDate(post.created_at)}</span>
              <span>•</span>
              <span>{post.author || 'Manit'}</span>
            </div>

            {post.excerpt ? (
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                {post.excerpt}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/blog"
                className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-blue-950 shadow-sm transition hover:border-orange-400 hover:text-orange-700"
              >
                กลับหน้ารวมบทความ
              </Link>

              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-5 text-sm font-black text-blue-950 shadow-sm transition hover:border-orange-400 hover:text-orange-700"
              >
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-12">
          {post.image_url ? (
            <div className="mb-8 overflow-hidden rounded-[2rem] border border-orange-100 bg-orange-50 shadow-xl shadow-blue-950/5">
              <img
                src={post.image_url}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <ArticleContent content={post.content} />
          </div>

          <div className="mt-8 rounded-[2rem] border border-orange-100 bg-blue-950 p-6 text-center text-white shadow-xl shadow-blue-950/10 md:p-8">
            <h2 className="text-2xl font-black">
              สนใจสั่งซื้อสติกเกอร์ไลน์ราคาคุ้มกว่า?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/75">
              แอด LINE เพื่อสอบถามหรือสั่งซื้อสินค้าได้โดยตรงกับ iM Sticker Shop
            </p>

            <a
              href="https://line.me/ti/p/~rebornmmm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#06C755] px-7 text-sm font-black text-white shadow-lg shadow-green-500/20 transition hover:bg-[#04a947]"
            >
              สั่งซื้อ / ติดต่อ LINE
            </a>
          </div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}