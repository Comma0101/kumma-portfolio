import React from "react";
import BlogSection from "../../components/BlogSection";
import { getSortedPostsData } from "@/lib/posts";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Between Logic and Light: Essays by KUMMA",
  description: "Writing to understand what it means to make, feel, and be.",
  openGraph: {
    title: "Between Logic and Light: Essays by KUMMA",
    description: "Writing to understand what it means to make, feel, and be.",
    url: "https://kumma.me/blog",
    siteName: "KUMMA",
    images: [
      {
        url: "https://kumma.me/og-blog-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Between Logic and Light: Essays by KUMMA",
    description: "Writing to understand what it means to make, feel, and be.",
    creator: "@kumma",
    images: ["https://kumma.me/twitter-blog-image.png"],
  },
};

export default function BlogPage() {
  const allPosts = getSortedPostsData('en'); // Default to English
  return <BlogSection posts={allPosts} locale="en" />;
}
