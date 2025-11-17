import styles from '../styles/CommentReactions.module.css';
import { useAuth } from '../../../context/AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { Toaster } from 'react-hot-toast';
import { showToast } from '../../../components/layout/CustomToast';
import { createBurstRateLimitedAction } from '../../../utils/rateLimit';


const CommentReactions = ({ articleId, commentId, initialReactionData, onReactionUpdate }) => {
    const { userMeta } = useAuth();
    const [reactionCounts, setReactionCounts] = useState({
        like: 0,
        dislike: 0,
    });
    const [userReaction, setUserReaction] = useState(null); // 'like' / 'dislike' / null
    const [loading, setLoading] = useState(false);

    // Initialize from props when available
    useEffect(() => {
        if (initialReactionData) {
            setReactionCounts(initialReactionData.counts);
            setUserReaction(initialReactionData.userReaction);
        }
    }, [initialReactionData]);

    // Initialize from props when available
    useEffect(() => {
        if (initialReactionData) {
            setReactionCounts(initialReactionData.counts);
            setUserReaction(initialReactionData.userReaction);
        }
    }, [initialReactionData]);

    const toggleReaction = async (newReaction) => {
        if (!userMeta?.uid) {
            showToast('Please login to react', 'error');
            return;
        }

        if (!userMeta?.is_active) {
            showToast("Your account is deactivated. You can't react.", 'error');
            return;
        }

        setLoading(true);
        try {
            // Check if the user already reacted
            const { data: existing, error: fetchError } = await supabase
                .from('comment_reactions')
                .select('reaction_type')
                .eq('comment_id', commentId)
                .eq('user_id', userMeta?.uid)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing && existing.reaction_type === newReaction) {
                // Remove reaction (toggle off)
                const { error: deleteError } = await supabase
                    .from('comment_reactions')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', userMeta?.uid);
                if (deleteError) throw deleteError;

                // Update local state
                setReactionCounts(prev => ({
                    ...prev,
                    [newReaction]: Math.max(0, prev[newReaction] - 1)
                }));
                setUserReaction(null);

                // Update parent
                if (onReactionUpdate) {
                    onReactionUpdate(commentId, {
                        counts: {
                            ...reactionCounts,
                            [newReaction]: Math.max(0, reactionCounts[newReaction] - 1)
                        },
                        userReaction: null
                    });
                }

                showToast('Reaction removed', 'success');
            } else {
                // Add or change reaction safely via upsert
                const { error: upsertError } = await supabase
                    .from('comment_reactions')
                    .upsert(
                        [{ comment_id: commentId, user_id: userMeta?.uid, reaction_type: newReaction }],
                        { onConflict: ['comment_id', 'user_id'] }
                    );
                if (upsertError) throw upsertError;

                // Update local state
                const newCounts = { ...reactionCounts };
                if (existing) {
                    // Switching from one reaction to another
                    newCounts[existing.reaction_type] = Math.max(0, newCounts[existing.reaction_type] - 1);
                }
                newCounts[newReaction] = newCounts[newReaction] + 1;
                
                setReactionCounts(newCounts);
                setUserReaction(newReaction);

                // Update parent
                if (onReactionUpdate) {
                    onReactionUpdate(commentId, {
                        counts: newCounts,
                        userReaction: newReaction
                    });
                }

                showToast(`You reacted with ${newReaction}`, 'success');
            }
        } catch (err) {
            console.error(err);
            showToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    // const toggleReactionThrottled = createRateLimitedAction("reaction", 5000, toggleReaction);
    // 3 api calls allowed in every 10 seconds
    const toggleReactionThrottled = createBurstRateLimitedAction("reaction", 10000, 3, toggleReaction);

    return (
        <div className={styles.reactionsContainer}>
            {['like', 'dislike'].map(type => (
                <div key={type} >
                    <span
                        className={styles.action}
                        // onClick={() => !loading && toggleReaction(type)}
                        onClick={() => !loading && toggleReactionThrottled(type)}
                    >
                        <i
                            className={`fa-${userReaction === type ? 'solid' : 'regular'} 
                                ${getIconClass(type)}`}
                            style={{
                                color: getColor(type),
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transform: userReaction === type ? 'scale(1.2)' : 'scale(1)',
                                opacity: loading ? 0.5 : 1,
                            }}
                            // onClick={() => !loading && toggleReaction(type)}
                        ></i>
                        {reactionCounts[type]}
                    </span>

                </div>
            ))}
        </div>
    );
}

// Helper for Font Awesome icon names
const getIconClass = (type) => {
    switch (type) {
        case 'like': return 'fa-thumbs-up';
        case 'dislike': return 'fa-thumbs-down';
        default: return '';
    }
};

// Optional custom colors
const getColor = (type) => {
    switch (type) {
        case 'like': return '#0565ad';
        case 'dislike': return '#a80707';
        default: return '#000';
    }
};

export default CommentReactions;