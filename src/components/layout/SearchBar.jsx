import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AutoComplete, Input, Spin, Avatar } from "antd";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { encodeId } from "../../utils/hashUtil";
import { getFormattedTime } from "../../utils/dateUtil";
import { useLanguage } from "../../context/LanguageProvider";
import styles from "../styles/SearchBar.module.css";


export default function SearchBar({ maxResults = 8, className = "" }) {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [query, setQuery] = useState("");
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const t = useRef(null);
    const debounce = useCallback((fn, wait = 300) => {
        return (...args) => {
            clearTimeout(t.current);
            t.current = setTimeout(() => fn(...args), wait);
        };
    }, []);

    const fetchResults = useCallback(
        async (q) => {
            if (!q || !q.trim()) {
                setOptions([]);
                return;
            }
            setLoading(true);

            const like = `%${q}%`;
            const { data, error } = await supabase
                .from("articles_secure")
                .select(
                    "id, title_en, title_bn, author_name, created_at, cover_img_link, article_slug, author_img_link"
                )
                .or(
                    `title_en.ilike.${like},title_bn.ilike.${like},author_name.ilike.${like}`
                )
                .order("created_at", { ascending: false })
                .limit(maxResults);

            if (error) {
                console.error("Search error:", error.message);
                setOptions([]);
                setLoading(false);
                return;
            }

            const mapped = (data || []).map((row) => {
                const title = language === "en" ? row.title_en : row.title_bn;

                return {
                    value: `/article/${encodeId(row.id)}/${row.article_slug}`,
                    label: (
                        <div className={styles.row}>
                            <img
                                className={styles.thumb}
                                src={row.cover_img_link}
                                alt={title}
                                loading="lazy"
                                draggable={false}
                            />
                            <div className={styles.meta}>
                                <div className={styles.title} title={title}>
                                    {title}
                                </div>
                               <div className={styles.author}>
                                <Avatar
                                    size={22}
                                    src={row.author_img_link} 
                                    alt={row.author_name}
                                />
                                <span>{row.author_name}</span>
                                </div>
                            </div>
                            <div className={styles.date} title={getFormattedTime(row.created_at)}>
                                {getFormattedTime(row.created_at)}
                            </div>
                        </div>
                    ),
                };
            });

            setOptions(mapped);
            setLoading(false);
        },
        [language, maxResults]
    );

    const debouncedFetch = useMemo(() => debounce(fetchResults, 350), [fetchResults, debounce]);

    const handleSearch = (val) => {
        setQuery(val);
        debouncedFetch(val);
    };

    const handleSelect = (value) => {
        navigate(value);
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <AutoComplete
                style={{ width: "50%" }}
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                options={options}
                onSelect={handleSelect}
                // dropdownMatchSelectWidth
                popupMatchSelectWidth
                classNames={{ popup: { root: styles.dropdown } }}
                // dropdownClassName={styles.dropdown}
            >
                <Input
                    size="large"
                    allowClear
                    placeholder={language === "en" ? "Search by Title or Author..." : "শিরোনাম বা লেখক দিয়ে খুঁজুন..."}
                    prefix={<SearchOutlined />}
                    suffix={
                        loading ? <Spin indicator={<LoadingOutlined spin />} size="small" /> : null
                    }
                />
            </AutoComplete>
        </div>
    );
}
