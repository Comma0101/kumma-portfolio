import Projects from '@/components/Projects';

// Ensure the page is treated as static despite being a client component
// by explicitly handling the searchParams prop.
export default function ProjectsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return <Projects />;
}
