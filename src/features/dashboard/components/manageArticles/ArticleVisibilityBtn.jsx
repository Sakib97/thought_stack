import { useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { showToast } from '../../../../components/layout/CustomToast';
import { useAuth } from '../../../../context/AuthProvider';

const ArticleVisibilityBtn = ({ articleId, articleStatus, onStatusChange }) => {
    const { userMeta } = useAuth();
    const [show, setShow] = useState(false);
    const [updating, setUpdating] = useState(false);

    const content = (
        <div style={{ fontWeight: '700' }}>
           {articleStatus === 'accepted' ? 'Restrict Access to' : 'Show'} Article
        </div>
    );

    const handleClose = () => setShow(false);
    const handleShow = () => {
        const allowedRoles = ['admin', 'editor'];
        // Prevent unauthorized or inactive users from opening the modal
        if (!allowedRoles.includes(userMeta?.role)) {
            showToast('Only admin or editor can change visibility!', 'error');
            return;
        }
        if (userMeta?.is_active === false) {
            showToast('Inactive users cannot change visibility.', 'error');
            return;
        }
        setShow(true);
    };

    const handleConfirm = async () => {
        setUpdating(true);
        try {
            const newStatus = articleStatus === 'accepted' ? 'restricted' : 'accepted';

            // main article update
            const { error: articleError } = await supabase
                .from('articles')
                .update({  
                    article_status: newStatus === 'accepted' ? 'accepted' : 'restricted',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', articleId);

            if (articleError) throw articleError;

            // Toast message
            showToast(
                newStatus === 'accepted'
                    ? 'Article marked as accepted successfully!'
                    : 'Article has been made hidden successfully!',
                'success'
            );

            setShow(false);

            // Update parent state
            if (onStatusChange) onStatusChange(articleId, newStatus);

            handleClose();
        } catch (err) {
            console.error('Error updating article status:', err.message || err);
            showToast('Failed to update article status. Please try again.', 'error');
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
                <i style={{ color: articleStatus === 'accepted' ? 'red' : 'green' }}
                    onClick={handleShow}
                    className={`${styles.actionIcon}  ${articleStatus === 'accepted' ? 'fi fi-rr-eye-crossed' : 'fi fi-rs-eye'
                        }`}></i>

            </Popover>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm {articleStatus === 'accepted' ? 'Restrict Access to' : 'Show'} Article</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center', fontSize: '18px' }}>
                    Are you sure you want to <b>{articleStatus === 'accepted' ? 'Restrict' : 'Show'}</b> this article?
                    <div style={{ fontSize: '14px', marginTop: '10px' }}>
                        {!userMeta?.is_active && <span style={{ color: 'orange', fontWeight: '700' }}>
                            Warning: This is a top level article!
                            This action will {articleStatus === 'accepted' ? 'hide' : 'show'} all replies to this article.
                        </span>}
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={updating}>
                        Cancel
                    </Button>
                    {userMeta?.is_active && (
                        <Button variant="danger" onClick={handleConfirm} disabled={updating}>
                            {updating ? 'Updating...' : 'Confirm'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

        </div>
     );
}
 
export default ArticleVisibilityBtn;