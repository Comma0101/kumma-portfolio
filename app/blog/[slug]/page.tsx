import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import styles from "@/styles/blogDetail.module.css";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${post.title} | KUMMA Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className={styles.blogDetailPage}>
      {/* Article Header */}
      <header className={styles.articleHeader}>
        <Link href="/blog" className={styles.backButton}>
          <span>←</span> Back to all articles
        </Link>
        <div className={styles.categoryBadge}>{post.category}</div>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <p className={styles.articleExcerpt}>{post.excerpt}</p>
        <div className={styles.articleMeta}>
          <div className={styles.metaGroup}>
            <span className={styles.authorName}>{post.author.name}</span>
          </div>
          <span>•</span>
          <span>
            {new Date(post.publishedDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span>{post.readingTime} min read</span>
        </div>
        <div className={styles.tagsList}>
          {post.tags.map((tag) => (
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
          dangerouslySetInnerHTML={{
            __html: post.content
              .split("\n")
              .map((line) => {
                if (line.startsWith("## ")) {
                  return `<h2>${line.substring(3)}</h2>`;
                }
                if (line.startsWith("# ")) {
                  return `<h1>${line.substring(2)}</h1>`;
                }
                line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                if (line.startsWith("- ")) {
                  return `<li>${line.substring(2)}</li>`;
                }
                if (line.trim() && !line.startsWith("<")) {
                  return `<p>${line}</p>`;
                }
                return line;
              })
              .join(""),
          }}
        />
      </div>

      {/* Article Footer */}
      <footer className={styles.articleFooter}>
        <div className={styles.shareSection}>
          <h3 className={styles.shareTitle}>Share Article</h3>
          <div className={styles.shareButtons}>
            <button className={styles.shareButton} aria-label="Share on Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button className={styles.shareButton} aria-label="Share on LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.authorBio}>
          <div className={styles.authorAvatar}>👨‍💻</div>
          <div className={styles.authorInfo}>
            <h3 className={styles.authorBioName}>{post.author.name}</h3>
            <p className={styles.authorBioText}>
              Creative coder and digital artist exploring the intersection of
              code, design, and innovation.
            </p>
          </div>
        </div>
      </footer>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Continue Reading</h2>
          <div className={styles.relatedGrid}>
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className={styles.relatedCard}
              >
                <span className={styles.relatedCategory}>
                  {relatedPost.category}
                </span>
                <h3 className={styles.relatedCardTitle}>
                  {relatedPost.title}
                </h3>
                <p className={styles.relatedExcerpt}>
                  {relatedPost.excerpt}
                </p>
                <div className={styles.relatedMeta}>
                  <span>{relatedPost.readingTime} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
