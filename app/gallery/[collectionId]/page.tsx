import GalleryPage from "@/components/GalleryPage";

const GalleryCollectionPage = async ({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) => {
  const { collectionId } = await params;
  return <GalleryPage collectionId={collectionId} />;
};

export default GalleryCollectionPage;
