"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import BackToTopCube from "./BackToTopCube";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter = pathname === "/stories";
  const isBlog = pathname?.startsWith("/blog");
  const showBackToTopCube = pathname === "/";

  if (hideFooter) {
    return null;
  }

  return (
    <>
      <Footer variant={isBlog ? "blog" : "default"} />
      {showBackToTopCube ? <BackToTopCube /> : null}
    </>
  );
}
