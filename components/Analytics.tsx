export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_UMAMI_ID;
  if (!id) return null;
  return (
    <script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={id}
    />
  );
}
