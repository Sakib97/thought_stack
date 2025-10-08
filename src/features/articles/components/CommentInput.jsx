import { useState } from "react";
import { supabase } from "../../../config/supabaseClient";
import toast from "react-hot-toast";
import styles from "../styles/CommentInput.module.css"; // create simple styling if needed
import { useAuth } from "../../../context/AuthProvider";

const CommentInput = ({ articleId, onCommentAdded }) => {
    const { userMeta } = useAuth();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    // Allowed roles
    const allowedRoles = ["user", "editor", "admin"];
    const isContentValid = content.trim().length > 0; // only non-whitespace text is valid

    if (!articleId) return null; // don't render if no articleId

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return toast.error("Comment cannot be empty.");

        if (!isContentValid) {
            return toast.error("Comment cannot be empty or whitespace.");
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.from("comments").insert([
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

            toast.success("Comment added!");
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
            toast.error("Failed to add comment.");
        } finally {
            setLoading(false);
        }
    };

    if (!userMeta) {
        return (
            <div className={styles.notLoggedIn}>
                <i className="fa-regular fa-circle-xmark"></i> You must be logged in to comment.
            </div>
        );
    }

    if (!userMeta.is_active) {
        return (
            <div className={styles.notLoggedIn}>
                <i className="fa-solid fa-circle-exclamation"></i> &nbsp;
                You can't comment! <br /> Your account is not active!
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

    return (


        <form onSubmit={handleSubmit} className={styles.commentInput}>

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
                {loading ? "Posting..." : <i style={{fontSize: '20px'}} className="fi fi-br-paper-plane-top"></i>}
            </button>
        </form>
    );
};

export default CommentInput;
