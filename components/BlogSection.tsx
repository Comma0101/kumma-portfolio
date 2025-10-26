"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "@/styles/blog.module.css";

gsap.registerPlugin(ScrollTrigger);

// Define the BlogPost type, matching the structure from Markdown frontmatter
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string; // Content is optional on the listing page
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  publishedDate: string;
  readingTime?: number; // Make optional as it might not be in frontmatter
  featured?: boolean;
}

// Helper functions for filtering, now local to this component
const getPostsByCategory = (posts: BlogPost[], category: string): BlogPost[] => {
  if (category === "All") return posts;
  return posts.filter((post) => post.category === category);
};

const searchPosts = (query: string, posts: BlogPost[]): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Helper component to highlight search queries
const Highlight = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

interface BlogSectionProps {
  posts: BlogPost[];
  locale?: string; // Add locale prop, defaults to 'en'
}

const BlogSection = forwardRef<HTMLDivElement, BlogSectionProps>(({ posts, locale = 'en' }, ref) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Derive categories from the posts prop
  const categories = [...new Set(posts.map(post => post.category))];

  // Handle filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      let initialPosts = posts;

      // Apply category filter first
      if (selectedCategory !== "All") {
        initialPosts = getPostsByCategory(initialPosts, selectedCategory);
      }

      // Then, apply search filter on the result of the category filter
      if (searchQuery.trim() !== "") {
        initialPosts = searchPosts(searchQuery, initialPosts);
      }

      setFilteredPosts(initialPosts);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [selectedCategory, searchQuery, posts]);

  // GSAP Animations for new layout
  useGSAP(() => {
    if (!sectionRef.current) return;

    // Entrance animation for title and subtitle (only on initial mount)
    if (titleRef.current && !titleRef.current.dataset.animated) {
      gsap.from([titleRef.current, `.${styles.manifestoSection}`], {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      });
      titleRef.current.dataset.animated = "true";
    }

    // Entrance for controls (only on initial mount)
    if (controlsRef.current && !controlsRef.current.dataset.animated) {
      gsap.from(controlsRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });
      controlsRef.current.dataset.animated = "true";
    }

    // Animate articles with each filter change
    if (listRef.current) {
      const articles = listRef.current.querySelectorAll(
        `.${styles.articleEntry}`
      );
      
      // Reset and animate
      gsap.fromTo(articles, 
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "all", // Clear inline styles after animation
        }
      );
    }
  }, [filteredPosts]);

  return (
    <div className={styles.blogSection} ref={ref || sectionRef}>
      {/* Atmospheric Background */}
      <div className={styles.atmosphericBg}>
        <div className={styles.floatingParticle} style={{ '--delay': '0s', '--duration': '20s', '--x': '20%', '--y': '30%' } as React.CSSProperties}></div>
        <div className={styles.floatingParticle} style={{ '--delay': '2s', '--duration': '25s', '--x': '70%', '--y': '60%' } as React.CSSProperties}></div>
        <div className={styles.floatingParticle} style={{ '--delay': '4s', '--duration': '30s', '--x': '40%', '--y': '80%' } as React.CSSProperties}></div>
        <div className={styles.floatingParticle} style={{ '--delay': '6s', '--duration': '22s', '--x': '85%', '--y': '25%' } as React.CSSProperties}></div>
        <div className={styles.gradientMesh}></div>
      </div>

      <div className={styles.blogWrapper}>
        {/* Poetic Header */}
        <div className={styles.poeticHeader} ref={titleRef}>
          <span className={styles.poeticLine}>Between Logic </span>
          {/* <span className={styles.poeticDivider}>/</span> */}
          <span className={`${styles.poeticLine} ${styles.lightEmphasis}`}>
            And Light
          </span>
        </div>

        {/* Manifesto Section */}
        <div className={styles.manifestoSection}>
          <p className={styles.manifestoText}>
            Writing to understand what it means to make, feel, and be.
          </p>
        </div>

        {/* Search and Filters */}
        <div className={styles.controlsWrapper} ref={controlsRef}>
          <div className={styles.searchBarWrapper}>
            <div className={styles.searchBar}>
              <svg
                className={styles.searchIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.clearButton}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className={styles.categoryFilters}>
            <button
              className={`${styles.filterButton} ${
                selectedCategory === "All" ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.filterButton} ${
                  selectedCategory === category ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className={styles.articlesList} ref={listRef}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${locale}/${post.slug}`}
                className={styles.articleEntry}
              >
                <div className={styles.articleContent}>
                  <h3 className={styles.articleTitle}>
                    <Highlight text={post.title} highlight={searchQuery} />
                  </h3>
                  <p className={styles.articleExcerpt}>
                    <Highlight text={post.excerpt} highlight={searchQuery} />
                  </p>
                </div>
                <div className={styles.articleMeta}>
                  <span className={styles.articleCategory}>
                    {post.category}
                  </span>
                  <span className={styles.articleDate}>
                    {new Date(post.publishedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className={styles.articleReadingTime}>
                    {post.readingTime} min read
                  </span>
                </div>
                <div className={styles.articleTags}>
                  {post.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>
              <p className={styles.noResultsText}>
                No articles found matching your criteria.
              </p>
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BlogSection.displayName = "BlogSection";

export default BlogSection;
