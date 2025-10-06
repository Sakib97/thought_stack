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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import Comment from "../components/Comment";
import commentsData from "../components/comments.json";

const ArticleDetails = () => {
    const { user, userMeta } = useAuth();
    // console.log("user", userMeta.is_active);

    const { articleID, articleTitleSlug } = useParams();
    const articleId = decodeId(articleID);
    // console.log("articleId", articleId);
    // console.log("articleTitleSlug", articleTitleSlug);
    const { language } = useLanguage();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [fontFamily, setFontFamily] = useState("Roboto Serif");
    // ArticleDetails component
    const [commentText, setCommentText] = useState("");
    const [showCommentForm, setShowCommentForm] = useState(false);

    // handle comment submission
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            // TODO: Implement comment submission to backend
            console.log("Submitting comment:", commentText);
            setCommentText("");
            setShowCommentForm(false);
        }
    };

    const handleCommentCancel = () => {
        setCommentText("");
        setShowCommentForm(false);
    };

    useEffect(() => {
        if (language === "en") setFontFamily("Roboto Serif");
        if (language === "bn") setFontFamily('"Noto Serif Bengali", serif');
    }, [language]);

    const fetchArticle = async () => {
        setLoading(true);
        const { data, error } = await supabase
            // .from("articles")
            .from("articles_secure")
            // .select("*")
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
            // .eq("article_status", "accepted")
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
                    {/* <GoToTopButton /> */}

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
                            {/* {!isEnglish && <SafeHtmlRenderer html={articleData.article.content_bn} />} */}
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
                <div className={styles.commentsSection}>
                    <h3
                        style={{ marginBottom: "20px", fontFamily: fontFamily }}
                    >
                        <FontAwesomeIcon
                            icon={faComment}
                            style={{ marginRight: "10px" }}
                        />
                        {language === "en" ? "Comments" : "মন্তব্য"} (
                        {commentsData.comments.length})
                    </h3>

                    {/* Comment Form */}
                    <div className={styles.commentForm}>
                        <div className={styles.commentFormAvatar}>
                            <img
                                src={
                                    user?.user_metadata?.avatar_url ||
                                    "https://via.placeholder.com/40"
                                }
                                alt="Your avatar"
                            />
                        </div>
                        <div className={styles.commentInputContainer}>
                            {!showCommentForm ? (
                                <input
                                    type="text"
                                    placeholder={
                                        language === "en"
                                            ? "Add a comment..."
                                            : "মন্তব্য যোগ করুন..."
                                    }
                                    className={styles.commentInput}
                                    onFocus={() => setShowCommentForm(true)}
                                    readOnly
                                />
                            ) : (
                                <form
                                    onSubmit={handleCommentSubmit}
                                    className={styles.commentFormActive}
                                >
                                    <textarea
                                        placeholder={
                                            language === "en"
                                                ? "Add a comment..."
                                                : "মন্তব্য যোগ করুন..."
                                        }
                                        value={commentText}
                                        onChange={(e) =>
                                            setCommentText(e.target.value)
                                        }
                                        className={styles.commentTextarea}
                                        rows="4"
                                        autoFocus
                                    />
                                    <div className={styles.commentFormButtons}>
                                        <button
                                            type="button"
                                            className={styles.commentCancelBtn}
                                            onClick={handleCommentCancel}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.commentSubmitBtn}
                                            disabled={!commentText.trim()}
                                        >
                                            <FontAwesomeIcon
                                                icon={faPaperPlane}
                                                style={{ marginRight: "5px" }}
                                            />
                                            Comment
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className={styles.commentsList}>
                        {commentsData.comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                user={user}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetails;
