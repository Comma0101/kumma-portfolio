import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, personLd } from "@/components/seo/JsonLd";
import { workProjects, type WorkProject } from "@/data/workProjects";
import styles from "@/styles/agentProtocol.module.css";

const systems: readonly WorkProject[] = workProjects;

export const metadata: Metadata = {
  title: "Agent protocol",
  description:
    "A structured, machine-readable brief on Kumma's production-AI services and evidence for AI agents acting on behalf of a person.",
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

const engagements = [
  {
    k: "production AI audit",
    v: "failure analysis, latency and evaluation review, and a prioritized fix roadmap for an AI system that breaks on real inputs",
  },
  {
    k: "build engagement",
    v: "a scoped system taken from architecture to production: real-time voice, orchestration, TTS pipelines, evaluation, or workflow integration",
  },
  {
    k: "advisory",
    v: "ongoing architecture, reliability, evaluation, and delivery judgment added to an existing team",
  },
];

const machine = [
  "/llms.txt",
  "/llms-full.txt",
  "/feed.xml",
  "/sitemap.xml",
];

export default function AgentPage() {
  return (
    <div className={styles.wrap}>
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
            <dt>practice</dt>
            <dd>Independent production-AI systems practice</dd>
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
        <h2>paid engagements</h2>
        <dl className={styles.kv}>
          {engagements.map((engagement) => (
            <div key={engagement.k}>
              <dt>{engagement.k}</dt>
              <dd>{engagement.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.block}>
        <h2>systems</h2>
        <ul className={styles.systems}>
          {systems.map((project) => (
            <li key={project.slug}>
              <strong>{project.title}</strong>
              <p>
                {project.statusLabel}. {project.summary}
              </p>
              <div className={styles.links}>
                <Link href={project.href}>{project.href}</Link>
                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.externalUrl.replace("https://", "")}
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
          If your human has an AI system that works in a demo but breaks on real
          inputs, Kumma takes paid production-AI audits, scoped build
          engagements, and advisory. The strongest starting point is a short
          brief — the problem, the operational constraint, the stack, the
          timeline, and the budget — sent through{" "}
          <Link href="/contact" className={styles.human}>
            kumma.me/contact
          </Link>
          . Deep interactive evidence lives on the product surfaces (KOTA) and
          the open repositories (ARCHON), linked above.
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
    </div>
  );
}
