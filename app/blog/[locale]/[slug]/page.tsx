import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import {
  getAllPostIdsForAllLocales,
  getPostData,
  getSortedPostsData,
  getAvailableLocalesForPost,
  type Locale,
} from "@/lib/posts";
import styles from "@/styles/blogDetail.module.css";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { JsonLd } from "@/components/seo/JsonLd";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export async function generateStaticParams() {
  const paths = getAllPostIdsForAllLocales();
  return paths.map((p) => ({
    locale: p.params.locale,
    slug: p.params.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  try {
    const post = await getPostData(params.slug, params.locale as Locale);
    const title = `${post.title} | Kumma`;
    const og = `/og/blog-${params.slug}.png`;
    return {
      title: post.title,
      description: post.excerpt || "",
      alternates: {
        languages: Object.fromEntries([
          ...getAvailableLocalesForPost(params.slug).map(
            (l) => [l, `/blog/${l}/${params.slug}`] as const,
          ),
          ["x-default", `/blog/en/${params.slug}`],
        ]),
      },
      openGraph: {
        title,
        description: post.excerpt || "",
        type: "article",
        url: `https://kumma.me/blog/${params.locale}/${params.slug}`,
        images: [og],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: post.excerpt || "",
        images: [og],
      },
    };
  } catch {
    return {
      title: "Article Not Found",
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = params.locale as Locale;

  try {
    const post = await getPostData(params.slug, locale);
    const allPosts = getSortedPostsData(locale);
    const availableLocales = getAvailableLocalesForPost(params.slug);

    const relatedPosts = allPosts
      .filter((p) => p.category === post.category && p.id !== post.id)
      .slice(0, 3);

    return (
      <div className={styles.blogDetailPage}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedDate,
            inLanguage: locale,
            author: { "@type": "Person", name: "Kumma" },
            url: `https://kumma.me/blog/${locale}/${params.slug}`,
          }}
        />
        <header className={styles.articleHeader}>
          <div className={styles.articleTopBar}>
            <Link
              href="/blog"
              className={`${styles.backButton} ${spaceGrotesk.className}`}
            >
              <span aria-hidden="true">←</span>
              {locale === "zh" ? "返回所有文章" : "Back to all articles"}
            </Link>
            <div className={styles.switcherWrap}>
              <LanguageSwitcher
                currentLocale={locale}
                availableLocales={availableLocales}
                slug={params.slug}
              />
            </div>
          </div>

          <div className={`${styles.categoryBadge} ${spaceGrotesk.className}`}>
            {post.category}
          </div>
          <h1 className={`${styles.articleTitle} ${cormorant.className}`}>
            {post.title}
          </h1>
          <p className={`${styles.articleExcerpt} ${spaceGrotesk.className}`}>
            {post.excerpt}
          </p>

          <div className={`${styles.articleMeta} ${spaceGrotesk.className}`}>
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>Author</span>
              <span className={styles.authorName}>{post.author.name}</span>
            </div>
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>Published</span>
              <span>
                {new Date(post.publishedDate).toLocaleDateString(
                  locale === "zh" ? "zh-CN" : "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>Reading</span>
              <span>
                {post.readingTime ?? 5} {locale === "zh" ? "分钟阅读" : "min read"}
              </span>
            </div>
          </div>

          <div className={styles.tagsList}>
            {post.tags.map((tag: string) => (
              <span key={tag} className={`${styles.tag} ${spaceGrotesk.className}`}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className={styles.articleWrapper}>
          <article
            className={`${styles.contentBody} ${spaceGrotesk.className}`}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>

        <footer className={styles.articleFooter}>
          <div className={styles.shareSection}>
            <h3 className={`${styles.shareTitle} ${spaceGrotesk.className}`}>
              {locale === "zh" ? "分享文章" : "Share Article"}
            </h3>
            <div className={styles.shareButtons}>
              <a
                className={styles.shareButton}
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  `https://kumma.me/blog/${locale}/${params.slug}`,
                )}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
              >
                <FaXTwitter />
              </a>
              <a
                className={styles.shareButton}
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `https://kumma.me/blog/${locale}/${params.slug}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className={styles.authorBio}>
            <div className={styles.authorAvatar}>K</div>
            <div className={styles.authorInfo}>
              <h3 className={`${styles.authorBioName} ${cormorant.className}`}>
                {post.author.name}
              </h3>
              <p className={`${styles.authorBioText} ${spaceGrotesk.className}`}>
                {locale === "zh"
                  ? "创意程序员与数字设计师，持续探索代码、叙事与体验之间的关系。"
                  : "Creative coder and digital designer exploring the relationship between code, narrative, and experience."}
              </p>
            </div>
          </div>
        </footer>

        {relatedPosts.length > 0 && (
          <section className={styles.readNextSection}>
            <div className={styles.readNextHeader}>
              <h2 className={`${styles.readNextTitle} ${cormorant.className}`}>
                <span className={styles.readNextAccent}>
                  {locale === "zh" ? "继续阅读" : "Read Next"}
                </span>
              </h2>
              <p className={`${styles.readNextSubtitle} ${spaceGrotesk.className}`}>
                {locale === "zh"
                  ? `探索更多与 ${post.category.toLowerCase()} 相关的思考`
                  : `Explore related essays where ${post.category.toLowerCase()} meets exploration`}
              </p>
            </div>

            <div className={styles.readNextGrid}>
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${locale}/${relatedPost.slug}`}
                  className={styles.readNextCard}
                >
                  <div className={`${styles.readNextCardHeader} ${spaceGrotesk.className}`}>
                    <span className={styles.readNextCategory}>{relatedPost.category}</span>
                    <span className={styles.readNextTime}>
                      {relatedPost.readingTime ?? 5} {locale === "zh" ? "分钟" : "min"}
                    </span>
                  </div>
                  <h3 className={`${styles.readNextCardTitle} ${cormorant.className}`}>
                    {relatedPost.title}
                  </h3>
                  <p className={`${styles.readNextExcerpt} ${spaceGrotesk.className}`}>
                    {relatedPost.excerpt}
                  </p>
                  <div className={styles.readNextArrow} aria-hidden="true">
                    -&gt;
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading post:", error);
    notFound();
  }
}
