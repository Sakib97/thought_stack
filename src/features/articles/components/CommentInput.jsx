import { useState } from "react";
import { supabase } from "../../../config/supabaseClient";
import styles from "../styles/CommentInput.module.css"; // create simple styling if needed
import { showToast } from "../../../components/layout/CustomToast";
import { createRateLimitedAction, createBurstRateLimitedAction } from "../../../utils/rateLimit";
import { Toaster } from "react-hot-toast";

const CommentInput = ({ userMeta, articleId, onCommentAdded }) => {
    // const { userMeta, loading: authLoading } = useAuth();

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    // Allowed roles
    const allowedRoles = ["user", "editor", "admin"];
    const isContentValid = content.trim().length > 0; // only non-whitespace text is valid

    if (!articleId) return null; // don't render if no articleId

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isContentValid) {
            return showToast("Comment cannot be empty.", "error");
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .insert([
                    {
                        article_id: articleId,
                        user_id: userMeta.uid,
                        content,
                        parent_id: null,
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

            // toast.success("Comment added!");
            showToast("Comment added!", "success");
            setContent("");
            // onCommentAdded?.(); // refetch comments in parent if provided

            // Pass the new comment data to parent to prepend
            onCommentAdded?.({
                id: data.id,
                name: data.users_meta?.name || "Anonymous",
                avatar: data.users_meta?.avatar_url || "https://i.pravatar.cc/40",
                date: data.created_at,
                text: data.content,
                likes: 0,
                repliesCount: 0,
            });

        } catch (err) {
            console.error(err);
            // toast.error("Failed to add comment.");
            showToast("Failed to add comment.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!userMeta || userMeta === undefined) {
        return (
            <div className={styles.notLoggedIn}>
                {/* <i style={{ fontSize: '25px' }} className="fa-regular fa-circle-xmark"></i>  */}
                Please login to comment !
            </div>
        );
    }

    if (!userMeta.is_active) {
        return (
            <div className={styles.notLoggedIn}>
                {/* <i style={{ fontSize: '25px' }} className="fa-solid fa-triangle-exclamation"></i> &nbsp; */}
                Account is not active! You can't comment!
                <div></div>
            </div>
        );
    }

    if (!allowedRoles.includes(userMeta.role)) {
        return (
            <div className={styles.notLoggedIn}>
                <i className="fa-regular fa-circle-xmark"></i> You don’t have permission to comment.
            </div>
        );
    }

    // const handleSubmitThrottled = createRateLimitedAction("comment", 5000, handleSubmit);
    // 3 api calls allowed in every 10 seconds, 18/min
    const handleSubmitThrottled = createBurstRateLimitedAction("comment", 10000, 3, handleSubmit);

    return (
        <div  >
            <form onSubmit={handleSubmitThrottled} className={styles.commentInput}>
                {/* //  <form onSubmit={(e) => { e.preventDefault(); handleSubmitThrottled(); }} className={styles.commentInput}>  */}
                
                <img
                    src={userMeta.avatar_url || "https://i.pravatar.cc/40"}
                    alt="avatar"
                    className={styles.avatar}
                />
                <textarea
                    placeholder="Add a comment..."
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        e.target.style.height = "auto"; // reset height
                        e.target.style.height = e.target.scrollHeight + "px"; // grow with content
                    }}
                    rows={1}
                    disabled={loading}
                />
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? "Posting..." : <i style={{ fontSize: '25px' }} className="fi fi-br-paper-plane-top"
                    ></i>}
                </button>
            </form>
        </div>
        // <form onSubmit={handleSubmit} className={styles.commentInput}>

    );
};

export default CommentInput;
