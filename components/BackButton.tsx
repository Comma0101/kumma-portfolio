"use client";
import Link from "next/link";
import styles from "../styles/BackButton.module.css";

const BackButton = () => {
  return (
    <Link href="/" className={styles.backButton}>
      Back to Home
    </Link>
  );
};

export default BackButton;
