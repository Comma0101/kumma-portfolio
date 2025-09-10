import GalleryPage from '@/components/GalleryPage';

const GalleryCollectionPage = ({ params }: { params: { collectionId: string } }) => {
  return <GalleryPage collectionId={params.collectionId} />;
};

export default GalleryCollectionPage;
