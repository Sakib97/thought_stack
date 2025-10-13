import { useState } from "react";
import RTE from "../components/RTE";
import ArticleInfo from "../components/ArticleInfo";
import { Button, Modal } from "antd";
import styles from "../styles/WriteArticlePage.module.css";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../../config/supabaseClient";
import { deSlugify, slugify } from "../../../utils/slugAndStringUtil";
import { useAuth } from "../../../context/AuthProvider";
import { encodeId } from "../../../utils/hashUtil";
import GoToTopButton from "../../../components/layout/GoToTopButton";

const WriteArticlePage = () => {
    const [showModal, setShowModal] = useState(false);
    const { user, userMeta } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadedArticleLink, setUploadedArticleLink] = useState(null);

    // Lifting RTE state to parent (WriteArticlePage)
    const [contentEn, setContentEn] = useState(localStorage.getItem("articleContent_en") || "");
    const [contentBn, setContentBn] = useState(localStorage.getItem("articleContent_bn") || "");


    const handlePublish = async () => {
        setLoading(true);

        try {
            if (!userMeta?.is_active || !["admin", "editor"].includes(userMeta?.role)) {
                // toast.error("You are not allowed to publish articles.");
                toast('You are not allowed to publish articles !',
                    {
                        icon: <i style={{ color: "red", fontSize: '23px' }} className="fi fi-br-cross-circle"></i>,
                        style: {
                            borderRadius: '10px',
                            background: '#fff',
                            color: 'black',
                            border: '2px solid red',
                            fontSize: '18px',
                        },
                        duration: 2000
                    })
                setLoading(false);
                setShowModal(false);
                return;
            }
            // Get local storage values
            const articleInfo = JSON.parse(localStorage.getItem("articleInfo"));
            const articleContentEn = localStorage.getItem("articleContent_en");
            const articleContentBn = localStorage.getItem("articleContent_bn");

            // Check if data exists
            if (!articleInfo || !articleContentEn || !articleContentBn) {
                // toast.error("Missing draft data. Save all drafts before publishing.");
                toast('Missing draft data. Save all drafts before publishing.',
                    {
                        icon: <i style={{ color: "red", fontSize: '23px' }} className="fi fi-br-cross-circle"></i>,
                        style: {
                            borderRadius: '10px',
                            background: '#fff',
                            color: 'black',
                            border: '2px solid red',
                            fontSize: '18px',
                        },
                        duration: 3000
                    })
                setLoading(false);
                setShowModal(false);
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
                toast('Please fill in all required article info before publishing.',
                    {
                        icon: <i style={{ color: "red", fontSize: '23px' }} className="fi fi-br-cross-circle"></i>,
                        style: {
                            borderRadius: '10px',
                            background: '#fff',
                            color: 'black',
                            border: '2px solid red',
                            fontSize: '18px',
                        },
                        duration: 3000
                    })
                setLoading(false);
                return;
            }

            // Insert into Supabase
            const { data, error } = await supabase.from("articles").insert([
                {
                    ...articleInfo,
                    content_en: articleContentEn,
                    content_bn: articleContentBn,
                    created_at: new Date(),
                    article_status: "accepted",
                    article_slug: slugify(articleInfo.title_en),
                    editor_name: userMeta?.name,
                    editor_email: userMeta?.email
                },
            ])
                .select();
            console.log("data", data);

            if (error) {
                console.error(error);
                // toast.error("Failed to publish article. Please try again.");
                toast('Failed to publish article. Please try again.',
                    {
                        icon: <i style={{ color: "red", fontSize: '23px' }} className="fi fi-br-cross-circle"></i>,
                        style: {
                            borderRadius: '10px',
                            background: '#fff',
                            color: 'black',
                            border: '2px solid red',
                            fontSize: '18px',
                        },
                        duration: 3000
                    });
            } else if (data) {
                console.log("data", data);

                const insertedArticle = data[0];
                const articleId = encodeId(insertedArticle.id);
                const articleSlug = slugify(articleInfo.title_en);
                const articleUrl = `${window.location.origin}/article/${articleId}/${articleSlug}`;

                setUploadedArticleLink(articleUrl);

                // toast.success("Article published successfully!");
                toast('Article published successfully!',
                    {
                        icon: <i style={{ color: "green", fontSize: '23px' }} className="fi fi-rr-check-circle"></i>,
                        style: {
                            borderRadius: '10px',
                            background: '#fff',
                            color: 'black',
                            border: '2px solid green',
                            fontSize: '18px',
                        },
                        duration: 3000
                    });

                // Optionally clear localStorage after publishing
                localStorage.removeItem("articleInfo");
                localStorage.removeItem("articleContent_en");
                localStorage.removeItem("articleContent_bn");

                // Clear RTE editors
                setContentEn("");
                setContentBn("");
            }
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred.");
        }

        setLoading(false);
        setShowModal(false);
    };

    return (
        <div>
            <Toaster />
            <ArticleInfo />

            <RTE contentLanguage="en" content={contentEn} setContent={setContentEn} />
            <hr />
            <RTE contentLanguage="bn" content={contentBn} setContent={setContentBn} />

            <hr />

            {userMeta?.is_active && ["admin", "editor"].includes(userMeta?.role)
                && !uploadedArticleLink &&
                (
                    <div className={styles.buttonContainer}>
                        <div className={styles.warningMessage}>
                            Please save all your drafts before publishing !
                        </div>
                        <Button className={styles.publishButton}
                            type="primary"
                            // onClick={handlePublish}
                            onClick={() => setShowModal(true)}
                            loading={loading}
                            iconPosition="end"
                        >
                            <i style={{ fontSize: 25, transform: "translateY(8%)" }} className="fi fi-rr-shield-trust"></i>
                            Publish Article
                        </Button>
                    </div>
                )}

            < Modal
                title={<span style={{ fontSize: "20px", fontWeight: "bold" }}>Publish Article ?</span>}
                centered
                open={showModal}
                onOk={handlePublish}
                onCancel={() => setShowModal(false)}
                okText="Confirm"
                confirmLoading={loading}
                okButtonProps={{
                    style: {
                        backgroundColor: "green",
                        borderColor: "green",
                        fontSize: "16px",   // increase font size
                    },
                }}
                cancelText="Cancel"
                cancelButtonProps={{
                    style: {
                        fontSize: "16px",   // match cancel button size if you want
                    },
                }}
            >
                <div style={{ fontSize: "18px", marginBottom: "15px" }}>
                    Please save all the drafts before publishing.
                </div>

            </Modal>

            {uploadedArticleLink && (
                <div className={styles.articleLinkContainer}
                    style={{
                        marginTop: "20px", fontSize: "20px",
                        textAlign: "center"
                    }}>
                    <span>View your published article: </span>
                    <a
                        href={uploadedArticleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "green", fontWeight: "bold" }}
                    >
                        {uploadedArticleLink}
                    </a>
                </div>

            )}

        </div >
    );
}

export default WriteArticlePage;