import React from "react";
import BlogSection from "../../components/BlogSection";
import { getSortedPostsData } from "@/lib/posts";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Between Logic and Light — Essays by KUMMA",
  description: "Writing to understand what it means to make, feel, and be.",
  openGraph: {
    title: "Between Logic and Light — Essays by KUMMA",
    description: "Writing to understand what it means to make, feel, and be.",
    url: "https://kumma.me/blog",
    siteName: "KUMMA",
    images: [
      {
        url: "https://kumma.co/og-blog-image.png", // Update with your actual OG image URL for the blog
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Between Logic and Light — Essays by KUMMA",
    description: "Writing to understand what it means to make, feel, and be.",
    creator: "@yourtwitterhandle", // Update with your Twitter handle
    images: ["https://kumma.co/twitter-blog-image.png"], // Update with your actual Twitter image URL for the blog
  },
};

export default function BlogPage() {
  const allPosts = getSortedPostsData('en'); // Default to English
  return <BlogSection posts={allPosts} locale="en" />;
}
