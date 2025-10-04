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
  const searchBarRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

  // GSAP Animations
  useGSAP(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;

    // Page entrance animations (run once on mount)
    const entranceTl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    // Title entrance
    if (titleRef.current) {
      entranceTl.from(titleRef.current.querySelectorAll(".title-line"), {
        y: 100,
        opacity: 0,
        rotation: -5,
        stagger: 0.15,
        duration: 1.2,
      });
    }

    // Search bar entrance
    if (searchBarRef.current) {
      entranceTl.from(searchBarRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
      }, "-=0.6");
    }

    // Filters entrance
    if (filtersRef.current) {
      entranceTl.from(filtersRef.current.querySelectorAll(".filter-btn"), {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
      }, "-=0.4");
    }

    // Featured card entrance
    if (featuredRef.current) {
      entranceTl.from(featuredRef.current, {
        y: 80,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
      }, "-=0.3");
    }

    // Blog cards - animate when scrolled into view
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".blog-card");
      cards.forEach((card, index) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
        });
      });
    }

    // Parallax effects only (removed conflicting scroll-triggered animations)
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      // Subtle parallax on featured card
      if (featuredRef.current) {
        gsap.to(featuredRef.current, {
          y: -30,
          scrollTrigger: {
            trigger: featuredRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      // Subtle parallax on cards
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".blog-card");
        cards.forEach((card, index) => {
          gsap.to(card, {
            y: -40 * (index % 2 === 0 ? 1 : 0.5),
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          });
        });
      }

      // Floating particles animation
      const particles = section.querySelectorAll(
        `.${styles.floatingParticle}`
      );
      particles.forEach((particle) => {
        gsap.to(particle, {
          y: -80,
          x: 40,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 3,
          },
        });
      });
    });

    return () => mm.revert();
  }, [filteredPosts]);

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);
  const displayFeatured = featuredPosts[0];

  return (
    <div className={styles.blogSection} ref={ref || sectionRef}>
      <div className={styles.blogWrapper}>
        {/* Section Title */}
        <div className={styles.blogTitle} ref={titleRef}>
          <span className={`${styles.titleLine1} title-line`}>INSIGHTS</span>
          <span className={`${styles.titleLine2} title-line`}>& STORIES</span>
        </div>

        {/* Subtitle */}
        <p className={styles.blogSubtitle}>
          Exploring the intersection of code, design, and creativity
        </p>

        {/* Search Bar */}
        <div className={styles.searchBarWrapper} ref={searchBarRef}>
          <div className={styles.searchBar}>
            <svg
              className={styles.searchIcon}
              width="20"
              height="20"
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

        {/* Category Filters */}
        <div className={styles.categoryFilters} ref={filtersRef}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${
                selectedCategory === category ? styles.active : ""
              } filter-btn`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {displayFeatured && (
          <div className={styles.featuredSection} ref={featuredRef}>
            <Link
              href={`/blog/${displayFeatured.slug}`}
              className={styles.featuredCard}
            >
              <div className={styles.featuredBadge}>✦ Featured</div>
              <div className={styles.featuredImagePlaceholder}>
                <div className={styles.featuredGradient} />
                <div className={styles.featuredCategory}>
                  {displayFeatured.category}
                </div>
              </div>
              <div className={styles.featuredContent}>
                <h2 className={styles.featuredTitle}>{displayFeatured.title}</h2>
                <p className={styles.featuredExcerpt}>
                  {displayFeatured.excerpt}
                </p>
                <div className={styles.featuredMeta}>
                  <span className={styles.metaItem}>
                    📖 {displayFeatured.readingTime} min read
                  </span>
                  <span className={styles.metaItem}>
                    📅 {new Date(displayFeatured.publishedDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </span>
                </div>
                <div className={styles.readMoreButton}>
                  Read Article
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Blog Cards Grid */}
        <div className={styles.blogGrid} ref={cardsRef}>
          {regularPosts.length > 0 ? (
            regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`${styles.blogCard} blog-card`}
              >
                <div className={styles.cardBadge}>{post.category}</div>
                <div className={styles.cardImagePlaceholder}>
                  <div className={styles.cardGradient} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.cardTags}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      📖 {post.readingTime} min
                    </span>
                    <span className={styles.metaItem}>
                      📅{" "}
                      {new Date(post.publishedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
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

        {/* Floating Decorative Elements */}
        <div className={`${styles.floatingParticle} ${styles.particle1}`} />
        <div className={`${styles.floatingParticle} ${styles.particle2}`} />
        <div className={`${styles.floatingParticle} ${styles.particle3}`} />
      </div>
    </div>
  );
});

BlogSection.displayName = "BlogSection";

export default BlogSection;
