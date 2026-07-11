import type { Metadata } from "next";
import RobinhoodCaseStudy from "@/components/RobinhoodCaseStudy";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Robinhood performance dashboard — case study",
  description:
    "A data-correctness case study: turning a messy Robinhood CSV export into a correct, per-trade profit-and-loss record. The transaction-pairing algorithm — FIFO for stocks, contract-level matching for options — and the pipeline around it.",
  alternates: { canonical: "https://kumma.me/work/robinhood-dashboard" },
  openGraph: {
    title: "Robinhood performance dashboard — case study | Kumma",
    description:
      "Turning a messy brokerage CSV export into a correct, inspectable per-trade record. Transaction pairing, FIFO lot matching, options-contract matching, and a D3 analytics interface.",
    url: "https://kumma.me/work/robinhood-dashboard",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robinhood performance dashboard — case study | Kumma",
    description:
      "Data correctness, not trading: pairing a messy CSV export into a correct per-trade record.",
  },
};

const caseStudyLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Robinhood performance dashboard — case study",
      description:
        "How a messy Robinhood CSV export is turned into a correct, per-trade profit-and-loss record through transaction pairing: FIFO lot matching for stocks and contract-level matching for options.",
      url: "https://kumma.me/work/robinhood-dashboard",
      author: {
        "@type": "Person",
        name: "Kumma",
        alternateName: "Yang Wu",
        url: "https://kumma.me",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Robinhood performance dashboard",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description:
        "A data pipeline that ingests a Robinhood CSV export, pairs buy and sell transactions using FIFO for stocks and contract-level matching for options to compute correct per-trade profit and loss, and renders the record as an interactive D3 dashboard.",
      url: "https://kumma.me/work/robinhood-dashboard",
      author: {
        "@type": "Person",
        name: "Kumma",
        alternateName: "Yang Wu",
        url: "https://kumma.me",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={caseStudyLd} />
      <RobinhoodCaseStudy />
    </>
  );
}
