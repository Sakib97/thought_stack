import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabaseClient";
import { List, Avatar, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import { getFormattedTime } from "../../../utils/dateUtil";
import { encodeId, decodeId } from "../../../utils/hashUtil";
import { useLanguage } from "../../../context/LanguageProvider";

const pageSize = 2;

export default function HomePage() {
    const { language } = useLanguage();

    const [mainArticle, setMainArticle] = useState(null);
    const [others, setOthers] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [loadingMain, setLoadingMain] = useState(true);
    const [loadingOthers, setLoadingOthers] = useState(true);

    // Fetch main article once
    const fetchMainArticle = async () => {
        setLoadingMain(true);
        const { data, error } = await supabase
            .from("articles_secure")
            .select("id,\
                title_en,\
                    title_bn,\
                    subtitle_en,\
                    subtitle_bn,\
                    content_en,\
                    content_bn,\
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
            .limit(1);

        if (error) {
            console.error("Error fetching main article:", error.message);
        } else if (data && data.length > 0) {
            setMainArticle(data[0]);
            // console.log("main article encode id", encodeId(data[0].id));
            // console.log("main article decode id", decodeId(encodeId(data[0].id)));


        }
        setLoadingMain(false);
    };

    // Fetch paginated list excluding main article
    const fetchArticles = async (pageNum = 1) => {
        setLoadingOthers(true);

        const from = (pageNum - 1) * pageSize + 1; // skip the first one
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
            .from("articles_secure")
            .select("id,\
                title_en,\
                    title_bn,\
                    subtitle_en,\
                    subtitle_bn,\
                    content_en,\
                    content_bn,\
                    created_at,\
                    cover_img_link,\
                    article_slug,\
                    author_name,\
                    author_img_link,\
                    publish_author_email,\
                    author_email", { count: "exact" })
            // .eq("article_status", "accepted")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching articles:", error.message);
        } else {
            setOthers(data || []);
            setTotal((count || 0) - 1); // subtract the main article
        }
        setLoadingOthers(false);
    };

    useEffect(() => {
        fetchMainArticle();
    }, []);

    useEffect(() => {
        // fetchMainArticle();
        fetchArticles(page);
    }, [page]);

    return (
        <div className={`${styles.homeContainer} container`}>
            {/* Main Article */}
            {loadingMain ? (
                <div style={{ justifyContent: 'center' }} className={styles.mainSection}>
                    <Spin indicator={<LoadingOutlined spin />} size="large" />

                </div>
            ) : (
                mainArticle && (
                    <div className={styles.mainSection}>
                        <div className={styles.textSection}>
                            <Link
                                className={styles.linkStyle}
                                to={`/article/${encodeId(mainArticle.id)}/${mainArticle.article_slug}`}>
                                <h2>{language === "en" ? mainArticle.title_en : mainArticle.title_bn}</h2>
                                <p>{language === "en" ? mainArticle.subtitle_en : mainArticle.subtitle_bn}</p>
                            </Link>


                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '13px' }}>
                                <i className="fi fi-br-user-pen" style={{ fontSize: 14 }}></i>
                                &nbsp;&nbsp;
                                {mainArticle.author_name}
                            </div>
                            <div className={styles.date}>
                                <i className="fi fi-br-clock" style={{ fontSize: 15 }}></i>
                                &nbsp;&nbsp;
                                {getFormattedTime(mainArticle.created_at)}
                            </div>
                        </div>
                        <div className={styles.imageSection}>
                            <img
                                src={mainArticle.cover_img_link}
                                alt={mainArticle.title_en}
                                className={styles.mainImage}
                            />
                        </div>
                    </div>
                )
            )
            }
            <hr />
            {/* Other Articles List */}
            <div className={styles.articlesSection}>
                {loadingOthers ? (
                    <div className={styles.listLoader}>
                        <Spin indicator={<LoadingOutlined spin />} size="large" />
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        size="large"
                        pagination={{
                            onChange: (pageNum) => setPage(pageNum),
                            pageSize: pageSize,
                            current: page,
                            total: total,
                            align: "center",
                        }}
                        dataSource={others}
                        renderItem={(item) => (
                            <List.Item
                                key={item.article_id}
                                extra={
                                    <img
                                        draggable={false}
                                        width={300}
                                        height={"auto"}
                                        alt="cover"
                                        src={item.cover_img_link}
                                    />
                                }
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={item.author_img_link} />}
                                    title={
                                        <Link to={`/article/${encodeId(item.id)}/${item.article_slug}`}>
                                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                {language === "en" ? item.title_en : item.title_bn}
                                            </span>
                                        </Link>
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
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                        {language === "en" ? item.subtitle_en : item.subtitle_bn}
                                    </div>

                                    <br />
                                    <span className={styles.date}>
                                        <i className="fi fi-br-clock" style={{ fontSize: 17 }}></i>
                                        &nbsp;&nbsp;
                                        {getFormattedTime(item.created_at)}
                                    </span>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div >
    );
}
