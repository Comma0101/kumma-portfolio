// PhotoGallery.tsx
import { menuItems } from "./menuItems";
import styles from "../styles/GalleryPage.module.css";
import MenuItem from "./MenuItem";
import BackButton from "./BackButton";
interface MenuItemData {
  title: string;
  subtitle: string;
  imageUrl: string;
  galleryImages: string[];
}

// const menuItems: MenuItemData[] = [
//   {
//     title: "Collection One",
//     subtitle: "Style Reset 66 Berlin",
//     imageUrl: "/images/collection1.jpg",
//     galleryImages: [
//       "/images/collection1/img1.jpg",
//       "/images/collection1/img2.jpg",
//       // Add more images
//     ],
//   },
//   // Add more collections
// ];

const PhotoGallery = () => {
  return (
    <>
      <BackButton />
      <nav className={styles.menu}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </nav>
    </>
  );
};

export default PhotoGallery;
