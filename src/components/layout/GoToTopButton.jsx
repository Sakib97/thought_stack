import { useState, useEffect } from 'react';
const GoToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show the button when the user scrolls down 300px
    const toggleVisibility = () => {
        // if (window.pageYOffset > 300) {
        if (window.scrollY > 100) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Scroll to the top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Add an event listener for scrolling
    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div>
            {isVisible && (
                <div>
                    <button onClick={scrollToTop} style={styles.button}>
                        <i style={{ fontSize: 25}} className="fi fi-bs-angle-up"></i>
                    </button>
                </div>
            )}
        </div>
    );
}

// Styling for the button
const styles = {
    button: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        // backgroundColor: '#333',
        backgroundColor: 'rgba(1, 1, 1, 0.4)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        // padding: '8px',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
};

export default GoToTopButton;