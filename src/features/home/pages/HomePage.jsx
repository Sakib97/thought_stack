import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import { List, Avatar } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import { getFormattedTime } from "../../../utils/dateUtil";
import { encodeId } from "../../../utils/hashUtil";
import { useLanguage } from "../../../context/LanguageProvider";
import SearchBar from "../../../components/layout/SearchBar";
import { PAGE_SIZE } from "../../../config/appConfig";
import Spinner from 'react-bootstrap/Spinner';
import { useQuery } from "@tanstack/react-query";
import FeaturedArticlesSection from "../components/FeaturedArticlesSection";


export default function HomePage() {
    const { language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const articlesSectionRef = useRef(null);

    // Derive current page directly from URL search params to avoid duplicate state/race conditions
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const hasPageParam = searchParams.has("page");

    // Fetch main article using useQuery
    const { 
        data: mainArticle, 
        isLoading: loadingMain,
        error: mainArticleError 
    } = useQuery({
        queryKey: ['mainArticle'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("articles_secure")
                .select("id,\
                    title_en,\
                    title_bn,\
                    subtitle_en,\
                    subtitle_bn,\
                    created_at,\
                    cover_img_link,\
                    cover_img_cap_en,\
                    cover_img_cap_bn,\
                    article_slug,\
                    author_name,\
                    author_img_link,\
                    publish_author_email,\
                    author_email")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
    });

    // Fetch paginated articles using useQuery
    const { 
        data: articlesData, 
        isLoading: loadingOthers,
        error: articlesError 
    } = useQuery({
        queryKey: ['articles', currentPage],
        queryFn: async () => {
            const from = (currentPage - 1) * PAGE_SIZE + 1; // skip the first one
            const to = from + PAGE_SIZE - 1;

            const { data, count, error } = await supabase
                .from("articles_secure")
                .select("id,\
                    title_en,\
                    title_bn,\
                    subtitle_en,\
                    subtitle_bn,\
                    created_at,\
                    cover_img_link,\
                    article_slug,\
                    author_name,\
                    author_img_link,\
                    publish_author_email,\
                    author_email", { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;
            return {
                articles: data || [],
                total: (count || 0) - 1 // subtract the main article
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        keepPreviousData: true, // Keep showing old data while fetching new page
    });

    const others = articlesData?.articles || [];
    const total = articlesData?.total || 0;

    // Log errors to console
    useEffect(() => {
        if (mainArticleError) {
            console.error("Error fetching main article:", mainArticleError.message);
        }
        if (articlesError) {
            console.error("Error fetching articles:", articlesError.message);
        }
    }, [mainArticleError, articlesError]);

    // Scroll AFTER articles finish loading ONLY when explicit ?page= param is present
    useLayoutEffect(() => {
        if (!hasPageParam) return; // root path without page param: do not auto-scroll
        if (!loadingOthers && articlesSectionRef.current) {
            requestAnimationFrame(() => {
                articlesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                const top = articlesSectionRef.current.getBoundingClientRect().top + window.scrollY - 10;
                window.scrollTo({ top, behavior: "smooth" });
            });
        }
    }, [currentPage, loadingOthers, hasPageParam]);

    const handlePageChange = (pageNum) => {
        setSearchParams({ page: pageNum.toString() }); // updates URL ?page=2
    };


    const [fontFamily, setFontFamily] = useState('Roboto Serif');

    useEffect(() => {
        if (language === "en") setFontFamily('Roboto Serif');
        if (language === "bn") setFontFamily('"Noto Serif Bengali", serif');
    }, [language]);

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap" rel="stylesheet" />
            <div className={styles.homeContainer}>
                {/* Main Article */}
                <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                    <SearchBar className={styles.searchBarCenter} />
                </div>
                {loadingMain ? (
                    <div style={{ justifyContent: 'center' }} className={styles.mainSection}>

                        {/* <Spin className={styles.loader} indicator={<LoadingOutlined spin />} size="large" /> */}
                        <Spinner className={styles.loader} animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>

                    </div>
                ) : (
                    mainArticle && (
                        <Link to={`/article/${encodeId(mainArticle.id)}/${mainArticle.article_slug}`} className={styles.mainSection}>
                            <div className={styles.imageSection}>
                                <img
                                    src={mainArticle.cover_img_link}
                                    alt={mainArticle.title_en}
                                    className={styles.mainImage}
                                />

                            </div>


                            <div className={styles.inner_text_area}>
                                <div className={styles.textSection}>
                                    <h2 style={{ fontFamily: fontFamily }}>{language === "en" ? mainArticle.title_en : mainArticle.title_bn}</h2>
                                    <p style={{ fontFamily: fontFamily }}>{language === "en" ? mainArticle.subtitle_en : mainArticle.subtitle_bn}</p>

                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '13px' }}>
                                        <i className="fi fi-br-user-pen" style={{ fontSize: 16 }}></i>
                                        &nbsp;&nbsp;
                                        {mainArticle.author_name}
                                    </div>
                                    <div className={styles.date}>
                                        <div style={{ display: 'inline-block', transform: 'translateY(2px)' }}>
                                            <i className="fi fi-br-clock" style={{ fontSize: 14 }}></i>
                                        </div>
                                        
                                        &nbsp;&nbsp;
                                        {getFormattedTime(mainArticle.created_at)}
                                    </div>
                                </div>

                            </div>
                        </Link>
                    )
                )
                }
                <hr />
                <FeaturedArticlesSection />
                <hr />
                {/* Other Articles List */}
                <div ref={articlesSectionRef} className={styles.articlesSection}>
                    {loadingOthers ? (
                        <div className={styles.listLoader}>
                            {/* <Spin className={styles.content_loader} indicator={<LoadingOutlined spin />} size="large" /> */}
                            <Spinner className={styles.content_loader} animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <List
                            itemLayout="vertical"
                            size="large"
                            pagination={{
                                onChange: handlePageChange,
                                pageSize: PAGE_SIZE,
                                current: currentPage,
                                total: total,
                                align: "center",
                            }}
                            dataSource={others}
                            className={styles.articleContainer}
                            renderItem={(item) => (
                                <Link to={`/article/${encodeId(item.id)}/${item.article_slug}`} style={{ textDecoration: 'none' }}>
                                    <List.Item
                                        className={styles.articleItem}
                                        key={item.article_id}
                                        extra={
                                            <img
                                                className={styles.trailing_image}
                                                draggable={false}
                                                width={300}
                                                height={"auto"}
                                                alt={`${item.title_en} cover image`}
                                                src={item.cover_img_link}
                                            />
                                        }
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar src={item.author_img_link} />}
                                            title={
                                                <span style={{ fontSize: '21px', fontWeight: 'bold', fontFamily: fontFamily }} >
                                                    {language === "en" ? item.title_en : item.title_bn}
                                                </span>
                                            }
                                            //   description={item.subtitle_en}
                                            description={
                                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                                    <i className="fi fi-br-user-pen" style={{ fontSize: 17 }}></i>
                                                    &nbsp;&nbsp;
                                                    {item.author_name}
                                                </div>
                                            }
                                        />
                                        <div>
                                            {/* {item.content_en?.substring(0, 200)}... */}
                                            <div style={{ fontSize: '18px', fontWeight: '500', fontFamily: fontFamily }}>
                                                {language === "en" ? item.subtitle_en : item.subtitle_bn}
                                            </div>

                                            <br />
                                            <div className={styles.date} style={{ fontSize: 14, color: 'grey' }}>
                                                <div style={{ display: 'inline-block', transform: 'translateY(2px)' }}>
                                                    <i className="fi fi-br-clock" style={{ fontSize: 14, color: 'grey' }}></i>
                                                </div>
                                                &nbsp;&nbsp;
                                                {getFormattedTime(item.created_at)}
                                            </div>
                                        </div>
                                    </List.Item>
                                </Link>
                            )}
                        />
                    )}
                </div>
            </div >
            <div className={styles.blured_background}>
                <div className={styles.blured_color}></div>
            </div>
        </>
    );
}





