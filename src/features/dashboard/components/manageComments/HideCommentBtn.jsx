import { useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { showToast } from '../../../../components/layout/CustomToast';
import { useAuth } from '../../../../context/AuthProvider';

const HideCommentBtn = ({ commentId, parentId, isHidden, onVisibilityActionComplete }) => {
    const { userMeta } = useAuth();
    const [show, setShow] = useState(false);
    const [updating, setUpdating] = useState(false);

    const actionText = isHidden ? 'Unhide' : 'Hide';
    const content = (
        <div style={{ fontWeight: '700' }}>
            {actionText} Comment
        </div>
    );

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleConfirm = async () => {
        setUpdating(true);
        try {
            const newVisibility = isHidden ? 'Visible' : 'Hidden'; // next state

            // If trying to unhide a reply, ensure parent isn't hidden
            if (newVisibility === 'Visible' && parentId) {
                const { data: parentData, error: parentError } = await supabase
                    .from('comments')
                    .select('is_hidden')
                    .eq('id', parentId)
                    .single();

                if (parentError) throw parentError;

                if (parentData?.is_hidden) {
                    showToast(
                        'Cannot unhide this comment because its parent comment is hidden.',
                        'error'
                    );
                    setShow(false);
                    setUpdating(false);
                    return;
                }
            }

            // Perform DB updates
            if (newVisibility === 'Hidden') {
                // hide comment
                const { error: reportError } = await supabase
                    .from('comment_reports')
                    .update({
                        review_status: 'reviewed',
                        updated_at: new Date().toISOString(),
                        reviewed_by: userMeta?.email || null,
                    })
                    .eq('comment_id', commentId)
                    .eq('review_status', 'pending');

                if (reportError) throw reportError;
            }

            // main comment update
            const { error: commentError } = await supabase
                .from('comments')
                .update({
                    is_hidden: newVisibility === 'Hidden',
                    updated_at: new Date().toISOString(),
                    
                })
                .eq('id', commentId);

            if (commentError) throw commentError;

            // parent cascades to replies
            if (!parentId) { // no parentId means it's a parent comment, it may have replies
                const { error: replyError } = await supabase
                    .from('comments')
                    .update({
                        is_hidden: newVisibility === 'Hidden',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('parent_id', commentId);

                if (replyError) throw replyError;
            }

            // Toast message
            showToast(
                newVisibility === 'Hidden'
                    ? 'Comment and its replies have been hidden successfully!'
                    : 'Comment has been made visible!',
                'success'
            );

            setShow(false);

            // Update parent state
            if (onVisibilityActionComplete) {
                onVisibilityActionComplete(commentId, newVisibility);
            }
        } catch (err) {
            console.error('Error updating comment visibility:', err);
            showToast('Failed to update comment visibility. Please try again.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <Popover content={content} >
                {/* currently isHidden, so unhide icon is green, 
                        if not isHidden, hide icon is red
                    */}
                <i style={{ color: isHidden ? 'green' : 'red' }}
                    onClick={handleShow}
                    className={`${styles.actionIcon} ${isHidden ? 'fi fi-rs-eye' : 'fi fi-rr-eye-crossed'
                        }`}>
                </i>

            </Popover>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm {actionText} Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center', fontSize: '18px' }}>
                    Are you sure you want to <b>{actionText.toLowerCase()}</b> this comment?
                    <div style={{ fontSize: '14px', marginTop: '10px' }}>
                        {!parentId && <span style={{ color: 'orange', fontWeight: '700' }}>
                            Warning: This is a top level comment!
                            This action will {actionText} all replies to this comment.
                        </span>}
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={updating}>
                        Cancel
                    </Button>
                    <Button
                        variant={isHidden ? 'success' : 'danger'}
                        onClick={handleConfirm}
                        disabled={updating}
                    >
                        {updating ? 'Updating...' : 'Confirm'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default HideCommentBtn;