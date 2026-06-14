"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter = pathname === "/stories";
  const isBlog = pathname?.startsWith("/blog");

  if (hideFooter) {
    return null;
  }

  return <Footer variant={isBlog ? "blog" : "default"} />;
}
