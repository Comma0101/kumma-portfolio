import Home from "@/components/Home";
import { JsonLd, homeLd } from "@/components/seo/JsonLd";
import ThreeScene from "@/components/ThreeScene";

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeLd} />
      <ThreeScene />
      <Home />
    </>
  );
}
