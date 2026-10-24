import type { Metadata } from "next";
import Moved from "@/components/personal/Moved";
import { moved } from "@/components/personal/routes";

export const metadata: Metadata = {
  title: "Moved",
  robots: { index: false },
  alternates: { canonical: "https://kumma.me/work/" },
};

export default function Page() {
  return <Moved {...moved["/build"]} />;
}
