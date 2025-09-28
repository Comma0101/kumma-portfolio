"use client";
import React from "react";
import styles from "../styles/PhotoGallery.module.css";

const collections = [
  {
    id: "collection1",
    name: "Generative Art",
    images: [
      { id: "img1", src: "/images/collection1/img1.jpg", alt: "Abstract generative art" },
      { id: "img2", src: "/images/collection1/img2.jpg", alt: "Colorful geometric patterns" },
      { id: "img3", src: "/images/collection1/img3.jpg", alt: "Organic digital formations" },
    ],
  },
  {
    id: "collection2",
    name: "Interactive Installations",
    images: [
      { id: "img1", src: "/images/collection2/img1.jpg", alt: "Light installation" },
      { id: "img2", src: "/images/collection2/img2.jpg", alt: "Interactive projection mapping" },
      { id: "img3", src: "/images/collection2/img3.jpg", alt: "Kinetic sculpture" },
    ],
  },
];

const PhotoGallery = () => {
  return (
    <div className={styles.galleryContainer}>
      {collections.map((collection) => (
        <div key={collection.id} className={styles.collection}>
          <h3 className={styles.collectionTitle}>{collection.name}</h3>
          <div className={styles.imageList}>
            {collection.images.map((image) => (
              <div key={image.id} className={`${styles.imageWrapper} imageWrapper`}>
                <img src={image.src} alt={image.alt} className={styles.image} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;
