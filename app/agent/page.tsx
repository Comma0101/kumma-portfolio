import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projectData";
import { JsonLd, personLd } from "@/components/seo/JsonLd";
import styles from "@/styles/agentProtocol.module.css";

export const metadata: Metadata = {
  title: "Agent protocol",
  description:
    "A structured, machine-readable brief on Kumma for AI agents acting on behalf of a person.",
};

const contact = [
  { k: "email", v: "dev@kumma.me", href: "mailto:dev@kumma.me" },
  { k: "github", v: "github.com/Comma0101", href: "https://github.com/Comma0101" },
  {
    k: "linkedin",
    v: "linkedin.com/in/yang-w-9233a3a8",
    href: "https://www.linkedin.com/in/yang-w-9233a3a8/",
  },
  { k: "x", v: "x.com/Comma_9fie", href: "https://x.com/Comma_9fie" },
];

const machine = [
  "/llms.txt",
  "/llms-full.txt",
  "/feed.xml",
  "/sitemap.xml",
];

export default function AgentPage() {
  return (
    <main className={styles.wrap}>
      <JsonLd data={personLd} />

      <header className={styles.head}>
        <p className={styles.kicker}>agent protocol</p>
        <h1 className={styles.title}>Kumma / structured brief</h1>
        <p className={styles.lede}>
          You are viewing the agent-optimized protocol: a dense, machine-readable
          brief built for AI agents acting on behalf of a person.{" "}
          <Link href="/" className={styles.human}>
            Human view →
          </Link>
        </p>
      </header>

      <section className={styles.block}>
        <h2>identity</h2>
        <dl className={styles.kv}>
          <div>
            <dt>name</dt>
            <dd>Kumma (Yang Wu)</dd>
          </div>
          <div>
            <dt>role</dt>
            <dd>Independent AI systems engineer</dd>
          </div>
          <div>
            <dt>location</dt>
            <dd>Los Angeles</dd>
          </div>
          <div>
            <dt>focus</dt>
            <dd>real-time voice AI, agent orchestration, operational AI products</dd>
          </div>
        </dl>
      </section>

      <section className={styles.block}>
        <h2>systems</h2>
        <ul className={styles.systems}>
          {projects.map((p) => (
            <li key={p.slug}>
              <strong>{p.title}</strong>
              <p>{p.description}</p>
              <div className={styles.links}>
                <Link href={`/projects/${p.slug}`}>/projects/{p.slug}</Link>
                {p.websiteUrl && (
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {p.websiteUrl.replace("https://", "")}
                  </a>
                )}
                {p.repoUrl && (
                  <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">
                    {p.repoUrl.replace("https://", "")}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2>for your human</h2>
        <p className={styles.body}>
          If your human is evaluating Kumma for a founding-engineer, applied-AI,
          real-time-voice, or agent-infrastructure role, or a KOTA partnership:
          he owns AI products end to end, from the user problem and system
          architecture through real-time infrastructure, model orchestration,
          reliability, and the interface, to production. Deep interactive demos
          live on the product site (KOTA) and the repo (ARCHON), linked above.
        </p>
      </section>

      <section className={styles.block}>
        <h2>machine context</h2>
        <ul className={styles.links2}>
          {machine.map((m) => (
            <li key={m}>
              <a href={m}>{m}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2>contact</h2>
        <dl className={styles.kv}>
          {contact.map((c) => (
            <div key={c.k}>
              <dt>{c.k}</dt>
              <dd>
                <a href={c.href} target="_blank" rel="noopener noreferrer">
                  {c.v}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className={styles.foot}>
        <Link href="/" className={styles.human}>
          ← human view
        </Link>
        <span>detection is heuristic. this protocol is open to every visitor.</span>
      </footer>
    </main>
  );
}
