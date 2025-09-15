import GalleryPage from "@/components/GalleryPage";

const GalleryCollectionPage = ({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) => {
  return <GalleryPage collectionId={collectionId} />;
};

export default GalleryCollectionPage;
