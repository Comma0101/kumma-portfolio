export interface MenuItemData {
  title: string;
  subtitle: string;
  imageUrl: string;
  galleryImages: string[];
}

export const menuItems: MenuItemData[] = [
  {
    title: "Natural Systems",
    subtitle: "Pattern / Scale / Quiet Structure",
    imageUrl: "/images/collection1.jpg",
    galleryImages: [
      "/images/collection1/img1.jpg",
      "/images/collection1/img2.jpg",
      "/images/collection1/img3.jpg",
    ],
  },
  {
    title: "Light & Structure",
    subtitle: "Motion / Framing / Atmosphere",
    imageUrl: "/images/collection2/img3.jpg",
    galleryImages: [
      "/images/collection2/img1.jpg",
      "/images/collection2/img2.jpg",
      "/images/collection2/img3.jpg",
    ],
  },
];
