import GalleryPage from "@/components/GalleryPage";

const GalleryCollectionPage = async ({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) => {
  return <GalleryPage collectionId={collectionId} />;
};

export default GalleryCollectionPage;
