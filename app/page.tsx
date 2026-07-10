import Home from "@/components/Home";
import { JsonLd, homeLd } from "@/components/seo/JsonLd";

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeLd} />
      <Home />
    </>
  );
}
