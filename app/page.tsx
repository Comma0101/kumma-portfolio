import Home from "@/components/Home";
import { JsonLd, personLd } from "@/components/seo/JsonLd";

export default function HomePage() {
  return (
    <>
      <JsonLd data={personLd} />
      <Home />
    </>
  );
}
