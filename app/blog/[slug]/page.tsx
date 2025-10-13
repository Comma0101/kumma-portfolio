import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import styles from "@/styles/blogDetail.module.css";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";

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
