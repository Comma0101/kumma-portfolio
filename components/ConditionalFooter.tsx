"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import BackToTopCube from "./BackToTopCube";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter = pathname === "/stories";

  if (hideFooter) {
    return null;
  }

  return (
    <>
      <Footer />
      <BackToTopCube />
    </>
  );
}
