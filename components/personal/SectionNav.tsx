"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Front.module.css";

const sections = [
  { href: "/work", label: "Work" },
  { href: "/notes", label: "Writing" },
];

// The two main destinations; the current section is underlined.
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
