import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';
import styles from '../styles/PageTransitionOverlay.module.css';

const MIN_TRANSITION_DURATION = 20; // minimum ms to show the overlay

export default function PageTransitionOverlay({ children }) {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevPathRef = useRef(location.pathname + location.search);
    const transitionStartTime = useRef(0);

    useEffect(() => {
        const currentPath = location.pathname + location.search;
        
        // If the path changed, start transitioning
        if (prevPathRef.current !== currentPath) {
            setIsTransitioning(true);
            transitionStartTime.current = Date.now();
            prevPathRef.current = currentPath;
        }
    }, [location.pathname, location.search]);

    // Hide overlay after the new page content has rendered
    // This effect runs when location.key changes (after navigation completes)
    useEffect(() => {
        if (isTransitioning) {
            // Calculate how long we've been transitioning
            const elapsed = Date.now() - transitionStartTime.current;
            const remainingTime = Math.max(0, MIN_TRANSITION_DURATION - elapsed);

            // Wait for at least MIN_TRANSITION_DURATION total
            const timeoutId = setTimeout(() => {
                // Use requestAnimationFrame to ensure DOM has updated
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsTransitioning(false);
                    });
                });
            }, remainingTime);

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
