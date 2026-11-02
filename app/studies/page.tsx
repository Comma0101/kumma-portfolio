import type { Metadata } from "next";
import Shell from "@/components/personal/Shell";
import Studies from "@/components/personal/Studies";
import MotionFlag from "@/components/personal/MotionFlag";
import { motionScript } from "@/components/personal/motion";
import front from "@/components/personal/Front.module.css";
import styles from "@/components/personal/Pages.module.css";

const description =
  "Browser-rendered artwork from kumma.me: bamboo in vermilion, an open circle, 道 in stroke order, and a face traced as one spiral.";

export const metadata: Metadata = {
  title: "Visual studies",
  description,
  alternates: { canonical: "https://kumma.me/studies" },
  openGraph: { title: "Visual studies | Kumma", description, url: "https://kumma.me/studies", images: ["/og/portrait.png"] },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", title: "Visual studies | Kumma", description, images: ["/og/portrait.png"] },
};

// The website's visual craft: marks rendered in sequence in the browser.
export default function StudiesPage() {
  return (
    <Shell>
      <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      <MotionFlag />
      <h1 className={front.workTitle}>Visual studies.</h1>
      <svg className={`${front.workHorizon} ${styles.drawn}`} viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M2 7 C 220 5.6, 460 8.2, 700 6.4 S 930 5.4, 998 6" />
      </svg>
      <p className={front.workLede}>Artwork made for this site, rendered in the browser.</p>
      <div className={styles.statement}>
        <p>
          These visual studies are part of the website’s design: a ballpoint line down the margin, a brush-like
          circle and bamboo, and a face traced as one spiral.
        </p>
        <p>
          Each mark appears in sequence. The linework records its own construction, from the first stroke to
          the last. These are the studies the pages are drawn from.
        </p>
      </div>
      <Studies />
    </Shell>
  );
}
