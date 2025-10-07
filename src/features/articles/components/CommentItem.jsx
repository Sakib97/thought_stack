import styles from "../styles/ArticleComment.module.css";
import { getFormattedTime } from "../../../utils/dateUtil";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { supabase } from "../../../config/supabaseClient";
import { useState } from "react";
import Spinner from 'react-bootstrap/Spinner';

const REPLIES_PER_PAGE = 2;

const CommentItem = ({
    comment,
    openReplyId,
    setOpenReplyId,
    openReplies,
    setOpenReplies,
    articleId,
    isReply = false,
}) => {
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadedOnce, setLoadedOnce] = useState(false); // track if replies already fetched

    const handleReplyClick = (id) => {
        setOpenReplyId((prev) => (prev === id ? null : id));
    };

    const handleToggleReplies = async (id) => {
        const isOpen = openReplies[id];

        // If already open, just toggle hide (don’t reload or clear)
        if (isOpen) {
            setOpenReplies((prev) => ({ ...prev, [id]: false }));
            return;
        }

        // If first time opening, fetch replies
        setOpenReplies((prev) => ({ ...prev, [id]: true }));
        if (!loadedOnce) {
            await fetchReplies(id, 1);
            setLoadedOnce(true); // mark as loaded
        }
    };

    const fetchReplies = async (id, pageNum) => {
        setLoadingReplies(true);
        try {
            const from = (pageNum - 1) * REPLIES_PER_PAGE;
            const to = from + REPLIES_PER_PAGE - 1;

            const { data, error } = await supabase
                .from("comments")
                .select(`
          id,
          created_at,
          content,
          user_id,
          users_meta(name, avatar_url)
        `)
                .eq("article_id", articleId)
                .eq("parent_id", id)
                .order("created_at", { ascending: true })
                .range(from, to);

            if (error) throw error;

            const formatted = data.map((r) => ({
                id: r.id,
                name: r.users_meta?.name || "Anonymous",
                avatar: r.users_meta?.avatar_url || "https://i.pravatar.cc/40",
                date: r.created_at,
                text: r.content,
                likes: 0,
            }));

            // If page 1, set new; otherwise, append
            if (pageNum === 1) setReplies(formatted);
            else setReplies((prev) => [...prev, ...formatted]);

            // Determine if there are more
            setHasMore(formatted.length === REPLIES_PER_PAGE);
        } catch (err) {
            console.error("Error fetching replies:", err);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleLoadMore = async (id) => {
        const nextPage = Math.ceil(replies.length / REPLIES_PER_PAGE) + 1;
        await fetchReplies(id, nextPage);
    };

    const popover = (
        <Popover id="popover-basic">
            <Popover.Body>
                <i className="fa-solid fa-flag"></i> Report
            </Popover.Body>
        </Popover>
    );

    return (
        <div
            className={`${styles.comment} ${isReply ? styles.replyComment : ""}`}
            key={comment.id}
        >
            {/* Header */}
            <div className={styles.commentHeader}>
                <img src={comment.avatar} alt={comment.name} className={styles.avatar} />
                <div className={styles.nameAndDate}>
                    <strong>{comment.name}</strong>
                    <div className={styles.date}>{getFormattedTime(comment.date)}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                    <OverlayTrigger trigger={["click", "focus"]} placement="top" overlay={popover}>
                        <div className={styles.reportTrigger}>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </div>
                    </OverlayTrigger>
                </div>
            </div>

            {/* Body */}
            <p className={styles.text}>{comment.text}</p>

            {/* Actions */}
            <div className={styles.actions}>
                <span className={styles.action}>
                    <i className="fa-regular fa-thumbs-up"></i> {comment.likes}
                </span>
                <span className={styles.action}>
                    <i className="fa-regular fa-thumbs-down"></i>
                </span>
                <button className={styles.action} onClick={() => handleReplyClick(comment.id)}>
                    <i className="fa-solid fa-reply"></i> Reply
                </button>
            </div>

            {/* Reply box */}
            {openReplyId === comment.id && (
                <div className={styles.replyBox}>
                    <textarea
                        className={styles.replyTextarea}
                        placeholder={`Reply to ${comment.name}...`}
                    ></textarea>
                    <div className={styles.replyButtons}>
                        <button className={styles.cancelBtn} onClick={() => setOpenReplyId(null)}>
                            Cancel
                        </button>
                        <button className={styles.submitBtn}>Post Reply</button>
                    </div>
                </div>
            )}

            {/* Replies */}
            {!isReply && comment.repliesCount > 0 && (
                <>
                    <button
                        className={styles.replyCount}
                        onClick={() => handleToggleReplies(comment.id)}
                    >
                        {openReplies[comment.id] ? "Hide replies" : `${comment.repliesCount} replies`}
                    </button>

                    {openReplies[comment.id] && (
                        <div className={styles.repliesList}>
                            {loadingReplies ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <>
                                    {replies.map((r) => (
                                        <CommentItem
                                            key={r.id}
                                            comment={r}
                                            isReply
                                            openReplyId={openReplyId}
                                            setOpenReplyId={setOpenReplyId}
                                            openReplies={openReplies}
                                            setOpenReplies={setOpenReplies}
                                            articleId={articleId}
                                        />
                                    ))}

                                    {hasMore && (
                                        <button
                                            className={styles.loadMoreReplyBtn}
                                            onClick={() => handleLoadMore(comment.id)}
                                        >
                                            Load more replies
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CommentItem;
