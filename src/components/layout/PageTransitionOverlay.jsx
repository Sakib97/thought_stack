import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/PageTransitionOverlay.module.css';

export default function PageTransitionOverlay({ children }) {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevPathRef = useRef(location.pathname + location.search);

    useEffect(() => {
        const currentPath = location.pathname + location.search;
        
        // If the path changed, start transitioning
        if (prevPathRef.current !== currentPath) {
            setIsTransitioning(true);
            prevPathRef.current = currentPath;
        }
    }, [location.pathname, location.search]);

    // Hide overlay after the new page content has rendered
    useEffect(() => {
        if (isTransitioning) {
            // Minimum delay of 300ms so users always see the transition effect
            // even on fast connections
            const timeoutId = setTimeout(() => {
                requestAnimationFrame(() => {
                    setIsTransitioning(false);
                });
            }, 10);

            return () => clearTimeout(timeoutId);
        }
    }, [isTransitioning, location.key]);

    return (
        <>
            <div className={`${styles.overlay} ${isTransitioning ? styles.active : ''}`}>
                <div className={styles.spinner}></div>
            </div>
            {children}
        </>
    );
}
