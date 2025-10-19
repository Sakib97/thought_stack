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
import { Helmet } from "@dr.pogodin/react-helmet";

const ArticleDetails = () => {
    const { user, userMeta } = useAuth();
    const { articleID, articleTitleSlug } = useParams();
    const articleId = decodeId(articleID);

    const { language } = useLanguage();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fontFamily, setFontFamily] = useState("Roboto Serif");

    useEffect(() => {
        if (language === "en") setFontFamily("Roboto Serif");
        if (language === "bn") setFontFamily('"Noto Serif Bengali", serif');
    }, [language]);

    const fetchArticle = async () => {
        setLoading(true);
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

        if (error) {
            console.error("Error fetching article:", error.message);
            setError(error.message);
        } else {
            setArticle(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

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
            <Helmet>
                <title>{`${title} | Thought Stack`}</title>
                <meta name="description" content={description} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={imageUrl} />
                <meta property="og:url" content={url} />
                <meta property="og:site_name" content="Thought Stack" />


                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={imageUrl} />
            </Helmet>

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