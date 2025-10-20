"use client";
import { useRouter } from "next/navigation";
import styles from "../styles/FloatingBackButton.module.css";

const FloatingBackButton = () => {
  const router = useRouter();

  return (
    <button
      className={styles.backButton}
      onClick={() => router.push("/")}
      aria-label="Go back to home"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Back</span>
    </button>
  );
};

export default FloatingBackButton;
