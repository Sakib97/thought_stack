import { useEffect, useState } from 'react';
import styles from "../styles/ArticleReactions.module.css";
import { Popover } from 'antd';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../../../config/supabaseClient';

const ArticleReactions = ({ articleId, userId, isActive }) => {
    const [reactionCounts, setReactionCounts] = useState({
        like: 0,
        love: 0,
        sad: 0,
        angry: 0,
    });
    const [userReaction, setUserReaction] = useState(null); // 'like' / 'love' / 'sad' / 'angry' / null
    const [loading, setLoading] = useState(false);

    // Fetch total reaction counts per reaction type
    const fetchReactionCounts = async () => {
        const { data, error } = await supabase
            .from('article_reactions')
            .select('reaction_type')
            .eq('article_id', articleId);

        if (error) {
            console.error(error);
            toast.error('Failed to load reactions');
            return;
        }

        // Aggregate counts manually
        const counts = { like: 0, love: 0, sad: 0, angry: 0 };
        data.forEach(r => counts[r.reaction_type]++);
        setReactionCounts(counts);
    };

    // Fetch current user's reaction (if logged in)
    const fetchUserReaction = async () => {
        const { data, error } = await supabase
            .from('article_reactions')
            .select('reaction_type')
            .eq('article_id', articleId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error(error);
            return;
        }

        setUserReaction(data?.reaction_type || null);
    };

    // Fetch reaction counts + current user's reaction
    useEffect(() => {
        if (!articleId) return;
        fetchReactionCounts();
        if (userId) fetchUserReaction();
    }, [articleId, userId]);

    // Toggle user reaction
    const toggleReaction = async (newReaction) => {
        if (!userId) {
            toast.error('Please login to react');
            return;
        }

        if (!isActive) {
            toast.error('Your account is deactivated. You can\'t react.');
            return;
        }

        setLoading(true);

        try {
            // Step 1 — check if user already reacted
            const { data: existing, error: fetchError } = await supabase
                .from('article_reactions')
                .select('reaction_type')
                .eq('article_id', articleId)
                .eq('user_id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (!existing) {
                // Step 2a — no reaction yet → insert new
                const { error: insertError } = await supabase
                    .from('article_reactions')
                    .insert([{ article_id: articleId, user_id: userId, reaction_type: newReaction }]);
                if (insertError) throw insertError;

                setUserReaction(newReaction);
                toast.success(`You reacted with ${newReaction}`);
            } else if (existing.reaction_type === newReaction) {
                // Step 2b — same reaction clicked → delete
                const { error: deleteError } = await supabase
                    .from('article_reactions')
                    .delete()
                    .eq('article_id', articleId)
                    .eq('user_id', userId);
                if (deleteError) throw deleteError;

                setUserReaction(null);
                toast.success('Reaction removed');
            } else {
                // Step 2c — different reaction → update (or upsert)
                const { error: updateError } = await supabase
                    .from('article_reactions')
                    .upsert(
                        [{ article_id: articleId, user_id: userId, reaction_type: newReaction }],
                        { onConflict: ['article_id', 'user_id'] }
                    );
                if (updateError) throw updateError;

                setUserReaction(newReaction);
                toast.success(`Changed reaction to ${newReaction}`);
            }

            // Refresh counts
            await fetchReactionCounts();

        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={`${styles.articleReactions}`}>
            <Toaster />

            {['like', 'love', 'sad', 'angry'].map((type) => (
                <div key={type}>
                    <div className={styles.articleReactionsIcons}>
                        <Popover content={<div>{type[0].toUpperCase() + type.slice(1)}</div>}
                            trigger="hover"
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
                                onClick={() => !loading && toggleReaction(type)}
                            ></i>
                        </Popover>
                    </div>
                    <div className={styles.articleReactionsCount}>
                        {reactionCounts[type]}
                    </div>
                </div>
            ))}

        </div>
    );
}

// Helper for Font Awesome icon names
const getIconClass = (type) => {
    switch (type) {
        case 'like': return 'fa-thumbs-up';
        case 'love': return 'fa-heart';
        case 'sad': return 'fa-face-sad-tear';
        case 'angry': return 'fa-face-angry';
        default: return '';
    }
};

// Optional custom colors
const getColor = (type) => {
    switch (type) {
        case 'like': return '#0565ad';
        case 'love': return '#C3312D    ';
        case 'sad': return '#2a3b90';
        case 'angry': return '#ff0000';
        default: return '#000';
    }
};

export default ArticleReactions;