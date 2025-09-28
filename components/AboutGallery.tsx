"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/home.module.css";

const images = [
  { id: "img1", src: "/images/collection1/img1.jpg", alt: "Abstract generative art" },
  { id: "img2", src: "/images/collection1/img2.jpg", alt: "Colorful geometric patterns" },
  { id: "img3", src: "/images/collection1/img3.jpg", alt: "Organic digital formations" },
  { id: "img4", src: "/images/collection2/img1.jpg", alt: "Light installation" },
  { id: "img5", src: "/images/collection2/img2.jpg", alt: "Interactive projection mapping" },
  { id: "img6", src: "/images/collection2/img3.jpg", alt: "Kinetic sculpture" },
];

const AboutGallery = () => {
  return (
    <div className={styles.aboutGallery}>
      {images.map((image) => (
        <img
          key={image.id}
          src={image.src}
          alt={image.alt}
          className={styles.galleryImage}
        />
      ))}
    </div>
  );
};

export default AboutGallery;
