import { useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { showToast } from '../../../../components/layout/CustomToast';
import { useAuth } from '../../../../context/AuthProvider';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { encodeId } from '../../../../utils/hashUtil';


const ArticleEditBtn = ({ articleId }) => {
    const { userMeta } = useAuth();
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const content = (
        <div style={{ fontWeight: '700' }}>
            Edit Article
        </div>
    );

    const handleClose = () => setShow(false);
    const handleShow = () => {
        const allowedRoles = ['admin', 'editor'];
        // Prevent unauthorized or inactive users from opening the modal
        if (!allowedRoles.includes(userMeta?.role)) {
            showToast('Only admin or editor can edit!', 'error');
            return;
        }
        if (userMeta?.is_active === false) {
            showToast('Inactive users cannot edit.', 'error');
            return;
        }
        setShow(true);
    };

    const handleGo = () => {
        handleClose();
        navigate(`/dashboard/write-article?edit=true&articleId=${encodeId(articleId)}`);
    };

    return (<div>
        <Popover content={content} >

            <i style={{ fontSize: '25px', color: '#994a06' }}
                onClick={handleShow}
                className={`${styles.actionIcon} fi fi-rr-edit
                `}></i>
        </Popover>

        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Go to Edit Page </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: 'center', fontSize: '18px' }}>
                Are you sure you want to <b>Edit</b> this article?
                <br /> You will be redirected to the <b>edit page</b>.
                {/* <div style={{ fontSize: '14px', marginTop: '10px', color: 'orange', fontWeight: '700' }}>
                    Warning: If you go to edit page, all previously saved draft will be deleted (if any) !
                </div> */}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} >
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleGo}>
                    Go
                </Button>
            </Modal.Footer>
        </Modal>
    </div>);
}

export default ArticleEditBtn;