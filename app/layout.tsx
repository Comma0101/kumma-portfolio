import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Roboto_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import ConditionalFooter from "../components/ConditionalFooter";
import { PageTransitionProvider } from "@/components/PageTransition";
import ThreeScene from "../components/ThreeScene";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const robotoMono = Roboto_Mono({
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
    default: "KUMMA | AI Systems and Product Engineering",
    template: "%s | KUMMA",
  },
  description:
    "KUMMA builds reliable AI systems, product interfaces, and real-time workflows.",
  openGraph: {
    title: "KUMMA | AI Systems and Product Engineering",
    description:
      "Reliable AI systems, product interfaces, and real-time workflows by KUMMA.",
    url: "https://kumma.me",
    siteName: "KUMMA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${robotoMono.variable} ${cormorant.variable}`}
        suppressHydrationWarning
      >
        <PageTransitionProvider>
          <SmoothScrollProvider>
            <ThreeScene />
            <Navigation />
            <main className="site-main">{children}</main>
          </SmoothScrollProvider>
          <ConditionalFooter />
        </PageTransitionProvider>
      </body>
    </html>
  );
}
