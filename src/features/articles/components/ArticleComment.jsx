import styles from "../styles/ArticleComment.module.css";
import { useState, useEffect } from "react";
import CommentItem from "./CommentItem";
import { supabase } from "../../../config/supabaseClient";
import Spinner from 'react-bootstrap/Spinner';
import CommentInput from "./CommentInput";


const COMMENTS_PER_PAGE = 2;

const ArticleComment = ({ articleId, userMeta }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0); // total DB comment count for article
    // For managing which reply box is open
    const [openReplyId, setOpenReplyId] = useState(null);
    // For managing which replies list is open
    const [openReplies, setOpenReplies] = useState({});

    const fetchComments = async (pageNum = 1) => {
        setLoading(true);
        try {
            const from = (pageNum - 1) * COMMENTS_PER_PAGE;
            const to = from + COMMENTS_PER_PAGE - 1;

            // Fetch parent comments only
            const { data, error, count } = await supabase
                .from("comments")
                .select(
                    `
            id,
            created_at,
            content,
            user_id,
            parent_id,
            users_meta(name, avatar_url),
            replies:comments(count)
          `,
                    { count: "exact" } // get total count
                )
                .eq("article_id", articleId)
                // not hidden
                .is("parent_id", null)
                .is("is_hidden", false)
                .eq("replies.is_hidden", false) // filter only visible replies
                .order("created_at", { ascending: true })
                .range(from, to);

            if (error) throw error;

            // Filter out comments already in state
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

            // store total number of parent comments once
            if (count !== null) setTotalCount(count);

            // Append new comments if page > 1
            setComments((prev) => (pageNum === 1 ? formatted : [...prev, ...formatted]));

            // Check if there are more comments
            setHasMore(to + 1 < count);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch first page
    useEffect(() => {
        if (articleId) {
            setPage(1);
            fetchComments(1);
        }
    }, [articleId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage);
    };

    const handleCommentAdded = (newComment) => {
        setComments(prev => [newComment, ...prev]); // prepend new comment at top
        setTotalCount(prev => prev + 1); // increment total comment count
    };

    const handleReplyAdded = (newReply) => {
        setComments(prev => {
            const updated = prev.map(c => {
                if (c.id === newReply.parent_id) {
                    return { ...c, repliesCount: c.repliesCount + 1, replies: [newReply, ...c.replies] };
                }
                return c;
            });
            return updated;
        });
    };

    return (
        <div className={styles.commentSection}>
            <div className={styles.header}>
                <i className={`fa-regular fa-comment ${styles.icon}`}></i>
                <h2>Comments ({totalCount})</h2>
            </div>
            <CommentInput
                articleId={articleId}
                // userMeta={userMeta}
                // onCommentAdded={() => fetchComments(1)} // refresh after new comment
                onCommentAdded={handleCommentAdded}
            />

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
                    />
                ))}
            </div>

            {loading && <div style={{ textAlign: 'center' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>}

            {hasMore && !loading && (
                <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                    Load more comments
                </button>
            )}
        </div>
    );
};

export default ArticleComment;
