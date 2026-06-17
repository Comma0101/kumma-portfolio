import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "ghost";

interface ButtonProps {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
  external?: boolean;
}

export default function Button({
  href,
  variant = "primary",
  children,
  external,
}: ButtonProps) {
  const cls = `${styles.btn} ${variant === "primary" ? styles.primary : styles.ghost}`;
  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }
  if (href.startsWith("#") || href.startsWith("/")) {
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <a className={cls} href={href}>
      {children}
    </a>
  );
}
