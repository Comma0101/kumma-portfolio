import { Roboto_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import "../styles/index.css";
import "../styles/app.css";
import Navigation from "../components/Navigation";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import ConditionalFooter from "../components/ConditionalFooter";
import { PageTransitionProvider } from "@/components/PageTransition";
import IntroAnimation from "../components/IntroAnimation";
import { AnimationProvider } from "../context/AnimationContext";
import { TransitionProvider } from "../context/TransitionContext";
import PageWrapper from "../components/PageWrapper";
import ThreeScene from "../components/ThreeScene";
import TextTunnelTransition from "../components/home/TextTunnelTransition";

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
        <TransitionProvider>
          <AnimationProvider>
            <IntroAnimation />
            <TextTunnelTransition />
            <PageWrapper>
              <PageTransitionProvider>
                <SmoothScrollProvider>
                  <ThreeScene />
                  <Navigation />
                  <main style={{ position: "relative", zIndex: 1 }}>
                    {children}
                  </main>
                </SmoothScrollProvider>
                <ConditionalFooter />
              </PageTransitionProvider>
            </PageWrapper>
          </AnimationProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}
