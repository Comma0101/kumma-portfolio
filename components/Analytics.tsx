import ConversionListener from "@/components/analytics/ConversionListener";

// Umami website ID is a public value (it appears in the page HTML on every
// tracked site). Default is the kumma.me site ID on Umami Cloud; an env var
// can still override it per-environment.
const DEFAULT_UMAMI_ID = "b59f3ee6-aba6-438c-8ffe-d3668949ef5c";

export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_UMAMI_ID || DEFAULT_UMAMI_ID;
  return (
    <>
      {id ? (
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={id}
        />
      ) : null}
      <ConversionListener />
    </>
  );
}
