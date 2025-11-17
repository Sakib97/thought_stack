import styles from "../styles/ArticleComment.module.css";
import { getFormattedTime } from "../../../utils/dateUtil";
import { supabase } from "../../../config/supabaseClient";
import { useState, useEffect } from "react";
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from "../../../context/AuthProvider";
import CommentReactions from "./CommentReactions";
import CommentReport from "./CommentReport";
import { createBurstRateLimitedAction } from "../../../utils/rateLimit";
import { showToast } from "../../../components/layout/CustomToast";

const REPLIES_PER_PAGE = 2;

const CommentItem = ({
    comment,
    openReplyId,
    mainParentId,
    setOpenReplyId,
    openReplies,
    setOpenReplies,
    articleId,
    onReplyAdded,
    // isReply = false,
    isReply,
    sortOrder,
    reactionsData,
    onReactionUpdate,
    fetchReactionsForComments
}) => {

    const { userMeta } = useAuth();
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadedOnce, setLoadedOnce] = useState(false); // track if replies already fetched
    const [totalRepliesCount, setTotalRepliesCount] = useState(comment.repliesCount || 0);

    const [loading, setLoading] = useState(false);

    const [replyContent, setReplyContent] = useState("");
    const isReplyContentValid = replyContent.trim().length > 0; // only non-whitespace text is valid
    // Allowed roles
    const allowedRoles = ["user", "editor", "admin"];
    const canReply = userMeta && allowedRoles.includes(userMeta.role) && userMeta.is_active;

    // if sortOrder changes, reset replies state to refetch in new order
    useEffect(() => {

        setReplies([]);
        setHasMore(true);
        setLoadedOnce(false);
        if (openReplies[comment.id]) {
            fetchReplies(comment.id, 1);
            setLoadedOnce(true);
        }
    }, [sortOrder]);

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

    // const fetchReplies = async (id, pageNum) => {
    const fetchReplies = async (id, pageNum = 1) => {
        setLoadingReplies(true);
        try {
            const from = (pageNum - 1) * REPLIES_PER_PAGE;
            const to = from + REPLIES_PER_PAGE - 1;

            const { data, error, count } = await supabase
                .from("comments")
                .select(`
                        id,
                        created_at,
                        content,
                        user_id,
                        users_meta(name, avatar_url)
                        `, { count: "exact" })
                .eq("article_id", articleId)
                .eq("parent_id", id)
                .is("is_hidden", false)
                .order("created_at", { ascending: true })
                .range(from, to);

            if (error) throw error;

            // Filter out Replies already in state
            const existingIds = new Set(replies.map(r => r.id));
            const filtered = data.filter(r => !existingIds.has(r.id));


            const formatted = filtered.map((r) => ({
                id: r.id,
                name: r.users_meta?.name || "Anonymous",
                avatar: r.users_meta?.avatar_url || "https://i.pravatar.cc/40",
                date: r.created_at,
                text: r.content,
                likes: 0,
            }));

            // Batch-fetch reactions for replies
            if (filtered.length > 0 && fetchReactionsForComments) {
                const replyIds = filtered.map(r => r.id);
                await fetchReactionsForComments(replyIds);
            }

            // Update total replies count from count returned by Supabase
            if (count !== null) setTotalRepliesCount(count);

            // If page 1, set new; otherwise, append
            if (pageNum === 1) setReplies(formatted);
            else setReplies((prev) => [...prev, ...formatted]);

            // Determine if there are more
            setHasMore(to + 1 < count);
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

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!userMeta) return showToast("You must be logged in to reply", "error");
        if (!userMeta.is_active) {
            return showToast("Your account is not active. You can't reply.", "error");
        }
        if (!allowedRoles.includes(userMeta.role)) {
            return showToast("You don’t have permission to reply.", "error");
        }
        if (!isReplyContentValid) {
            return showToast("Reply cannot be empty or whitespace.", "error");
        }

        setLoading(true);

        try {
            const parentIdToUse = isReply ? mainParentId : comment.id;
            // const parentIdToUse = mainParentId ? mainParentId : comment.id;
            const { data, error } = await supabase
                .from("comments")
                .insert([
                    {
                        article_id: articleId,
                        user_id: userMeta.uid,
                        content: replyContent,
                        parent_id: parentIdToUse,
                        is_hidden: false,
                    },
                ])
                .select(`
                        id,
                        created_at,
                        content,
                        user_id,
                        users_meta(name, avatar_url)
                    `)
                .single();
            ;

            if (error) throw error;

            const newReply = {
                id: data.id,
                name: data.users_meta?.name || "Anonymous",
                avatar: data.users_meta?.avatar_url || "https://i.pravatar.cc/40",
                date: data.created_at,
                text: data.content,
                likes: 0,
            };

            // Prepend at the top
            setReplies(prev => [newReply, ...prev]);

            // Increment count
            setTotalRepliesCount(prev => prev + 1);


            // Clear input
            setReplyContent("");
            showToast("Reply added!", "success");

            // Ensure replies section is open
            if (!openReplies[parentIdToUse]) {
                setOpenReplies(prev => ({ ...prev, [parentIdToUse]: true }));
            }

            // Notify parent (ArticleComment) to update its count
            onReplyAdded?.({ ...newReply, parent_id: parentIdToUse });

        } catch (err) {
            console.error("Error adding reply:", err);
            showToast("Failed to add reply.", "error");
        } finally {
            setLoading(false);
        }
    };

    // const handleReplySubmitThrottled = createRateLimitedAction("comment", 5000, handleReplySubmit);
    // 3 api calls allowed in every 10 seconds, 18/min  
    const handleReplySubmitThrottled = createBurstRateLimitedAction("replie", 10000, 3, handleReplySubmit);

    return (
        <div
            className={`${styles.comment} ${isReply ? styles.replyComment : ""}`}
            key={comment.id}
        >
            {/* Header */}
            <div className={styles.commentHeader}>
                <img src={comment.avatar} alt={comment.name} className={styles.avatar} />
                <div className={styles.nameAndDate}>
                    <strong style={{ fontSize: isReply ? "16px" : "18px" }}>{comment.name}</strong>
                    <div className={styles.date}>{getFormattedTime(comment.date)}</div>
                </div>
                <CommentReport commentId={comment.id} articleId={articleId} />
            </div>

            {/* Body */}
            <div className={styles.commentBody}>
                <p className={styles.text}>{comment.text}</p>
            </div>


            {/* Actions */}
            <div className={styles.actions}>
                <CommentReactions 
                    articleId={articleId} 
                    commentId={comment.id}
                    initialReactionData={reactionsData?.[comment.id]}
                    onReactionUpdate={onReactionUpdate}
                />
                {!isReply && <button className={styles.action} onClick={() => handleReplyClick(comment.id)}>
                    <i className="fa-solid fa-reply"></i> Reply
                </button>}
            </div>

            {/* Reply box */}

            {openReplyId === comment.id && (
                canReply ? (
                    <div className={styles.replyBox}>
                        <textarea
                            className={styles.replyTextarea}
                            placeholder={`Reply to ${comment.name}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            disabled={loading}
                        ></textarea>
                        <div className={styles.replyButtons}>
                            <button disabled={loading} className={styles.cancelBtn}
                                onClick={() => setOpenReplyId(null)}>
                                Cancel
                            </button>
                            <button disabled={loading} className={styles.submitBtn}
                                // onClick={handleReplySubmit} > 
                                onClick={handleReplySubmitThrottled} >
                                Post Reply
                            </button>
                        </div>
                    </div>) : (
                    <div className={styles.noReply}>
                        You can't reply. {userMeta ? (userMeta.is_active ? "You don’t have permission to reply." : "Your account is not active.") : "You must be logged in to reply."}
                    </div>

                )
            )}

            {/* Replies */}
            {!isReply && totalRepliesCount > 0 && (
                <>
                    <button
                        className={styles.replyCount}
                        onClick={() => handleToggleReplies(comment.id)}
                    >
                        {openReplies[comment.id] ? "Hide replies" : `${totalRepliesCount} replies`}
                    </button>

                    {openReplies[comment.id] && (
                        <div className={styles.repliesList}>
                            {replies.map((r) => (
                                <CommentItem
                                    key={r.id}
                                    comment={r}
                                    mainParentId={mainParentId} // pass down main parent ID to all replies
                                    isReply={true}
                                    openReplyId={openReplyId}
                                    setOpenReplyId={setOpenReplyId}
                                    openReplies={openReplies}
                                    setOpenReplies={setOpenReplies}
                                    articleId={articleId}
                                    reactionsData={reactionsData}
                                    onReactionUpdate={onReactionUpdate}
                                    fetchReactionsForComments={fetchReactionsForComments}
                                />
                            ))}

                            {loadingReplies && <div style={{ textAlign: 'left' }}>
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>}

                            {hasMore && replies.length < totalRepliesCount && (
                                <button
                                    className={styles.loadMoreReplyBtn}
                                    onClick={() => handleLoadMore(comment.id)}
                                >
                                    Load more replies
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CommentItem;
