"use client";
import { useState, useEffect } from "react";
import Home from "@/components/Home";
import { usePathname } from "next/navigation";

const HomePage = () => {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(pathname === "/");

  useEffect(() => {
    setIsHome(pathname === "/");
  }, [pathname]);

  return isHome ? <Home /> : null;
};

export default HomePage;
