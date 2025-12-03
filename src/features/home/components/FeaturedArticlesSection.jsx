import { useMemo, useRef, useState, useEffect } from 'react';
import styles from '../styles/FeaturedArticlesSection.module.css';
import {useQuery} from '@tanstack/react-query';
import { supabase } from "../../../config/supabaseClient";
import { useLanguage } from "../../../context/LanguageProvider";
import { Link } from "react-router-dom";
import { getFormattedTime } from '../../../utils/dateUtil';


const FeaturedArticlesSection = () => {
    const { language } = useLanguage();
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

    const { data: featuredArticlesData, isLoading, error } = useQuery({
        queryKey: ['featuredArticles'],
        queryFn: async () => {
            // Single API call: join featured -> articles_secure via FK (article_id)
            const nowIso = new Date().toISOString();
            const { data, error } = await supabase
                .from("featured_articles")
                .select(`
                    id,
                    priority,
                    start_at,
                    end_at,
                    article_id,
                    articles_secure:articles_secure (* )
                `)
                // .lte('start_at', nowIso)
                // .or('end_at.is.null,end_at.gte.' + nowIso)
                .order('priority', { ascending: true })
                .limit(5);

            if (error) throw error;
            return data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const cards = useMemo(() => {
        if (!featuredArticlesData) return [];
        return featuredArticlesData
            .map((row) => {
                const a = row?.articles_secure;
                if (!a) return null;
                const isBn = language === 'bn';
                const title = isBn ? a.title_bn ?? a.title_en : a.title_en ?? a.title_bn;
                const description = isBn ? a.subtitle_bn ?? a.subtitle_en : a.subtitle_en ?? a.subtitle_bn;
                return {
                    id: a.id,
                    image: a.cover_img_link,
                    title,
                    description,
                    author: a.author_name,
                    // date: new Date(a.created_at).toLocaleDateString(undefined, {
                    //     year: 'numeric', month: 'long', day: 'numeric'
                    // }),
                    date: getFormattedTime(a.created_at, language),
                    slug: a.article_slug,
                    priority: row.priority ?? 99,
                };
            })
            .filter(Boolean);
    }, [featuredArticlesData, language]);

    
    const [fontFamily, setFontFamily] = useState('Roboto Serif');

    useEffect(() => {
        if (language === "en") setFontFamily('Roboto Serif');
        if (language === "bn") setFontFamily('"Noto Serif Bengali", serif');
    }, [language]);

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
                    {isLoading && (
                        <div className={styles.loading}>Loading featured articles…</div>
                    )}
                    {error && (
                        <div className={styles.error}>Failed to load featured articles.</div>
                    )}
                    {!isLoading && !error && cards.map((article) => (
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