import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faThumbsUp,
    faThumbsDown,
    faFlag,
} from "@fortawesome/free-regular-svg-icons";
import {
    faThumbsUp as solidThumbsUp,
    faThumbsDown as solidThumbsDown,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Comment.css";
import Reply from "./Reply";

const Comment = ({ comment, user }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [likes, setLikes] = useState(comment.likes || 0);
    const [dislikes, setDislikes] = useState(comment.dislikes || 0);
    const [userReaction, setUserReaction] = useState(null);

    const handleLike = () => {
        if (userReaction === "like") {
            setLikes(likes - 1);
            setUserReaction(null);
        } else {
            if (userReaction === "dislike") {
                setDislikes(dislikes - 1);
            }
            setLikes(likes + 1);
            setUserReaction("like");
        }
    };

    const handleDislike = () => {
        if (userReaction === "dislike") {
            setDislikes(dislikes - 1);
            setUserReaction(null);
        } else {
            if (userReaction === "like") {
                setLikes(likes - 1);
            }
            setDislikes(dislikes + 1);
            setUserReaction("dislike");
        }
    };

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (replyText.trim()) {
            // TODO: Implement reply submission to backend
            console.log("Submitting reply:", replyText);
            setReplyText("");
            setShowReplyForm(false);
        }
    };

    const handleReplyCancel = () => {
        setReplyText("");
        setShowReplyForm(false);
    };

    const handleReport = () => {
        // TODO: Implement report functionality
        console.log("Reporting comment:", comment.id);
    };

    const formatTimestamp = (timestamp) => {
        // Convert to local date time format
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Get user avatar - fixed this line
    const userAvatar = user?.user_metadata?.avatar_url || "https://via.placeholder.com/40";

    return (
        <div className="comment">
            <div className="comment-avatar">
                <img src={comment.user_avatar} alt={comment.user_name} />
            </div>

            <div className="comment-content">
                <div className="comment-header">
                    <span className="comment-author">{comment.user_name}</span>
                    <span className="comment-time">
                        {formatTimestamp(comment.created_at)}
                    </span>
                </div>

                <div className="comment-text">{comment.content}</div>

                <div className="comment-actions">
                    <button
                        className={`action-btn like-btn ${
                            userReaction === "like" ? "active" : ""
                        }`}
                        onClick={handleLike}
                    >
                        <FontAwesomeIcon
                            icon={
                                userReaction === "like"
                                    ? solidThumbsUp
                                    : faThumbsUp
                            }
                            className="icon"
                        />
                        <span className="count">{likes}</span>
                    </button>

                    <button
                        className={`action-btn dislike-btn ${
                            userReaction === "dislike" ? "active" : ""
                        }`}
                        onClick={handleDislike}
                    >
                        <FontAwesomeIcon
                            icon={
                                userReaction === "dislike"
                                    ? solidThumbsDown
                                    : faThumbsDown
                            }
                            className="icon"
                        />
                        <span className="count">{dislikes}</span>
                    </button>

                    <button
                        className="action-btn reply-btn"
                        onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                        Reply
                    </button>

                    <button
                        className="action-btn report-btn"
                        onClick={handleReport}
                    >
                        <FontAwesomeIcon icon={faFlag} className="icon" />
                        Report
                    </button>
                </div>

                {/* Reply Form - Fixed layout */}
                {showReplyForm && user && (
                    <div className="reply-form">
                        <div className="reply-avatar">
                            <img src={userAvatar} alt={user.user_metadata?.full_name || "User"} />
                        </div>
                        <div className="reply-input-container">
                            <form onSubmit={handleReplySubmit}>
                                <textarea
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="reply-textarea"
                                    rows="3"
                                />
                                <div className="reply-buttons">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={handleReplyCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={!replyText.trim()}
                                    >
                                        Reply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Replies Dropdown */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-section">
                        <button
                            className={`view-replies-btn ${
                                showReplies ? "expanded" : ""
                            }`}
                            onClick={() => setShowReplies(!showReplies)}
                        >
                            {comment.replies.length}{" "}
                            {comment.replies.length === 1 ? "reply" : "replies"}
                        </button>

                        {showReplies && (
                            <div className="replies-list">
                                {comment.replies.map((reply) => (
                                    <Reply
                                        key={reply.id}
                                        reply={reply}
                                        user={user}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;