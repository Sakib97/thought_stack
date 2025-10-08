import styles from "../styles/ArticleComment.module.css";
import { getFormattedTime } from "../../../utils/dateUtil";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { supabase } from "../../../config/supabaseClient";
import { useState } from "react";
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from "../../../context/AuthProvider";
import toast from "react-hot-toast";

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
        if (!userMeta) {
            return toast.error("You must be logged in to reply.");
        }
        if (!userMeta) return toast.error("You must be logged in to reply");
        if (!userMeta.is_active) {
            return toast.error("Your account is not active. You can't reply.");
        }
        if (!allowedRoles.includes(userMeta.role)) {
            return toast.error("You don’t have permission to reply.");
        }
        if (!isReplyContentValid) {
            return toast.error("Reply cannot be empty or whitespace.");
        }

        setLoading(true);

        try {
            const parentIdToUse = isReply ? mainParentId : comment.id;
            // const parentIdToUse = mainParentId ? mainParentId : comment.id;
            const { data, error } = await supabase.from("comments").insert([
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
            toast.success("Reply added!");
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

            // Ensure replies section is open
            if (!openReplies[parentIdToUse]) {
                setOpenReplies(prev => ({ ...prev, [parentIdToUse]: true }));
            }

            // Notify parent (ArticleComment) to update its count
            onReplyAdded?.({ ...newReply, parent_id: parentIdToUse });

        } catch (err) {
            console.error("Error adding reply:", err);
            toast.error("Failed to add reply.");
        } finally {
            setLoading(false);
        }
    };

    // if (!userMeta) {
    //     return (
    //         <div className={styles.notLoggedIn}>
    //             <i className="fa-regular fa-circle-xmark"></i> You must be logged in to comment.
    //         </div>
    //     );
    // }

    // if (!userMeta.is_active) {
    //     return (
    //         <div className={styles.notLoggedIn}>
    //             <i className="fa-regular fa-circle-xmark"></i> Your account is not active.
    //         </div>
    //     );
    // }

    // if (!allowedRoles.includes(userMeta.role)) {
    //     return (
    //         <div className={styles.notLoggedIn}>
    //             <i className="fa-regular fa-circle-xmark"></i> You don’t have permission to comment.
    //         </div>
    //     );
    // }


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
                {!isReply && <button className={styles.action} onClick={() => handleReplyClick(comment.id)}>
                    <i className="fa-solid fa-reply"></i> Reply
                </button>}
            </div>

            {/* Reply box */}
            
            { openReplyId === comment.id && (
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
                            onClick={handleReplySubmit} >
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
