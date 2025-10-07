import styles from "../styles/ArticleDetails.module.css";
import { decodeId } from "../../../utils/hashUtil";
import { useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import { useLanguage } from "../../../context/LanguageProvider";
import { getFormattedTime } from "../../../utils/dateUtil";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import ArticleReactions from "../components/ArticleReactions";
import { useAuth } from "../../../context/AuthProvider";
import ArticleComment from "../components/ArticleComment";

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
                    author_email"
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
                style={{ textAlign: "center", padding: "2rem" }}
            >
                <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
        );
    }

    if (error || !article) {
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

    return (
        <div>
            <link
                href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap"
                rel="stylesheet"
            />
            <div className={`${styles.article}`}>
                <div className={`container`}>
                    <div className={`${styles.articleHead}`}>
                        <h1 style={{ fontFamily: fontFamily }}>
                            {language === "en"
                                ? article.title_en
                                : article.title_bn}
                        </h1>
                        <span style={{ fontFamily: fontFamily }}>
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
                                    ? "* The views and opinions expressed in this article are author's own and does not necessarily reflect the publisher's point of view."
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
                </div>

                <ArticleComment articleId={articleId} userMeta={userMeta} />
            </div>
        </div>
    );
};

export default ArticleDetails;