// menuItems.ts

export interface MenuItemData {
  title: string;
  subtitle: string;
  imageUrl: string;
  galleryImages: string[];
}

export const menuItems: MenuItemData[] = [
  {
    title: "Collection One",
    subtitle: "Style Reset 66 Berlin",
    imageUrl: "/images/collection1.jpg",
    galleryImages: [
      "/images/collection1/img1.jpg",
      "/images/collection1/img2.jpg",
      "/images/collection1/img3.jpg",
      // Add more images as needed
    ],
  },
  {
    title: "Collection Two",
    subtitle: "Urban Exploration",
    imageUrl: "/images/collection2.jpg",
    galleryImages: [
      "/images/collection2/img1.jpg",
      "/images/collection2/img2.jpg",
      "/images/collection2/img3.jpg",
      // Add more images as needed
    ],
  },
  // Add more collections as needed
];
