import Link from "next/link";
import Shell from "./Shell";
import { label, noteDate, type Lang, type Note } from "./notes";
import { scClass } from "./typeSC";
import HtmlLang from "./HtmlLang";
import { texts } from "./texts";
import front from "./Front.module.css";
import styles from "./Pages.module.css";
import writing from "./WritingIndex.module.css";

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
    <Shell className={scClass} mainClassName={writing.index}>
      <header className={writing.heading}>
        <h1>Writing.</h1>
        <Horizon />
        <p className={writing.lede}>Essays on emotion, faith and awareness, and Camus.</p>
      </header>

      <ol className={writing.entries} aria-label="Essays" role="list">
        {notes.map((note) => (
          <li key={note.slug} className={writing.entry}>
            <article aria-labelledby={`writing-${note.slug}`}>
              <h2 id={`writing-${note.slug}`}>
                <Link href={href(note.slug, "en")} hrefLang="en" lang="en">
                  {note.title}
                </Link>
              </h2>
              <div className={writing.entryMeta}>
                <time dateTime={note.date}>{noteDate(note.date)}</time>
                {note.zh && (
                  <Link
                    href={href(note.slug, "zh")}
                    hrefLang="zh-Hans"
                    lang="zh-Hans"
                    aria-label={`${note.title} — ${label.edition}`}
                    className={`${writing.edition} ${styles.sc}`}
                  >
                    {label.edition}
                  </Link>
                )}
              </div>
              <p className={writing.excerpt}>{note.excerpt}</p>
            </article>
          </li>
        ))}
      </ol>

      <details className={writing.references}>
        <summary>Reading references</summary>
        {/* Preserve the passages in their own scripts and directions;
            the essays above are the primary writing on this page. */}
        <div className={writing.referencesBody}>
          <p className={styles.textsLede}>
            Each passage is kept with its source, a rendering where provided, and a reading note.
          </p>
          <ol className={`${styles.textList} ${writing.referenceList}`}>
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
            Chinese passages are set vertically; English renderings and reading notes accompany the sources.
          </p>
        </div>
      </details>
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
          <Link href="/notes">{zh ? label.notes : "Writing"}</Link>
          <span aria-hidden="true"> · </span>
          <time dateTime={note.date}>{noteDate(note.date, lang)}</time>
        </p>
        <h1 className={styles.noteTitle}>{note.title}</h1>
        <Horizon />
        {note.excerpt && <p className={styles.noteLede}>{note.excerpt}</p>}
        <div className={styles.noteBody} dangerouslySetInnerHTML={{ __html: note.html }} />

        <nav className={styles.noteNav} aria-label="More writing">
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
            All writing
          </Link>
        </nav>
      </article>
    </Shell>
  );
}
