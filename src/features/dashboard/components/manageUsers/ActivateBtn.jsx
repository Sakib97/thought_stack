import { useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { showToast } from '../../../../components/layout/CustomToast';

const ActivateBtn = ({ userId, userStatus, onStatusChange }) => {
    // console.log(userId, userStatus);
    const [show, setShow] = useState(false);
    const [updating, setUpdating] = useState(false);

    const content = (
        <div>
            Change User Status
        </div>
    );

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleConfirm = async () => {
        setUpdating(true);
        try {
            const newStatus = userStatus === 'Active' ? 'Inactive' : 'Active';

            const { error } = await supabase
                .from('users_meta')
                .update({
                    is_active: newStatus === 'Active',
                    status_reason: newStatus === 'Active'
                        ? 'activated_by_admin'
                        : 'deactivated_by_admin',
                })
                .eq('uid', userId);
            if (error) throw error;
            showToast('User status updated successfully', 'success');

            // callback to parent to refresh table
            if (onStatusChange) onStatusChange(userId, newStatus === 'Active');

            handleClose();
        } catch (err) {
            console.error('Error updating user status:', err.message || err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <Popover content={content} >
                <i onClick={handleShow}
                    className={`${styles.actionIcon} fi fi-bs-user-trust`}></i>
            </Popover>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Status Change</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to <b>{userStatus === 'Active' ? 'deactivate' : 'activate'}</b> this user?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={updating}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} disabled={updating}>
                        {updating ? 'Updating...' : 'Confirm'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ActivateBtn;