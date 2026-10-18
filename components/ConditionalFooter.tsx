"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { isPaperRoute } from "@/components/personal/routes";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const p = pathname?.replace(/\/+$/, "") || "/";
  const hideFooter = isPaperRoute(p) || p === "/stories" || p === "/build";
  const isBlog = pathname?.startsWith("/blog");

  if (hideFooter) {
    return null;
  }

  return <Footer variant={isBlog ? "blog" : "default"} />;
}
