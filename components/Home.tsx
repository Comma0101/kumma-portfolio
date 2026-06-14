import styles from "../styles/home.module.css";
import HeroSection from "./home/HeroSection";
import PositioningBand from "./home/PositioningBand";
import ChapterIndex from "./home/ChapterIndex";
import PhilosophySection from "./home/PhilosophySection";
import ContactSection from "./home/ContactSection";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HeroSection />
      <PositioningBand />
      <ChapterIndex />
      <PhilosophySection />
      <ContactSection />
    </div>
  );
};

export default Home;
