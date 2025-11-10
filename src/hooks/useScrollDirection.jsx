import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const useScrollDirection = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollYRef = useRef(0);
  const location = useLocation();

  // Reset navbar visibility on route change
  useEffect(() => {
    // Ensure navbar is shown when navigating to a new route
    setShowNavbar(true);
    // Reset the last scroll position so next scroll works from top
    lastScrollYRef.current = 0;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || 0;

      // Always show navbar near the top of the page
      if (currentScrollY < 10) {
        setShowNavbar(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollYRef.current) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    // Attach once with passive listener for performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Run once to initialize based on current position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return showNavbar;
};

export default useScrollDirection;
