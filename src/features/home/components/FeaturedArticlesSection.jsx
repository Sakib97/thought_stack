import { useRef, useState } from 'react';
import styles from '../styles/FeaturedArticlesSection.module.css';

const FeaturedArticlesSection = () => {
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        scrollContainerRef.current.style.scrollBehavior = 'auto';
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
        if (!scrollContainerRef.current) return;
        setIsDragging(false);
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.scrollBehavior = 'smooth';
        scrollContainerRef.current.style.userSelect = 'auto';
    };

    const handleMouseUp = () => {
        if (!scrollContainerRef.current) return;
        setIsDragging(false);
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.scrollBehavior = 'smooth';
        scrollContainerRef.current.style.userSelect = 'auto';
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const featuredArticles = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
            title: 'The Future of Global Trade Agreements',
            description: 'An in-depth look at how recent geopolitical shifts are reshaping international commerce and what it means for the global economy.',
            author: 'Eleanor Vance',
            date: '15 November 2025'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
            title: 'Tech Innovations Driving the Next Industrial Revolution',
            description: 'From AI to quantum computing, we explore the groundbreaking technologies that are set to redefine industries worldwide.',
            author: 'Marcus Holloway',
            date: '14 November 2025'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
            title: 'Diplomacy in the Digital Age: Challenges & Opportunities',
            description: 'How social media and instant communication are changing the landscape of international relations and foreign policy.',
            author: 'Anya Sharma',
            date: '13 November 2025'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
            title: 'Sustainable Energy Solutions for Tomorrow',
            description: 'Exploring renewable energy innovations and their impact on combating climate change while meeting global energy demands.',
            author: 'James Chen',
            date: '12 November 2025'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
            title: 'The Rise of Remote Work Culture',
            description: 'Understanding how distributed teams are reshaping corporate structures and employee expectations in the modern workplace.',
            author: 'Sarah Mitchell',
            date: '11 November 2025'
        }
    ];

    return ( 
        <section className={styles.featuredSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Featured Articles</h2>
                    <div className={styles.underline}></div>
                </div>
                
                <div 
                    ref={scrollContainerRef}
                    className={styles.articlesGrid}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {featuredArticles.map((article) => (
                        <article key={article.id} className={styles.articleCard}>
                            <div className={styles.imageWrapper}>
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className={styles.articleImage}
                                    draggable="false"
                                />
                            </div>
                            
                            <div className={styles.cardContent}>
                                <h3 className={styles.articleTitle}>{article.title}</h3>
                                <p className={styles.articleDescription}>{article.description}</p>
                                
                                <div className={styles.articleMeta}>
                                    <div className={styles.authorInfo}>
                                        <svg className={styles.authorIcon} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                        <span className={styles.authorName}>{article.author}</span>
                                    </div>
                                    <span className={styles.date}>{article.date}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
     );
}
 
export default FeaturedArticlesSection;