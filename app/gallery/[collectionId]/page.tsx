import GalleryPage from "@/components/GalleryPage";

export async function generateStaticParams() {
  // In a real application, you would fetch this data from a CMS or database.
  return [{ collectionId: "collection1" }, { collectionId: "collection2" }];
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
