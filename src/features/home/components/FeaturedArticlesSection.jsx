import { useMemo, useRef, useState, useEffect } from 'react';
import styles from '../styles/FeaturedArticlesSection.module.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "../../../config/supabaseClient";
import { useLanguage } from "../../../context/LanguageProvider";
import { Link } from "react-router-dom";
import { getFormattedDate } from '../../../utils/dateUtil';
import { encodeId } from '../../../utils/hashUtil';
import { Spinner } from 'react-bootstrap';


const FeaturedArticlesSection = () => {
    const { language } = useLanguage();
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const hasMoved = useRef(false);

    const handleMouseDown = (e) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        hasMoved.current = false;
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
        if (Math.abs(x - startX) > 5) {
            hasMoved.current = true;
        }
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
        staleTime: 20 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const truncate = (str, max) => {
        if (!str) return '';
        if (str.length <= max) return str;
        const cut = str.slice(0, max);
        const lastSpace = cut.lastIndexOf(' ');
        const safeCut = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
        return safeCut + '...';
    };

    const cards = useMemo(() => {
        if (!featuredArticlesData) return [];
        return featuredArticlesData
            .map((row) => {
                const a = row?.articles_secure;
                if (!a) return null;
                const isBn = language === 'bn';
                const title = isBn ? a.title_bn ?? a.title_en : a.title_en ?? a.title_bn;
                const rawDescription = isBn ? a.subtitle_bn ?? a.subtitle_en : a.subtitle_en ?? a.subtitle_bn;
                const description = truncate(rawDescription, 100);
                return {
                    id: a.id,
                    image: a.cover_img_link,
                    title,
                    description,
                    author: a.author_name,
                    // date: new Date(a.created_at).toLocaleDateString(undefined, {
                    //     year: 'numeric', month: 'long', day: 'numeric'
                    // }),
                    date: getFormattedDate(a.created_at, language),
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

    if (!isLoading && !error && cards.length === 0) return null;

    return (
        <>
            {/* <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap" rel="stylesheet" /> */}

            <section className={styles.featuredSection}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h2 style={{ fontFamily: fontFamily }} className={styles.title}>Featured Articles</h2>
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
                            // <div className={styles.loading}>Loading featured articles…</div>
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem' }}>
                                <Spinner className={styles.content_loader} animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        )}
                        {error && (
                            <div className={styles.error}>Failed to load featured articles.</div>
                        )}
                        {!isLoading && !error && cards.map((article) => (
                            <Link
                                to={`/article/${encodeId(article.id)}/${article.slug}`}
                                key={article.id}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                onClick={(e) => {
                                    if (hasMoved.current) e.preventDefault();
                                }}
                                onDragStart={(e) => e.preventDefault()}
                            >
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
                                        <h3 style={{ fontFamily: fontFamily }} className={styles.articleTitle}>{article.title}</h3>
                                        <p style={{ fontFamily: fontFamily }} className={styles.articleDescription}>{article.description}</p>

                                        <div className={styles.articleMeta}>
                                            <div className={styles.authorInfo}>
                                                <i className="fi fi-br-user-pen" style={{ fontSize: 14 }}></i>
                                                <span style={{ fontFamily: fontFamily }} className={styles.authorName}>{article.author}</span>
                                            </div>
                                            <div>
                                                <div style={{ display: 'inline-block', transform: 'translateY(1px)' }}>
                                                    <i className="fi fi-br-clock" style={{ fontSize: 14 }}></i>
                                                </div>
                                                &nbsp;
                                                <span style={{ fontFamily: fontFamily }} className={styles.date}>{article.date}</span>
                                            </div>

                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            <hr />

        </>
    );
}

export default FeaturedArticlesSection;