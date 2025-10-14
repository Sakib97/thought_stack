import { useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { showToast } from '../../../../components/layout/CustomToast';
import { useAuth } from '../../../../context/AuthProvider';

const ReviewCommentBtn = ({ commentId, reviewStatus, onReviewComplete }) => {
    const [show, setShow] = useState(false);
    const [updating, setUpdating] = useState(false);
    const { user } = useAuth();

    const isAlreadyReviewed = reviewStatus === 'reviewed';

    const handleClose = () => setShow(false);
    const handleShow = () => {
        if (!isAlreadyReviewed) setShow(true);
    };

    const handleConfirm = async () => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('comment_reports')
                .update({
                    review_status: 'reviewed',
                    reviewed_by: user?.email || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('comment_id', commentId)
                .eq('review_status', 'pending');

            if (error) throw error;

            showToast('Comment marked as reviewed successfully!', 'success');
            setShow(false);

            if (onReviewComplete) onReviewComplete(commentId, 'reviewed');
        } catch (err) {
            console.error('Error marking comment as reviewed:', err);
            showToast('Failed to mark comment as reviewed. Please try again.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div
        >
            <Popover
                placement="top"
                content={
                    isAlreadyReviewed
                        ? <span style={{ fontWeight: 700 }}>Already reviewed</span>
                        : <span style={{ fontWeight: 700 }}>Mark as Reviewed</span>
                }
            >
                <span>
                    <i
                        onClick={!isAlreadyReviewed ? handleShow : undefined}
                        className={`${styles.actionIcon} fi fi-rs-thumbs-up-trust`}
                        style={{
                            cursor: isAlreadyReviewed ? 'not-allowed' : 'pointer',
                            color: 'green',
                            opacity: isAlreadyReviewed ? 0.5 : 1,
                        }}
                    ></i>
                </span>
            </Popover>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Mark as Reviewed</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center', fontSize: '18px' }}>
                    Are you sure you want to <b>mark this comment as reviewed</b>? <br />
                    (All related reports will be marked as reviewed.)
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={updating}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleConfirm} disabled={updating}>
                        {updating ? 'Updating...' : 'Confirm'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewCommentBtn;
