import styles from "../styles/ArticleComment.module.css";
import { useState, useEffect } from "react";
import CommentItem from "./CommentItem";
import { supabase } from "../../../config/supabaseClient";
import Spinner from 'react-bootstrap/Spinner';
import CommentInput from "./CommentInput";
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
 
const COMMENTS_PER_PAGE = 2;

const ArticleComment = ({ articleId, userMeta }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [openReplyId, setOpenReplyId] = useState(null);
    const [openReplies, setOpenReplies] = useState({});

    const [sortOrder, setSortOrder] = useState("desc"); // default newest first
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const getCommentFilters = (sortOrder) => [
        {
            key: '1',
            label: <span>Newest First</span>,
            disabled: sortOrder === 'desc', // Disable if already selected
        },
        {
            key: '2',
            label: <span>Oldest First</span>,
            disabled: sortOrder === 'asc', // Disable if already selected
        },
    ];

    const fetchComments = async (pageNum = 1, order = sortOrder) => {
        setLoading(true);
        try {
            const from = (pageNum - 1) * COMMENTS_PER_PAGE;
            const to = from + COMMENTS_PER_PAGE - 1;

            const { data, error, count } = await supabase
                .from("comments")
                .select(`
          id,
          created_at,
          content,
          user_id,
          parent_id,
          users_meta(name, avatar_url),
          replies:comments(count)
        `, { count: "exact" })
                .eq("article_id", articleId)
                .is("parent_id", null)
                .is("is_hidden", false)
                .eq("replies.is_hidden", false)
                .order("created_at", { ascending: order === "asc" }) // sort by selected order
                .range(from, to);

            if (error) throw error;

            const existingIds = new Set(comments.map(c => c.id));
            const filtered = data.filter(c => !existingIds.has(c.id));

            const formatted = filtered.map((c) => ({
                id: c.id,
                name: c.users_meta?.name || "Anonymous",
                avatar: c.users_meta?.avatar_url || "https://i.pravatar.cc/40",
                date: c.created_at,
                text: c.content,
                likes: 0,
                repliesCount: c.replies?.[0]?.count || 0,
                replies: [],
            }));

            if (count !== null) setTotalCount(count);

            setComments(prev =>
                pageNum === 1 ? formatted : [...prev, ...formatted]
            );

            setHasMore(to + 1 < count);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (articleId) {
            setPage(1);
            //setComments([]); // clear old comments
            fetchComments(1, sortOrder);
        }
    }, [articleId, sortOrder, refreshTrigger]); // refetch when sort changes

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage, sortOrder);
    };

    const handleRefresh = () => {
        setPage(1);
        setComments([]);
        // fetchComments(1, sortOrder);
        setRefreshTrigger(prev => prev + 1); // trigger re-fetch safely
    };

    const handleMenuClick = ({ key }) => {
        setComments([]); // clear comments to avoid duplicates
        setSortOrder(key === "1" ? "desc" : "asc"); // toggle based on key
        setPage(1);
    };

    const handleCommentAdded = (newComment) => {
        const normalized = {
            id: newComment.id,
            name: newComment.name,
            avatar: newComment.avatar,
            date: newComment.date,
            text: newComment.text,
            likes: newComment.likes ?? 0,
            repliesCount: newComment.repliesCount ?? 0,
            replies: Array.isArray(newComment.replies) ? newComment.replies : [],
            parent_id: newComment.parent_id ?? null,
        };

        // If sorting is newest first, prepend; else append
        setComments(prev =>
            sortOrder === "desc" ? [normalized, ...prev] : [...prev, normalized]
        );
        setTotalCount(prev => prev + 1);
    };

    const handleReplyAdded = (newReply) => {
        setComments(prev => prev.map(c => {
            if (c.id === newReply.parent_id) {
                const existingReplies = Array.isArray(c.replies) ? c.replies : [];
                return {
                    ...c,
                    repliesCount: (c.repliesCount ?? 0) + 1,
                    replies: [newReply, ...existingReplies],
                };
            }
            return c;
        }));
    };

    return (
        <div className={styles.commentSection}>
            <div className={styles.header}>
                <i className={`fa-regular fa-comment ${styles.icon}`}></i>
                <h2>Comments ({totalCount})</h2>
            </div>

            <CommentInput userMeta={userMeta} articleId={articleId} onCommentAdded={handleCommentAdded} />

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ cursor: 'pointer', marginRight: '15px' }}>
                    <Dropdown
                        menu={{ items: getCommentFilters(sortOrder), onClick: handleMenuClick }}
                        trigger={['click']}
                    >
                        <a
                            style={{
                                border: '1px solid #ccc',
                                padding: '5px 10px',
                                borderRadius: '4px'
                            }}
                            onClick={e => e.preventDefault()}
                        >
                            <Space>
                                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                                {/* Sort By */}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </div>

                <div
                    style={{ cursor: 'pointer', fontSize: '20px', color: '#555' }}
                    onClick={handleRefresh}
                    title="Refresh Comments"
                >
                    <i className="fa-solid fa-rotate"></i>
                </div>
            </div>

            <div className={styles.commentsList}>
                {comments.map((c) => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        mainParentId={c.id}
                        openReplyId={openReplyId}
                        setOpenReplyId={setOpenReplyId}
                        openReplies={openReplies}
                        setOpenReplies={setOpenReplies}
                        onReplyAdded={handleReplyAdded}
                        articleId={articleId}
                        isReply={false}
                        sortOrder={sortOrder}
                    />
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: 'center' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {hasMore && !loading && (
                <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                    Load more comments
                </button>
            )}
        </div>
    );
};

export default ArticleComment;
