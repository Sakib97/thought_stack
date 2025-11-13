import styles from "../styles/ArticleDetails.module.css";
import { decodeId } from "../../../utils/hashUtil";
import { useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import { useLanguage } from "../../../context/LanguageProvider";
import { getFormattedTime } from "../../../utils/dateUtil";
import { useState, useEffect } from "react";
import ArticleReactions from "../components/ArticleReactions";
import { useAuth } from "../../../context/AuthProvider";
import ArticleComment from "../components/ArticleComment";
import Spinner from 'react-bootstrap/Spinner';
import { useQuery } from "@tanstack/react-query";

const ArticleDetails = () => {
    const { user, userMeta } = useAuth();
    const { articleID, articleTitleSlug } = useParams();
    const articleId = decodeId(articleID);

    const { language } = useLanguage();

    const [fontFamily, setFontFamily] = useState("Roboto Serif");
    useEffect(() => {
        if (language === "en") setFontFamily("Roboto Serif");
        if (language === "bn") setFontFamily('"Noto Serif Bengali", serif');
    }, [language]);

    // Scroll to top when article changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [articleId]);

    // Fetch article using useQuery
    const {
        data: article,
        isLoading: loading,
        error: fetchError
    } = useQuery({
        queryKey: ['article', articleId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("articles_secure")
                .select(
                    "title_en,\
                    title_bn,\
                    subtitle_en,\
                    subtitle_bn,\
                    content_en,\
                    content_bn,\
                    created_at,\
                    cover_img_link,\
                    cover_img_cap_en,\
                    cover_img_cap_bn,\
                    author_name,\
                    author_img_link,\
                    publish_author_email,\
                    author_email, \
                    article_slug , \
                    event_title_en, \
                    event_title_bn \
                    "
                )
                .eq("id", articleId)
                .single();

            if (error) throw error;
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        enabled: !!articleId, // Only run query if articleId exists
    });

    const { data: audioExists } = useQuery({
        queryKey: ["article-audio-exists", article?.article_slug, language],
        enabled: !!article?.article_slug && !!language,
        queryFn: async () => {
            const folder = language === "bn" ? "bn" : "en";
            const filename = `${article.article_slug}_${language}.mp3`;
            const { data, error } = await supabase
                .storage
                .from("article-audio")
                .list(folder, { search: filename, limit: 1 });

            if (error) throw error;
            return Array.isArray(data) && data.some(f => f.name === filename);
        },
        staleTime: 20 * 60 * 1000, // 20 minutes
    });

    // Fetch audio URL from Supabase Storage based on language and slug
    const {
        data: audioUrl,
        isLoading: audioLoading,
        error: audioError,
    } = useQuery({
        queryKey: ["article-audio", article?.article_slug, language],
        enabled: !!article?.article_slug && !!language,
        queryFn: async () => {
            // Files are stored in bucket 'article-audio' under /en and /bn
            const folder = language === "bn" ? "bn" : "en";
            const filename = `${article.article_slug}_${language}.mp3`;
            const path = `${folder}/${filename}`;

            // If bucket is public, getPublicUrl is enough (no network request)
            const { data } = supabase.storage
                .from("article-audio")
                .getPublicUrl(path);

            // If bucket is private, switch to createSignedUrl:
            // const { data, error } = await supabase.storage
            //   .from('article-audio')
            //   .createSignedUrl(path, 60 * 60); // 1 hour
            // if (error) throw error;

            // Set audio availability based on whether the URL exists
            console.log("audio data: ", data);


            return data.publicUrl;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const error = fetchError?.message;

    if (loading) {
        return (
            <div
                className={styles.article}
                style={{ textAlign: "center", padding: "2rem", height: "60vh" }}
            >
                {/* <Spin indicator={<LoadingOutlined spin />} size="large" /> */}
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error || !article || article.article_slug !== articleTitleSlug) {
        return (
            <div
                className={styles.article}
                style={{
                    textAlign: "center",
                    padding: "2rem",
                    height: "100vh",
                }}
            >
                <p>Could not load article.</p>
            </div>
        );
    }

    const title = language === "en" ? article.title_en : article.title_bn;
    const description =
        language === "en"
            ? article.subtitle_en
            : article.subtitle_bn || "Read this article on Thought Stack.";
    const imageUrl = article.cover_img_link;
    const url = window.location.href;
    // console.log("url:", url);



    return (
        <>
            <div>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap"
                    rel="stylesheet"
                />
                <div className={`${styles.article}`}>
                    <div className={`containers ${styles.articleContainer}`}>
                        <div className={`${styles.articleHead}`}>
                            <h6 style={{ color: 'grey', fontFamily: fontFamily }}>
                                {language === "en" ? article.event_title_en
                                    : article.event_title_bn} </h6>

                            <h1 style={{ fontFamily: fontFamily }}>
                                {language === "en"
                                    ? article.title_en
                                    : article.title_bn}
                            </h1>
                            <span style={{ fontSize: '19px', fontFamily: fontFamily }}>
                                {language === "en"
                                    ? article.subtitle_en
                                    : article.subtitle_bn}
                            </span>
                            <img
                                src={article.cover_img_link}
                                alt={
                                    language === "en"
                                        ? article.title_en
                                        : article.title_bn
                                }
                                className={styles.articleImage}
                            />

                            <div
                                className={`${styles.articleImageCaption}`}
                                style={{ fontFamily: fontFamily }}
                            >
                                {language === "en"
                                    ? article.cover_img_cap_en
                                    : article.cover_img_cap_bn}
                            </div>

                            <div className={`${styles.authorAndDateOfArticle}`}>
                                <div className={`${styles.authorPicOfArticle}`}>
                                    <img
                                        src={article.author_img_link}
                                        alt={article.author_name}
                                        className={styles.authorPicOfArticle}
                                    />
                                </div>
                                <div className={`${styles.authorNameOfArticle}`}>
                                    <span
                                        style={{
                                            color: "black",
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            fontFamily: fontFamily,
                                        }}
                                    >
                                        {article.author_name}
                                    </span>

                                    <br />
                                    <div
                                        style={{ fontSize: "13px", color: "gray" }}
                                    >
                                        {getFormattedTime(article.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr />

                        {/* Article Body */}
                        <div className={`${styles.articleBody}`}>
                            {/* audio transcript section */}
                            <div style={{ textAlign: 'center' }}>
                                {audioLoading && (
                                    <div style={{ padding: "0.5rem" }}>
                                        <Spinner animation="border" role="status" size="sm">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                )}
                                {!audioLoading && audioUrl && audioExists && (
                                    <audio
                                        key={`${articleId}-${language}`}
                                        src={audioUrl}
                                        controls
                                        preload="metadata"
                                        style={{ width: "100%" }}
                                    />
                                )}
                                {!audioLoading && !audioUrl && (
                                    <div style={{ fontSize: "14px", color: "gray" }}>
                                        {audioError ? "Audio unavailable" : "No audio provided for this article."}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{ textAlign: "justify", fontSize: "18px" }}
                                className={`${styles.articleBodyText}`}
                            >
                                <div
                                    style={{ textAlign: "justify" }}
                                    className={styles.articleBodyText}
                                >
                                    <div
                                        style={{
                                            textAlign: "justify",
                                            fontFamily: fontFamily,
                                        }}
                                        className={styles.articleBodyText}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                language === "en"
                                                    ? article.content_en
                                                    : article.content_bn,
                                        }}
                                    />
                                </div>
                            </div>

                            <hr />
                            {/* disclaimer section*/}
                            <div>
                                <div
                                    style={{
                                        fontStyle: "italic",
                                        fontSize: "14px",
                                        color: "#666",
                                        marginBottom: "13px",
                                        fontFamily: fontFamily,
                                    }}
                                >
                                    {language === "en"
                                        ? "* The views and opinions expressed in this article are author's own and do not necessarily reflect the publisher's point of view."
                                        : "* লেখকের নিজস্ব মতামত "}
                                </div>
                                <div
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        color: "#666",
                                        marginBottom: "13px",
                                    }}
                                >
                                    {article.publish_author_email && (
                                        <>Author Email: {article.author_email}</>
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr />
                        <ArticleReactions
                            articleId={articleId}
                            userId={user?.id}
                            isActive={userMeta?.is_active}
                        />
                        <hr />
                        <ArticleComment articleId={articleId} userMeta={userMeta} />

                    </div>

                </div>
            </div>
        </>
    );
};

export default ArticleDetails;