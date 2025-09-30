import { useEffect, useState } from "react";

const useScrollDirection = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowNavbar(false); // Scrolling down
        
      } else {
        setShowNavbar(true); // Scrolling up
        // console.log("Scrolling down, hiding navbar", currentScrollY, lastScrollY);

      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return showNavbar;
};

export default useScrollDirection;
