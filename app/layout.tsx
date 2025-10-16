import { Roboto_Mono, Bebas_Neue } from "next/font/google";
import "../src/app/globals.css";
import "../styles/index.css";
import "../styles/app.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import BackToTopCube from "../components/BackToTopCube";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/PageTransition";
import IntroAnimation from "../components/IntroAnimation";
import { AnimationProvider } from "../context/AnimationContext";
import PageWrapper from "../components/PageWrapper";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoMono.className} ${bebasNeue.className}`}
        suppressHydrationWarning
      >
        <AnimationProvider>
          <IntroAnimation />
          <PageWrapper>
            <PageTransitionProvider>
              <SmoothScrollProvider>
                <Navigation />
                {children}
              </SmoothScrollProvider>
              <Footer />
              <BackToTopCube />
            </PageTransitionProvider>
          </PageWrapper>
        </AnimationProvider>
      </body>
    </html>
  );
}
