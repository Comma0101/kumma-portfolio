import styles from "../styles/home.module.css";
import HeroSection from "./home/HeroSection";
import ProofConsole from "./home/ProofConsole";
import PositioningBand from "./home/PositioningBand";
import ChapterIndex from "./home/ChapterIndex";
import CapabilitiesSection from "./home/CapabilitiesSection";
import ResearchProofSection from "./home/ResearchProofSection";
import LabsSection from "./home/LabsSection";
import ContactSection from "./home/ContactSection";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HeroSection />
      <ProofConsole />
      <PositioningBand />
      <ChapterIndex />
      <CapabilitiesSection />
      <ResearchProofSection />
      <LabsSection />
      <ContactSection />
    </div>
  );
};

export default Home;
