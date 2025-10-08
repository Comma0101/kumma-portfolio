"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  blogPosts,
  categories,
  getPostsByCategory,
  searchPosts,
  type BlogPost,
} from "@/data/blogPosts";
import styles from "@/styles/blog.module.css";

gsap.registerPlugin(ScrollTrigger);

const BlogSection = forwardRef<HTMLDivElement>((props, ref) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Handle filtering
  useEffect(() => {
    let posts = blogPosts;

    // Apply category filter
    if (selectedCategory !== "All") {
      posts = getPostsByCategory(selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      posts = searchPosts(searchQuery);
    }

    setFilteredPosts(posts);
  }, [selectedCategory, searchQuery]);

  // GSAP Animations for new layout
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Entrance animation for title and subtitle
      gsap.from([titleRef.current, `.${styles.blogSubtitle}`], {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      });

      // Entrance for controls
      if (controlsRef.current) {
        gsap.from(controlsRef.current, {
          y: 30,
          opacity: 0,
          duration: 1,
          delay: 0.5,
          ease: "power3.out",
        });
      }

      // Staggered entrance for article entries
      if (listRef.current) {
        const articles = listRef.current.querySelectorAll(
          `.${styles.articleEntry}`
        );
        gsap.from(articles, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }
    },
    [filteredPosts]
  );

  return (
    <div className={styles.blogSection} ref={ref || sectionRef}>
      <div className={styles.blogWrapper}>
        {/* Section Title */}
        <div className={styles.blogTitle} ref={titleRef}>
          <span className={styles.titleLine1}>Insights</span>
          <span className={styles.titleLine2}>& Stories</span>
        </div>

        {/* Subtitle */}
        <p className={styles.blogSubtitle}>
          Exploring the intersection of code, design, and creativity.
        </p>

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
                href={`/blog/${post.slug}`}
                className={styles.articleEntry}
              >
                <div className={styles.articleContent}>
                  <h3 className={styles.articleTitle}>{post.title}</h3>
                  <p className={styles.articleExcerpt}>{post.excerpt}</p>
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
