import Artfulcode from '@/components/Artfulcode';

// Ensure the page is treated as static despite being a client component
// by explicitly handling the searchParams prop.
export default function ArtfulcodePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return <Artfulcode />;
}
