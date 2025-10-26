import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPostIdsForAllLocales, getPostData, getSortedPostsData, getAvailableLocalesForPost, type Locale } from "@/lib/posts";
import styles from "@/styles/blogDetail.module.css";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export async function generateStaticParams() {
  const paths = getAllPostIdsForAllLocales();
  return paths.map(p => ({ 
    locale: p.params.locale, 
    slug: p.params.slug 
  }));
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  try {
    const post = await getPostData(params.slug, params.locale as Locale);
    return {
      title: `${post.title} | KUMMA Blog`,
      description: post.excerpt || '',
    };
  } catch {
    return {
      title: "Article Not Found",
    };
  }
}

export default async function BlogDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = params.locale as Locale;
  
  try {
    const post = await getPostData(params.slug, locale);
    const allPosts = getSortedPostsData(locale);
    const availableLocales = getAvailableLocalesForPost(params.slug);

    // Get related posts (same category, excluding current post)
    const relatedPosts = allPosts
      .filter((p) => p.category === post.category && p.id !== post.id)
      .slice(0, 3);

    return (
      <div className={styles.blogDetailPage}>
        {/* Article Header */}
        <header className={styles.articleHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <Link href="/blog" className={styles.backButton}>
              <span>←</span> {locale === 'zh' ? '返回所有文章' : 'Back to all articles'}
            </Link>
            <LanguageSwitcher 
              currentLocale={locale}
              availableLocales={availableLocales}
              slug={params.slug}
            />
          </div>
          <div className={styles.categoryBadge}>{post.category}</div>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <p className={styles.articleExcerpt}>{post.excerpt}</p>
          <div className={styles.articleMeta}>
            <div className={styles.metaGroup}>
              <span className={styles.authorName}>{post.author.name}</span>
            </div>
            <span>•</span>
            <span>
              {new Date(post.publishedDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span>{post.readingTime} {locale === 'zh' ? '分钟阅读' : 'min read'}</span>
          </div>
          <div className={styles.tagsList}>
            {post.tags.map((tag: string) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <div className={styles.articleWrapper}>
          <article
            className={styles.contentBody}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>

        {/* Article Footer */}
        <footer className={styles.articleFooter}>
          <div className={styles.shareSection}>
            <h3 className={styles.shareTitle}>
              {locale === 'zh' ? '分享文章' : 'Share Article'}
            </h3>
            <div className={styles.shareButtons}>
              <button className={styles.shareButton} aria-label="Share on X">
                <FaXTwitter />
              </button>
              <button className={styles.shareButton} aria-label="Share on LinkedIn">
                <FaLinkedin />
              </button>
            </div>
          </div>
          <div className={styles.authorBio}>
            <div className={styles.authorAvatar}>👨‍💻</div>
            <div className={styles.authorInfo}>
              <h3 className={styles.authorBioName}>{post.author.name}</h3>
              <p className={styles.authorBioText}>
                {locale === 'zh' 
                  ? '创意程序员和数字艺术家，探索代码、设计和创新的交叉点。'
                  : 'Creative coder and digital artist exploring the intersection of code, design, and innovation.'
                }
              </p>
            </div>
          </div>
        </footer>

        {/* Read Next - Narrative Continuity */}
        {relatedPosts.length > 0 && (
          <section className={styles.readNextSection}>
            <div className={styles.readNextHeader}>
              <h2 className={styles.readNextTitle}>
                <span className={styles.readNextAccent}>
                  {locale === 'zh' ? '继续阅读' : 'Read Next'}
                </span>
              </h2>
              <p className={styles.readNextSubtitle}>
                {locale === 'zh' 
                  ? `探索更多关于${post.category.toLowerCase()}的相关思考`
                  : `Explore related thoughts where ${post.category.toLowerCase()} meets exploration`
                }
              </p>
            </div>
            <div className={styles.readNextGrid}>
              {relatedPosts.map((relatedPost, index) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${locale}/${relatedPost.slug}`}
                  className={styles.readNextCard}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  <div className={styles.readNextCardHeader}>
                    <span className={styles.readNextCategory}>
                      {relatedPost.category}
                    </span>
                    <span className={styles.readNextTime}>
                      {relatedPost.readingTime} {locale === 'zh' ? '分钟' : 'min'}
                    </span>
                  </div>
                  <h3 className={styles.readNextCardTitle}>
                    {relatedPost.title}
                  </h3>
                  <p className={styles.readNextExcerpt}>
                    {relatedPost.excerpt}
                  </p>
                  <div className={styles.readNextArrow}>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}
