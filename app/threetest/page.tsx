"use client";
import ThreeScene from "@/components/ThreeScene";
import BackButton from "@/components/BackButton";

const ThreeTestPage = () => {
  return (
    <div>
      <ThreeScene />
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <BackButton />
      </div>
    </div>
  );
};

export default ThreeTestPage;
