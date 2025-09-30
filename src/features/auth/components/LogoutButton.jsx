import { supabase } from "../../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import { useState } from "react";

const LogoutButton = () => {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth/signin");
    };

    return (
        <>
            {/* Trigger button */}
            <Button variant="danger" onClick={() => setShow(true)}>
                <span style={{fontWeight: "bold"}}>Logout</span>
            </Button>

            {/* Confirmation modal */}
            <Modal
                show={show}
                onHide={() => setShow(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>

                <Modal.Body style={{textAlign: 'center'}}>
                    Are you sure you want to log out of your account?
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LogoutButton;