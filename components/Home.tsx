import styles from "../styles/home.module.css";
import HeroSection from "./home/HeroSection";
import ProjectsSection from "./home/ProjectsSection";
import SkillsSection from "./home/SkillsSection";
import ContactSection from "./home/ContactSection";
import HomeEditorialSections from "./home/HomeEditorialSections";
import { getSortedPostsData } from "@/lib/posts";

const Home = () => {
  const latestPosts = getSortedPostsData("en").slice(0, 2);

  return (
    <div className={styles.homeContainer}>
      <HeroSection />
      <ProjectsSection />
      <SkillsSection />
      <HomeEditorialSections posts={latestPosts} />
      <ContactSection />
    </div>
  );
};

export default Home;
