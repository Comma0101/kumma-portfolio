import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), '_posts');

import { BlogPost } from '@/components/BlogSection';

export type Locale = 'en' | 'zh';

// Get posts for a specific locale
export function getSortedPostsData(locale: Locale = 'en'): BlogPost[] {
  const localeDir = locale === 'en' ? postsDirectory : path.join(postsDirectory, locale);
  
  // Check if directory exists
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const fileNames = fs.readdirSync(localeDir).filter(name => name.endsWith('.md'));
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(localeDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Construct a post object that matches the BlogPost interface
    const postData: BlogPost = {
      id,
      slug: id,
      title: matterResult.data.title || 'Untitled',
      excerpt: matterResult.data.excerpt || '',
      category: matterResult.data.category || 'Uncategorized',
      tags: matterResult.data.tags || [],
      author: { name: matterResult.data.author || 'Anonymous' },
      publishedDate: matterResult.data.date || new Date().toISOString(),
      readingTime: matterResult.data.readingTime,
      featured: matterResult.data.featured || false,
    };

    return postData;
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.publishedDate < b.publishedDate) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds(locale: Locale = 'en') {
  const localeDir = locale === 'en' ? postsDirectory : path.join(postsDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const fileNames = fs.readdirSync(localeDir).filter(name => name.endsWith('.md'));

  return fileNames.map((fileName) => {
    return {
      params: {
        locale,
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

// Get all post IDs for all locales
export function getAllPostIdsForAllLocales() {
  const locales: Locale[] = ['en', 'zh'];
  const allIds: { params: { locale: Locale; slug: string } }[] = [];

  locales.forEach(locale => {
    const ids = getAllPostIds(locale);
    allIds.push(...ids);
  });

  return allIds;
}

export async function getPostData(
  slug: string, 
  locale: Locale = 'en'
): Promise<BlogPost & { contentHtml: string; locale: Locale }> {
  const localeDir = locale === 'en' ? postsDirectory : path.join(postsDirectory, locale);
  const fullPath = path.join(localeDir, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug} for locale ${locale}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id: slug,
    slug,
    contentHtml,
    locale,
    title: matterResult.data.title || 'Untitled',
    excerpt: matterResult.data.excerpt || '',
    category: matterResult.data.category || 'Uncategorized',
    tags: matterResult.data.tags || [],
    author: { name: matterResult.data.author || 'Anonymous' },
    publishedDate: matterResult.data.date || new Date().toISOString(),
    readingTime: matterResult.data.readingTime,
    featured: matterResult.data.featured || false,
  };
}

// Check if a post exists in a specific locale
export function postExistsInLocale(slug: string, locale: Locale): boolean {
  const localeDir = locale === 'en' ? postsDirectory : path.join(postsDirectory, locale);
  const fullPath = path.join(localeDir, `${slug}.md`);
  return fs.existsSync(fullPath);
}

// Get available locales for a specific post
export function getAvailableLocalesForPost(slug: string): Locale[] {
  const locales: Locale[] = ['en', 'zh'];
  return locales.filter(locale => postExistsInLocale(slug, locale));
}
