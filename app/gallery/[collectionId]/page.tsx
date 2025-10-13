import GalleryPage from "@/components/GalleryPage";
import { menuItems } from "@/components/menuItems";

export async function generateStaticParams() {
  return menuItems.map((_, index) => ({
    collectionId: index.toString(),
  }));
}

const GalleryCollectionPage = ({
  params,
}: {
  params: { collectionId: string };
}) => {
  const { collectionId } = params;
  return <GalleryPage collectionId={collectionId} />;
};

export default GalleryCollectionPage;
