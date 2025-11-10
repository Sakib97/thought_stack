import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RTE from "../components/RTE";
import ArticleInfo from "../components/ArticleInfo";
import { Button, Modal } from "antd";
import styles from "../styles/WriteArticlePage.module.css";
import { Toaster } from "react-hot-toast";
import { supabase } from "../../../config/supabaseClient";
import { slugify } from "../../../utils/slugAndStringUtil";
import { useAuth } from "../../../context/AuthProvider";
import { encodeId, decodeId } from "../../../utils/hashUtil";
import { showToast } from "../../../components/layout/CustomToast";
import Spinner from 'react-bootstrap/Spinner';
import { useQueryClient } from "@tanstack/react-query";

const WriteArticlePage = () => {
    const [showModal, setShowModal] = useState(false);
    const { userMeta } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadedArticleLink, setUploadedArticleLink] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [articleId, setArticleId] = useState(null);

    const [editInfoLoading, setEditInfoLoading] = useState(false);
    const [articleStatus, setArticleStatus] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [contentEn, setContentEn] = useState(localStorage.getItem("articleContent_en") || "");
    const [contentBn, setContentBn] = useState(localStorage.getItem("articleContent_bn") || "");

    // Prevent fetching article data on mount
    const hasFetched = useRef(false);

    // Detect edit mode and decode ID
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editParam = params.get("edit");
        const encodedId = params.get("articleId");

        if (editParam === "true" && encodedId && !hasFetched.current) {
            hasFetched.current = true; // Prevent duplicate fetch
            const decodedId = decodeId(encodedId);
            setIsEditMode(true);
            setArticleId(decodedId);
            fetchArticleData(decodedId);
        } else if (!editParam) {
            // Only clear edit data, not normal drafts
            setIsEditMode(false);
            setArticleId(null);
            setArticleStatus("");
            localStorage.removeItem("articleEditInfo");
            localStorage.removeItem("articleEditContent_en");
            localStorage.removeItem("articleEditContent_bn");
            setContentEn(localStorage.getItem("articleContent_en") || "");
            setContentBn(localStorage.getItem("articleContent_bn") || "");
        }
    }, [location.search]);

    // Fetch article and apply role restrictions
    const fetchArticleData = async (id) => {
        setEditInfoLoading(true);
        try {
            const { data, error } = await supabase
                .from("articles")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                showToast("Article not found!", "error");
                // navigate("/dashboard/manage-articles");
                localStorage.removeItem("articleEditInfo");
                localStorage.removeItem("articleEditContent_en");
                localStorage.removeItem("articleEditContent_bn");
                return;
            }

            // Role-based restriction
            if (userMeta?.role === "editor" && data.editor_email !== userMeta?.email) {
                showToast("You are not allowed to edit this article.", "error");
                // navigate("/dashboard/manage-articles");
                localStorage.removeItem("articleEditInfo");
                localStorage.removeItem("articleEditContent_en");
                localStorage.removeItem("articleEditContent_bn");
                return;
            }
            setArticleStatus(data.article_status);

            //  Preload info under EDIT keys
            localStorage.setItem("articleEditInfo", JSON.stringify(data));
            localStorage.setItem("articleEditContent_en", data.content_en || "");
            localStorage.setItem("articleEditContent_bn", data.content_bn || "");

            setContentEn(data.content_en || "");
            setContentBn(data.content_bn || "");

            // toast.success("Article loaded for editing!");
            showToast("Article loaded for editing!", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to load article data.", "error");
            // navigate("/dashboard/manage-articles");
        } finally {
            setEditInfoLoading(false);
        }
    };

    // Handle Publish/Edit
    const handlePublish = async () => {
        setLoading(true);
        try {
            // const articleInfo = JSON.parse(localStorage.getItem("articleInfo"));
            // const articleContentEn = localStorage.getItem("articleContent_en");
            // const articleContentBn = localStorage.getItem("articleContent_bn");

            const infoKey = isEditMode ? "articleEditInfo" : "articleInfo";
            const enKey = isEditMode ? "articleEditContent_en" : "articleContent_en";
            const bnKey = isEditMode ? "articleEditContent_bn" : "articleContent_bn";

            const articleInfo = JSON.parse(localStorage.getItem(infoKey));
            const articleContentEn = localStorage.getItem(enKey);
            const articleContentBn = localStorage.getItem(bnKey);

            if (!articleInfo || !articleContentEn || !articleContentBn) {
                showToast("Missing article data.", "error");
                setLoading(false);
                return;
            }

            // Required fields check
            const requiredFields = [
                "title_en",
                "subtitle_en",
                "title_bn",
                "subtitle_bn",
                "cover_img_link",
                "cover_img_cap_en",
                "cover_img_cap_bn",
                "author_name",
                "author_img_link",
                "author_email",
            ];

            const missingFields = requiredFields.filter(
                (field) => !articleInfo[field] || articleInfo[field].trim() === ""
            );

            if (missingFields.length > 0) {
                // toast.error("Please fill in all required fields before publishing.");
                showToast("Please fill in all required article info before publishing.", "error");
                setLoading(false);
                return;
            }

            if (isEditMode) {
                // UPDATE article
                const { data: editedData, error } = await supabase
                    .from("articles")
                    .update({
                        ...articleInfo,
                        content_en: articleContentEn,
                        content_bn: articleContentBn,
                        article_slug: slugify(articleInfo.title_en),
                        updated_at: new Date().toISOString(),
                        updated_by: userMeta?.email,
                    })
                    .eq("id", articleId)
                    .select(); // this ensures data is returned;

                if (error) throw error;
                
                // Invalidate queries to refresh article lists
                queryClient.invalidateQueries(['mainArticle']);
                queryClient.invalidateQueries(['articles']);
                
                showToast("Article updated successfully!", "success");
                // Clear only edit keys after successful update
                localStorage.removeItem("articleEditInfo");
                localStorage.removeItem("articleEditContent_en");
                localStorage.removeItem("articleEditContent_bn");

                // Clear RTE editors
                setContentEn("");
                setContentBn("");

                const inserted = editedData[0];
                const articleUrl = `${window.location.origin}/article/${encodeId(inserted.id)}/${slugify(articleInfo.title_en)}`;
                setUploadedArticleLink(articleUrl);

            } else {
                // INSERT new article
                if (!userMeta?.is_active && !["admin", "editor"].includes(userMeta?.role)) {
                    showToast("You are not allowed to publish articles!", "error");
                    setLoading(false);
                    setShowModal(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("articles")
                    .insert([
                        {
                            ...articleInfo,
                            content_en: articleContentEn,
                            content_bn: articleContentBn,
                            created_at: new Date(),
                            article_status: "accepted",
                            article_slug: slugify(articleInfo.title_en),
                            editor_name: userMeta?.name,
                            editor_email: userMeta?.email,
                        },
                    ])
                    .select();

                if (error) throw error;

                // Invalidate queries to refresh article lists
                queryClient.invalidateQueries(['mainArticle']);
                queryClient.invalidateQueries(['articles']);

                const inserted = data[0];
                const articleUrl = `${window.location.origin}/article/${encodeId(inserted.id)}/${slugify(articleInfo.title_en)}`;
                setUploadedArticleLink(articleUrl);

                showToast("Article published successfully!", "success");
                // Clear normal local storage after successful action
                localStorage.removeItem("articleInfo");
                localStorage.removeItem("articleContent_en");
                localStorage.removeItem("articleContent_bn");

                // Clear RTE editors
                setContentEn("");
                setContentBn("");
            }

            setShowModal(false);
        } catch (err) {
            console.error(err);
            showToast("Error while saving article !", "error");
        }
        setLoading(false);
    };

    // for modal open and close
    const handleClose = () => setShowModal(false);
    const handleShow = () => {
        const allowedRoles = ['admin', 'editor'];

        // Prevent unauthorized or inactive users
        if (!allowedRoles.includes(userMeta?.role)) {
            showToast('Only admin or editor can submit article!', 'error');
            return;
        }

        if (userMeta?.is_active === false) {
            showToast('Inactive users cannot submit article.', 'error');
            return;
        }

        setShowModal(true);
    };

    return (
        <div>
            <Toaster />
            {editInfoLoading &&
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            }
            {articleStatus === "restricted" &&
                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#e05307', fontWeight: '700', fontSize: '15px' }}>
                        Warning: This article is currently restricted to users !
                    </span>
                </div>}
            <ArticleInfo isEditMode={isEditMode} />
            <RTE contentLanguage="en" content={contentEn}
                setContent={setContentEn} isEditMode={isEditMode} />
            <hr />
            <RTE contentLanguage="bn" content={contentBn}
                setContent={setContentBn} isEditMode={isEditMode} />
            <hr />

            <div className={styles.buttonContainer}>
                <div className={styles.warningMessage}>
                    Please save all your drafts before {isEditMode ? "editing" : "publishing"}!
                </div>
                <Button
                    className={styles.publishButton}
                    type="primary"
                    // onClick={() => setShowModal(true)}
                    onClick={handleShow}
                    loading={loading}
                >
                    <i
                        style={{ fontSize: 25, transform: "translateY(8%)" }}
                        className={`fi fi-rr-${isEditMode ? "edit" : "shield-trust"}`}
                    ></i>
                    {isEditMode ? "Edit Article" : "Publish Article"}
                </Button>
            </div>

            <Modal
                title={
                    <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                        {isEditMode ? "Confirm Edit" : "Publish Article?"}
                    </span>
                }
                centered
                open={showModal}
                onOk={handlePublish}
                // onCancel={() => setShowModal(false)}
                onCancel={handleClose}
                okText="Confirm"
                confirmLoading={loading}
            >
                <div style={{ fontSize: "18px", marginBottom: "15px" }}>
                    {isEditMode
                        ? "Do you want to save changes to this article?"
                        : "Please save all drafts before publishing."}
                </div>
            </Modal>

            {uploadedArticleLink && (
                <div
                    className={styles.articleLinkContainer}
                    style={{
                        marginTop: "20px",
                        fontSize: "20px",
                        textAlign: "center",
                    }}
                >
                    {articleStatus !== "restricted" ? <>
                        <span>View your {isEditMode ? "edited" : "published"} article: </span>
                        <a
                            href={uploadedArticleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "green", fontWeight: "bold" }}
                        >
                            {uploadedArticleLink}
                        </a>
                    </>
                        :
                        <>
                            <span style={{ fontSize: '18px', color: '#e05307', fontWeight: '700' }}>
                                The article is currently restricted to users ! </span>
                            <br />
                            Article will available in the following link if restriction is lifted: <br />
                            <span style={{ fontSize: '18px', color:'#046b36', fontWeight: '700' }}>
                                {uploadedArticleLink}
                            </span>

                        </>
                    }
                </div>
            )}
        </div>
    );
};

export default WriteArticlePage;
