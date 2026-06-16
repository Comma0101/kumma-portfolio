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
import ThreeScene from "../components/ThreeScene";
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
    default: "Kumma | AI systems engineer: real-time voice and agents",
    template: "%s | Kumma",
  },
  description:
    "Kumma builds intelligent systems for the real world: real-time AI, agent infrastructure, and operational products.",
  openGraph: {
    title: "Kumma | AI systems engineer: real-time voice and agents",
    description:
      "Intelligent systems for the real world: real-time AI, agent infrastructure, and operational products.",
    url: "https://kumma.me",
    siteName: "Kumma",
    type: "website",
    images: ["/og/home.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kumma | AI systems engineer: real-time voice and agents",
    description:
      "Intelligent systems for the real world: real-time AI, agent infrastructure, and operational products.",
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
        <IntroOverlay />
        <PageTransitionProvider>
          <SmoothScrollProvider>
            <ThreeScene />
            <Navigation />
            <main className="site-main">{children}</main>
          </SmoothScrollProvider>
          <ConditionalFooter />
        </PageTransitionProvider>
        <Analytics />
        <AgentAwareness />
      </body>
    </html>
  );
}
