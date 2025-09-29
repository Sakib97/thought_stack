import styles from "../styles/ArticleDetails.module.css";
import { decodeId } from "../../../utils/hashUtil";
import { useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import { useLanguage } from "../../../context/LanguageProvider";
import { getFormattedTime } from "../../../utils/dateUtil";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const ArticleDetails = () => {
    const { articleID, articleTitleSlug } = useParams();
    const articleId = decodeId(articleID);
    // console.log("articleId", articleId);
    // console.log("articleTitleSlug", articleTitleSlug);
    const { language } = useLanguage();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArticle = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("articles")
            .select("*")
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
            <div className={styles.article} style={{ textAlign: "center", padding: "2rem" }}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className={styles.article} style={{ textAlign: "center", padding: "2rem" }}>
                <p>Could not load article.</p>
            </div>
        );
    }
    return (
        <div>
            <div className={`${styles.article}`}>
                <div className={`container`}>
                    {/* <GoToTopButton /> */}

                    <div className={`${styles.articleHead}`}>
                        <h1>{language === "en" ? article.title_en : article.title_bn}</h1>
                        <span>{language === "en" ? article.subtitle_en : article.subtitle_bn}</span>

                        <img
                            src={article.cover_img_link}
                            alt={language === "en" ? article.title_en : article.title_bn}
                            className={styles.articleImage}
                        />

                        <div className={`${styles.articleImageCaption}`}>
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
                                <span style={{ color: "black", fontSize: "18px", fontWeight: "bold" }}>
                                    {article.author_name}
                                </span>

                                <br />
                                <div style={{ fontSize: '13px', color: 'gray' }}>
                                    {getFormattedTime(article.created_at)}
                                </div>
                            </div>
                        </div>

                    </div>
                    <hr />

                    {/* Article Body */}
                    <div className={`${styles.articleBody}`}>
                        <div style={{ textAlign: "justify", fontSize: "18px" }} className={`${styles.articleBodyText}`}>
                            <div
                                style={{ textAlign: "justify", fontSize: "18px" }}
                                className={styles.articleBodyText}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        language === "en" ? article.content_en : article.content_bn,
                                }}
                            />
                            {/* {!isEnglish && <SafeHtmlRenderer html={articleData.article.content_bn} />} */}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default ArticleDetails;