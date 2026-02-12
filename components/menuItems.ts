export interface MenuItemData {
  title: string;
  subtitle: string;
  imageUrl: string;
  galleryImages: string[];
}

export const menuItems: MenuItemData[] = [
  {
    title: "Berlin Reset",
    subtitle: "Style Study / Sequence 66",
    imageUrl: "/images/collection1.jpg",
    galleryImages: [
      "/images/collection1/img1.jpg",
      "/images/collection1/img2.jpg",
      "/images/collection1/img3.jpg",
    ],
  },
  {
    title: "Urban Echoes",
    subtitle: "Street Motion / Night Fragments",
    imageUrl: "/images/collection2.jpg",
    galleryImages: [
      "/images/collection2/img1.jpg",
      "/images/collection2/img2.jpg",
      "/images/collection2/img3.jpg",
    ],
  },
];
