import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import ConditionalFooter from "../components/ConditionalFooter";
import { PageTransitionProvider } from "@/components/PageTransition";
import IntroOverlay from "../components/IntroOverlay";
import Analytics from "../components/Analytics";
import AgentAwareness from "../components/AgentAwareness";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kumma.me"),
  title: {
    default: "Kumma / Yang Wu | Production AI audits, builds, and advisory",
    template: "%s | Kumma",
  },
  description:
    "Kumma / Yang Wu runs an independent production-AI systems practice: paid audits, scoped builds, and advisory for real-time voice, agent orchestration, and decision-quality workflows.",
  openGraph: {
    title: "Kumma / Yang Wu | Production AI audits, builds, and advisory",
    description:
      "An independent production-AI systems practice: audits, scoped builds, and advisory for real-time voice, agent orchestration, and decision-quality workflows.",
    url: "https://kumma.me",
    siteName: "Kumma / Yang Wu",
    type: "website",
    images: ["/og/home.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kumma / Yang Wu | Production AI audits, builds, and advisory",
    description:
      "An independent production-AI systems practice: audits, scoped builds, and advisory for real-time voice, agent orchestration, and decision-quality workflows.",
    images: ["/og/home.png"],
  },
  ...(process.env.NEXT_PUBLIC_GSC_TOKEN
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_TOKEN } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
        suppressHydrationWarning
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <IntroOverlay />
        <PageTransitionProvider>
          <SmoothScrollProvider>
            <Navigation />
            <main id="main-content" className="site-main" tabIndex={-1}>
              {children}
            </main>
          </SmoothScrollProvider>
          <ConditionalFooter />
        </PageTransitionProvider>
        <Analytics />
        <AgentAwareness />
      </body>
    </html>
  );
}
