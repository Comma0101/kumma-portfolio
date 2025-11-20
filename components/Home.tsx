"use client";
import { useEffect, useRef } from "react";
import styles from "../styles/home.module.css";
import HeroSection from "./home/HeroSection";
import AboutSection from "./home/AboutSection";
import CuboidsSection from "./home/CuboidsSection";
import ProjectsSection from "./home/ProjectsSection";
import SkillsSection from "./home/SkillsSection";
import ContactSection from "./home/ContactSection";

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    // Get global Lenis instance
    const lenis = (window as any).lenis;
    if (lenis) {
      const handleScroll = (e: { scroll: number }) => {
        scrollY.current = e.scroll;
      };
      lenis.on("scroll", handleScroll);
      return () => {
        lenis.off("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <div ref={containerRef} className={styles.homeContainer}>
      <HeroSection />
      <AboutSection />
      <CuboidsSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </div>
  );
};

export default Home;
