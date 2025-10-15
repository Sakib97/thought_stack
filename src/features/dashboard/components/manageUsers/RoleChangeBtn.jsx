import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { showToast } from '../../../../components/layout/CustomToast';
import { useAuth } from '../../../../context/AuthProvider';
import { useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';

const RoleChangeBtn = ({ userId, userRole, onRoleChange }) => {
    const { userMeta } = useAuth();

    // console.log(userId, userStatus);
    const [show, setShow] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [newRole, setNewRole] = useState("");

    const content = (
        <div style={{ fontWeight: '700' }}>
            Change Role
        </div>
    );

    const handleClose = () => setShow(false);
    const handleShow = () => {
        // Prevent unauthorized or inactive users from opening the modal
        if (userMeta?.role !== 'admin') {
            showToast('Only admin can change user role!', 'error');
            return;
        }

        if (userMeta?.is_active === false) {
            showToast('Inactive users cannot change role.', 'error');
            return;
        }

        setShow(true);
    };

    const handleConfirm = async () => {
        setUpdating(true);
        try {
            if (!newRole) {
                showToast('Please select a role before confirming.', 'warning');
                setUpdating(false);
                return;
            }
            if (newRole === userRole) {
                showToast('Selected role is the same as the current role.', 'info');
                setUpdating(false);
                return;
            }
            const { error } = await supabase
                .from('users_meta')
                .update({ role: newRole })
                .eq('uid', userId);

            if (error) {
                // showToast(error.message || 'Error updating user role', 'error');
                showToast('Error updating user role ! Please contact support.', 'error');
            } else {
                showToast(`This profile is now ${newRole.toUpperCase()} !`, 'success');
                onRoleChange(userId, newRole);
                handleClose();
            }
        } catch (err) {
            console.error('Unexpected error while updating role:', err);
            showToast('Unexpected error occurred. Please try again.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <Popover content={content} >
                <i onClick={handleShow}
                    className={`${styles.actionIcon} fi fi-sr-career-growth`}></i>
            </Popover>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Role Change</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center', fontSize: '18px' }}>
                    {userMeta.uid === userId ? (
                        <span style={{ color: 'red', fontWeight: '700' }}>
                            You cannot change your own role !
                        </span>
                    ) : (
                        <span>
                            Select new role for this user:
                            <br />
                            <select className={styles.roleChangeDropdown} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                <option disabled value="">Select a role</option>
                                <option value="user">General User</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                            </select>
                        </span>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={updating}>
                        Cancel
                    </Button>
                    {userMeta.uid !== userId && (
                        <Button variant="danger" onClick={handleConfirm} disabled={updating}>
                            {updating ? 'Updating...' : 'Confirm'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default RoleChangeBtn;