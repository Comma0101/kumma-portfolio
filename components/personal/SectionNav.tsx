"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Front.module.css";

const sections = [
  { href: "/work", label: "Build" },
  { href: "/notes", label: "Study" },
  { href: "/studies", label: "Draw" },
];

// The three rooms off the homepage, named for the practices they hold;
// the one you are in is underlined.
export default function SectionNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className={styles.sectionNav} aria-label="Sections">
      {sections.map((section) => {
        const here = pathname === section.href || pathname.startsWith(`${section.href}/`);
        return (
          <Link key={section.href} href={section.href} aria-current={here ? "page" : undefined}>
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
