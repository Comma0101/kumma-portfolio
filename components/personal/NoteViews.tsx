import Link from "next/link";
import Shell from "./Shell";
import { label, noteDate, type Lang, type Note } from "./notes";
import { scClass } from "./typeSC";
import HtmlLang from "./HtmlLang";
import { texts } from "./texts";
import front from "./Front.module.css";
import styles from "./Pages.module.css";

const href = (slug: string, lang: Lang) => (lang === "zh" ? `/notes/${slug}/zh` : `/notes/${slug}`);

// The pen sets down under a title once, as it does under the name.
function Horizon() {
  return (
    <svg className={`${front.workHorizon} ${styles.drawn}`} viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength={1} d="M2 7 C 220 5.6, 460 8.2, 700 6.4 S 930 5.4, 998 6" />
    </svg>
  );
}

export function NotesIndex({ notes }: { notes: Note[] }) {
  return (
    <Shell className={scClass}>
      <h1 className={front.workTitle}>Study.</h1>
      <Horizon />
      <p className={front.workLede}>What the reading leaves. Written slowly, for myself first.</p>

      {/* The texts the homepage names, each in its own script and
          direction, each with its own mark: side by side, not joined. */}
      <section className={styles.texts} aria-labelledby="texts">
        <h2 id="texts" className={front.label}>
          Five texts
        </h2>
        <p className={styles.textsLede}>
          “I want to preserve the differences between traditions rather than force them into one universal
          philosophy.”
        </p>
        <ol className={styles.textList}>
          {texts.map((text) => (
            <li key={text.id} className={styles.text} data-vertical={text.vertical ? "" : undefined}>
              <p className={styles.textOriginal} lang={text.lang}>
                {text.original}
              </p>
              <div className={styles.textGloss}>
                <p className={styles.textSource}>
                  <span>{text.tradition}</span> {text.source}
                </p>
                {text.translation && <p className={styles.textTranslation}>{text.translation}</p>}
                <p className={styles.textNote}>{text.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.textsAfter}>
          The Chinese is given as it was written, in columns; the English beside it is a plain rendering for this page.
        </p>
      </section>

      <h2 className={`${front.label} ${styles.essaysHead}`}>Essays</h2>
      <ol className={front.workList}>
        {notes.map((note, index) => (
          <li key={note.slug}>
            <Link href={href(note.slug, "en")} className={`${front.workItem} ${styles.noteItem}`}>
              <span className={front.index}>0{index + 1}</span>
              <span className={`${front.workName} ${styles.noteName}`}>{note.title}</span>
              <span className={front.workLine}>{note.excerpt}</span>
              <span className={front.workKind}>
                {noteDate(note.date)}
                {note.zh && (
                  <>
                    {" · EN / "}
                    <span className={styles.sc} lang="zh-Hans">{label.zh}</span>
                  </>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

export function NoteView({ note, lang, next }: { note: Note; lang: Lang; next?: Note }) {
  const zh = lang === "zh";
  return (
    <Shell lang={zh ? "zh-Hans" : "en"} className={`${scClass} ${zh ? styles.zh : ""}`}>
      {zh && <HtmlLang lang="zh-Hans" />}
      <article className={styles.note}>
        <p className={front.label}>
          <Link href="/notes">{zh ? label.notes : "Notes"}</Link>
          <span aria-hidden="true"> · </span>
          <time dateTime={note.date}>{noteDate(note.date, lang)}</time>
        </p>
        <h1 className={styles.noteTitle}>{note.title}</h1>
        <Horizon />
        {note.excerpt && <p className={styles.noteLede}>{note.excerpt}</p>}
        <div className={styles.noteBody} dangerouslySetInnerHTML={{ __html: note.html }} />

        <nav className={styles.noteNav} aria-label="More notes">
          {note.zh && (
            <Link href={href(note.slug, zh ? "en" : "zh")} hrefLang={zh ? "en" : "zh-Hans"} lang={zh ? "en" : "zh-Hans"}>
              {zh ? "Read in English" : <span className={styles.sc}>{label.edition}</span>}
            </Link>
          )}
          {next && (
            <Link href={href(next.slug, "en")} lang="en">
              Next: {next.title} →
            </Link>
          )}
          <Link href="/notes" lang="en">
            All notes
          </Link>
        </nav>
      </article>
    </Shell>
  );
}
