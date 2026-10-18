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

// Secondary faces load on use, not on every page (the homepage sets neither).
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kumma.me"),
  title: {
    default: "Kumma Wu",
    template: "%s | Kumma",
  },
  description:
    "In the gym most days. Trading options. Attention goes where it compounds. Los Angeles.",
  openGraph: {
    title: "Kumma Wu",
    description:
      "In the gym most days. Trading options. Attention goes where it compounds. Los Angeles.",
    url: "https://kumma.me",
    siteName: "Kumma Wu",
    type: "website",
    images: ["/og/portrait.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kumma Wu",
    description:
      "In the gym most days. Trading options. Attention goes where it compounds. Los Angeles.",
    images: ["/og/portrait.png"],
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
