"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Keeps body[data-theme] in sync with the route: paper only on the homepage. */
export default function BodyTheme() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/") {
      document.body.setAttribute("data-theme", "paper");
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [pathname]);
  return null;
}
