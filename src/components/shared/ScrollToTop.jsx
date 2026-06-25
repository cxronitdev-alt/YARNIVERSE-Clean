import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 🚀 Jaise hi page ka route (path) badlega, ye page ko sabse upar bhej dega
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Bina kisi delay ke instantly top par scroll karega
    });
  }, [pathname]);

  return null; // Yeh component UI mein kuch render nahi karega, sirf logic handle karega
}