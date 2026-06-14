import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/components/BlogSection";
import styles from "./HomeEditorialSections.module.css";

interface HomeEditorialSectionsProps {
  posts: BlogPost[];
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export default function HomeEditorialSections({
  posts,
}: HomeEditorialSectionsProps) {
  return (
    <>
      <section className={styles.studiesSection}>
        <div className={styles.studiesVisuals}>
          <figure className={styles.studyPrimary}>
            <Image
              src="/images/home/berlin-study.jpg"
              alt="Architectural light and shadow from the Berlin Reset visual study"
              fill
              sizes="(max-width: 760px) 92vw, 58vw"
            />
          </figure>
          <figure className={styles.studySecondary}>
            <Image
              src="/images/home/urban-study.jpg"
              alt="Abstract movement and warm light from a visual motion study"
              fill
              sizes="(max-width: 760px) 58vw, 28vw"
            />
          </figure>
        </div>

        <div className={styles.studiesCopy}>
          <h2>Visual studies sharpen the interface.</h2>
          <p>
            Photography and spatial research inform how hierarchy, rhythm, and
            atmosphere become usable product decisions.
          </p>
          <Link href="/gallery" className={styles.textLink}>
            Explore Studies
          </Link>
        </div>
      </section>

      <section className={styles.writingSection}>
        <div className={styles.writingIntro}>
          <h2>Writing through systems and experience.</h2>
          <p>
            Essays connect technical work with the human questions behind it.
          </p>
          <Link href="/blog" className={styles.textLink}>
            Read Essays
          </Link>
        </div>

        <div className={styles.postList}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/en/${post.slug}`}
              className={styles.postRow}
            >
              <div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <div className={styles.postMeta}>
                <span>{post.category}</span>
                <span>{formatDate(post.publishedDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutStatement}>
          <h2>KUMMA brings systems, interfaces, and visual thinking together.</h2>
          <p>
            I work across AI architecture, product engineering, and interface
            design. The goal is consistent: make complex systems legible,
            reliable, and useful.
          </p>
        </div>

        <div className={styles.principles}>
          <article>
            <h3>Clarity before spectacle</h3>
            <p>
              Motion and visual systems must explain hierarchy, state, or
              behavior.
            </p>
          </article>
          <article>
            <h3>Reliability is product design</h3>
            <p>
              Failure handling, observability, and human control shape trust as
              much as the interface.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
