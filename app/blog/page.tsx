import React from "react";
import BlogSection from "../../components/BlogSection";
import { getSortedPostsData } from "@/lib/posts";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Field Notes | Kumma",
  },
  description: "Technical notes from systems that turn messy inputs into reliable action.",
  openGraph: {
    title: "Field Notes | Kumma",
    description: "Technical notes from systems that turn messy inputs into reliable action.",
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
    title: "Field Notes | Kumma",
    description: "Technical notes from systems that turn messy inputs into reliable action.",
    creator: "@kumma",
    images: ["https://kumma.me/twitter-blog-image.png"],
  },
};

export default function BlogPage() {
  const allPosts = getSortedPostsData('en'); // Default to English
  return <BlogSection posts={allPosts} locale="en" />;
}
