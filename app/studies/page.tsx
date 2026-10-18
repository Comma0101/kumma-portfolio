import type { Metadata } from "next";
import Shell from "@/components/personal/Shell";
import Studies from "@/components/personal/Studies";
import MotionFlag from "@/components/personal/MotionFlag";
import { motionScript } from "@/components/personal/motion";
import front from "@/components/personal/Front.module.css";
import styles from "@/components/personal/Pages.module.css";

const description =
  "Kumma's drawing studies: bamboo in vermilion, an open circle, 道 stroke by stroke, a face as one spiral line. Every mark is drawn live, in order.";

export const metadata: Metadata = {
  title: "Studies",
  description,
  alternates: { canonical: "https://kumma.me/studies" },
  openGraph: { title: "Studies | Kumma", description, url: "https://kumma.me/studies", images: ["/og/portrait.png"] },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", images: ["/og/portrait.png"] },
};

// What "Draw." means, shown, and how to look at the rest of the site: no
// pictures, only marks made in order by one red pen.
export default function StudiesPage() {
  return (
    <Shell>
      <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      <MotionFlag />
      <h1 className={front.workTitle}>Studies.</h1>
      <svg className={`${front.workHorizon} ${styles.drawn}`} viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M2 7 C 220 5.6, 460 8.2, 700 6.4 S 930 5.4, 998 6" />
      </svg>
      <p className={front.workLede}>Bamboo, geometry, negative space.</p>
      <div className={styles.statement}>
        <p>
          Nothing on this site is a picture. Every mark is drawn while you watch, by one red pen in one take: a
          ballpoint for the line down the margin, a brush for the circle and the bamboo, the face as a single
          spiral.
        </p>
        <p>
          The order is the point. A mark made once, stroke after stroke, by a hand that cannot erase: what is left
          on the paper is the record of how it was made. Below are the studies the pages are drawn from.
        </p>
      </div>
      <Studies />
    </Shell>
  );
}
