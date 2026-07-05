import styles from "../styles/home.module.css";
import HeroSection from "./home/HeroSection";
import ProofConsole from "./home/ProofConsole";
import PositioningBand from "./home/PositioningBand";
import ChapterIndex from "./home/ChapterIndex";
import PhilosophySection from "./home/PhilosophySection";
import ContactSection from "./home/ContactSection";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HeroSection />
      <ProofConsole />
      <PositioningBand />
      <ChapterIndex />
      <PhilosophySection />
      <ContactSection />
    </div>
  );
};

export default Home;
