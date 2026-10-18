"use client";

import { useEffect } from "react";

// The root layout is English; a page in another language says so on <html>
// while it is open, and gives it back when the reader leaves.
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const before = root.lang;
    root.lang = lang;
    return () => {
      root.lang = before;
    };
  }, [lang]);
  return null;
}
