"use client";
import React, { useState, useEffect, forwardRef } from "react";
import styles from "../styles/blog.module.css";

interface Post {
  id: number;
  title: string;
  excerpt: string;
}

const Blog = forwardRef<HTMLDivElement>((props, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from a CMS or API
    const fetchedPosts: Post[] = [
      {
        id: 1,
        title: "The Art of Generative Design",
        excerpt: "Exploring the intersection of code and creativity to produce unique visual art.",
      },
      {
        id: 2,
        title: "Building Interactive Web Experiences with GSAP",
        excerpt: "A deep dive into the GreenSock Animation Platform for creating high-performance animations.",
      },
      {
        id: 3,
        title: "The Future of UI/UX: 3D on the Web",
        excerpt: "How technologies like WebGL and Three.js are revolutionizing user interfaces.",
      },
    ];
    setPosts(fetchedPosts);
  }, []);

  return (
    <div className={styles.blogContainer} ref={ref}>
      {posts.map((post) => (
        <div key={post.id} className={`${styles.post} post`}>
          <h3 className={styles.postTitle}>{post.title}</h3>
          <p className={styles.postExcerpt}>{post.excerpt}</p>
          <a href="#" className={styles.readMore}>
            Read More
          </a>
        </div>
      ))}
    </div>
  );
});

Blog.displayName = "Blog";

export default Blog;
