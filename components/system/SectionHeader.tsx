import styles from "./SectionHeader.module.css";
import Eyebrow from "./Eyebrow";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  intro?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  intro,
}: SectionHeaderProps) {
  return (
    <header className={styles.header}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={styles.title}>{title}</h2>
      {intro && <p className={styles.intro}>{intro}</p>}
    </header>
  );
}
