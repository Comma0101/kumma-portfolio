import type { Metadata } from "next";
import { spaceGrotesk, jetbrainsMono, cormorant } from "@/components/legacyFonts";
import "./globals.css";
import Navigation from "../components/Navigation";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import ConditionalFooter from "../components/ConditionalFooter";
import { PageTransitionProvider } from "@/components/PageTransition";
import IntroOverlay from "../components/IntroOverlay";
import Analytics from "../components/Analytics";
import AgentAwareness from "../components/AgentAwareness";

export const metadata: Metadata = {
  metadataBase: new URL("https://kumma.me"),
  title: {
    default: "Kumma Wu",
    template: "%s | Kumma",
  },
  description:
    "Kumma Wu explores consciousness, self-awareness, and imagination through writing, software, and visual experiments, seeking to live with love.",
  openGraph: {
    title: "Kumma Wu",
    description:
      "Kumma Wu explores consciousness, self-awareness, and imagination through writing, software, and visual experiments, seeking to live with love.",
    url: "https://kumma.me",
    siteName: "Kumma Wu",
    type: "website",
    images: ["/og/portrait.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kumma Wu",
    description:
      "Kumma Wu explores consciousness, self-awareness, and imagination through writing, software, and visual experiments, seeking to live with love.",
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
