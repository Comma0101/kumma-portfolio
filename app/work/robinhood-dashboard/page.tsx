import type { Metadata } from "next";
import RobinhoodCaseStudy from "@/components/RobinhoodCaseStudy";
import Paper from "@/components/personal/Paper";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Trade ledger — case study",
  description:
    "A data-correctness case study: turning a messy brokerage CSV export into a correct, per-trade profit-and-loss record. The transaction-pairing algorithm — FIFO for stocks, contract-level matching for options — and the pipeline around it.",
  alternates: { canonical: "https://kumma.me/work/robinhood-dashboard" },
  openGraph: {
    title: "Trade ledger — case study | Kumma",
    description:
      "Turning a messy brokerage CSV export into a correct, inspectable per-trade record. Transaction pairing, FIFO lot matching, options-contract matching, and a D3 analytics interface.",
    url: "https://kumma.me/work/robinhood-dashboard",
    type: "article",
    images: ["/og/portrait.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/portrait.png"],
    title: "Trade ledger — case study | Kumma",
    description:
      "Data correctness, not trading: pairing a messy CSV export into a correct per-trade record.",
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Trade ledger — case study",
      description:
        "How a messy brokerage CSV export is turned into a correct, per-trade profit-and-loss record through transaction pairing: FIFO lot matching for stocks and contract-level matching for options.",
      url: "https://kumma.me/work/robinhood-dashboard",
      author: {
        "@type": "Person",
        name: "Kumma Wu",
        alternateName: "Kumma",
        url: "https://kumma.me",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Trade ledger",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description:
        "A data pipeline that ingests a brokerage CSV export, pairs buy and sell transactions using FIFO for stocks and contract-level matching for options to compute correct per-trade profit and loss, and renders the record as an interactive D3 dashboard.",
      url: "https://kumma.me/work/robinhood-dashboard",
      author: {
        "@type": "Person",
        name: "Kumma Wu",
        alternateName: "Kumma",
        url: "https://kumma.me",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={caseStudyLd} />
      <Paper>
        <RobinhoodCaseStudy />
      </Paper>
    </>
  );
}
