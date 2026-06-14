"use client";

import React, { forwardRef, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/blog.module.css";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  publishedDate: string;
  readingTime?: number;
  featured?: boolean;
}

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  const trimmed = highlight.trim();
  if (!trimmed) {
    return <span>{text}</span>;
  }

  const safePattern = escapeRegExp(trimmed);
  const regex = new RegExp(`(${safePattern})`, "gi");
  const parts = text.split(regex);
  const normalizedHighlight = trimmed.toLowerCase();

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === normalizedHighlight ? (
          <mark key={`${part}-${i}`} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${part}-${i}`}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

interface BlogSectionProps {
  posts: BlogPost[];
  locale?: string;
}

const BlogSection = forwardRef<HTMLDivElement, BlogSectionProps>(
  ({ posts, locale = "en" }, ref) => {
    const allCategoryLabel = locale === "zh" ? "全部" : "All";
    const [selectedCategory, setSelectedCategory] = useState<string>(allCategoryLabel);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
      setSelectedCategory(allCategoryLabel);
    }, [allCategoryLabel]);

    const categories = useMemo(() => {
      return [allCategoryLabel, ...new Set(posts.map((post) => post.category))];
    }, [posts, allCategoryLabel]);

    const filteredPosts = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();

      return posts.filter((post) => {
        const categoryMatches =
          selectedCategory === allCategoryLabel || post.category === selectedCategory;

        if (!categoryMatches) return false;
        if (!query) return true;

        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }, [posts, selectedCategory, searchQuery, allCategoryLabel]);

    const dateLocale = locale === "zh" ? "zh-CN" : "en-US";

    return (
      <section className={styles.blogSection} ref={ref}>
        <div className={styles.blogWrapper}>
          <header className={styles.blogHeader}>
            <p className={`${styles.blogEyebrow} ${spaceGrotesk.className}`}>
              Essays / Journal
            </p>
            <h1 className={`${styles.blogTitle} ${cormorant.className}`}>
              Between Logic And Light
            </h1>
            <p className={`${styles.blogIntro} ${spaceGrotesk.className}`}>
              Writing to understand what it means to make, feel, and be.
              Fragments on craft, systems, and the philosophy behind digital work.
            </p>
          </header>

          <div className={styles.controlsWrapper}>
            <div className={styles.searchBar}>
              <label htmlFor="blog-search" className={styles.searchLabel}>
                Search
              </label>
              <input
                id="blog-search"
                type="text"
                placeholder={locale === "zh" ? "搜索文章..." : "Search essays..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${styles.searchInput} ${spaceGrotesk.className}`}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className={`${styles.clearButton} ${spaceGrotesk.className}`}
                  onClick={() => setSearchQuery("")}
                >
                  {locale === "zh" ? "清除" : "Clear"}
                </button>
              ) : null}
            </div>

            <div className={styles.categoryFilters}>
              {categories.map((category) => {
                const isActive = category === selectedCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    className={`${styles.filterButton} ${
                      isActive ? styles.active : ""
                    } ${spaceGrotesk.className}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <p className={`${styles.resultsMeta} ${spaceGrotesk.className}`}>
            {filteredPosts.length} {locale === "zh" ? "篇文章" : "essays"}
          </p>

          <div className={styles.articlesList}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => {
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${locale}/${post.slug}`}
                    className={styles.articleEntry}
                  >
                    <div className={styles.articleMain}>
                      <h2 className={`${styles.articleTitle} ${cormorant.className}`}>
                        <Highlight text={post.title} highlight={searchQuery} />
                      </h2>
                      <p className={`${styles.articleExcerpt} ${spaceGrotesk.className}`}>
                        <Highlight text={post.excerpt} highlight={searchQuery} />
                      </p>
                      <div className={styles.articleTags}>
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={`${styles.tag} ${spaceGrotesk.className}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`${styles.articleAside} ${spaceGrotesk.className}`}>
                      <span className={styles.articleCategory}>{post.category}</span>
                      <span className={styles.articleDate}>
                        {new Date(post.publishedDate).toLocaleDateString(dateLocale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className={styles.articleReadingTime}>
                        {(post.readingTime ?? 5).toString()} {locale === "zh" ? "分钟阅读" : "min read"}
                      </span>
                      <span className={styles.articleArrow} aria-hidden="true">
                        -&gt;
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className={styles.noResults}>
                <p className={`${styles.noResultsText} ${spaceGrotesk.className}`}>
                  {locale === "zh"
                    ? "没有找到符合筛选条件的文章。"
                    : "No essays matched your current filters."}
                </p>
                <button
                  type="button"
                  className={`${styles.resetButton} ${spaceGrotesk.className}`}
                  onClick={() => {
                    setSelectedCategory(allCategoryLabel);
                    setSearchQuery("");
                  }}
                >
                  {locale === "zh" ? "重置筛选" : "Reset Filters"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

BlogSection.displayName = "BlogSection";

export default BlogSection;
