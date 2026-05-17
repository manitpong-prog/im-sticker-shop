import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://www.imstickerpro.shop';

const staticRoutes = [
  {
    path: '/',
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    path: '/promotion',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    path: '/promotion/official',
    changeFrequency: 'daily',
    priority: 0.85,
  },
  {
    path: '/promotion/creators',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/about',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/blog',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/category/official_sticker?new=true',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  
  {
    path: '/category/creator_sticker',
    changeFrequency: 'daily',
    priority: 0.85,
  },
  {
    path: '/category/official_emoji',
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    path: '/category/creator_emoji',
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    path: '/category/official_theme',
    changeFrequency: 'daily',
    priority: 0.75,
  },
  {
    path: '/category/creator_theme',
    changeFrequency: 'daily',
    priority: 0.75,
  },
  {
    path: '/category/indo_50c',
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    path: '/category/indo_10c',
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    path: '/category/taiwan',
    changeFrequency: 'daily',
    priority: 0.8,
  },
];

const productTables = ['test_stickers', 'test_indo', 'test_taiwan'];

function absoluteUrl(path) {
  return `${SITE_URL}${path}`;
}

async function getProductsFromTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error(`[sitemap:${tableName}] ${error.message}`);
    return [];
  }

  return data || [];
}

async function getProductUrls() {
  const results = await Promise.all(
    productTables.map(tableName => getProductsFromTable(tableName))
  );

  const seenIds = new Set();
  const urls = [];

  results.flat().forEach(product => {
    if (!product?.id) return;
    if (seenIds.has(product.id)) return;

    seenIds.add(product.id);

    urls.push({
      url: absoluteUrl(`/product/${product.id}`),
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return urls;
}

async function getBlogUrls() {
  const { data, error } = await supabase
    .from('posts')
    .select('slug, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`[sitemap:posts] ${error.message}`);
    return [];
  }

  return (data || [])
    .filter(post => post.slug)
    .map(post => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.created_at ? new Date(post.created_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.65,
    }));
}

export default async function sitemap() {
  const now = new Date();

  const staticUrls = staticRoutes.map(route => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productUrls = await getProductUrls();
  const blogUrls = await getBlogUrls();

  return [...staticUrls, ...productUrls, ...blogUrls];
}
