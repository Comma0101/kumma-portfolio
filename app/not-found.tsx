import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/personal/Shell";
import front from "@/components/personal/Front.module.css";

export const metadata: Metadata = { title: "Not found", robots: { index: false } };

// Paper with nothing drawn on it yet.
export default function NotFound() {
  return (
    <Shell>
      <h1 className={front.workTitle}>Nothing here.</h1>
      <p className={front.workLede}>
        The page you followed isn’t on this paper. <Link href="/">Start from the beginning</Link>, or read the{" "}
        <Link href="/notes">notes</Link>.
      </p>
    </Shell>
  );
}
