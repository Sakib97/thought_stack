import { useState } from "react";
import RTE from "../components/RTE";
import ArticleInfo from "../components/ArticleInfo";
import { Button } from "antd";
import styles from "../styles/WriteArticlePage.module.css";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../../config/supabaseClient";

const WriteArticlePage = () => {
    const [loading, setLoading] = useState(false);

    const handlePublish = async () => {
        setLoading(true);

        try {
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
            const { data, error } = await supabase.from("article").insert([
                {
                    ...articleInfo,
                    content_en: articleContentEn,
                    content_bn: articleContentBn,
                    created_at: new Date(),
                },
            ]);

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
            } else {
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
            }
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred.");
        }

        setLoading(false);
    };

    return (
        <div>
            <Toaster />
            <ArticleInfo />

            <RTE contentLanguage="en" />
            <hr />
            <RTE contentLanguage="bn" />

            <hr />

            <div className={styles.buttonContainer}>
                <div className={styles.warningMessage}>
                    Please save all your drafts before publishing !
                </div>
                <Button className={styles.publishButton}
                    type="primary"
                    onClick={handlePublish}
                    loading={loading}
                >
                    <i style={{ fontSize: 24, transform: "translateY(11%)" }} className="fi fi-br-progress-complete"></i>
                    Publish Article
                </Button>
            </div>
        </div>
    );
}

export default WriteArticlePage;