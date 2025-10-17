import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { supabase } from "../../../config/supabaseClient";
import { showToast } from "../../../components/layout/CustomToast";
import styles from "../styles/CommentReport.module.css";
import { Modal, Button } from "react-bootstrap";
import { createBurstRateLimitedAction } from "../../../utils/rateLimit";

const CommentReport = ({ commentId, articleId }) => {
    const { userMeta } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPopover, setShowPopover] = useState(false);

    const triggerRef = useRef(null);

    const [selectedReason, setSelectedReason] = useState("");
    // console.log(selectedReason);
    

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                setShowPopover(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReportClick = () => {
        setShowPopover(false); // hide popover
        if (!userMeta) {
            return showToast("You must be logged in to report comments.", "error");
        }
        if (!userMeta?.role || !["user", "editor", "admin"].includes(userMeta?.role)) {
            return showToast("You don’t have permission to report comments.", "error");
        }
        if (!userMeta?.is_active) {
            return showToast("Your account is not active. You can't report comments.", "error");
        }
        setShowModal(true);
    };

    const handleConfirmReport = async () => {
        setLoading(true);
        try {
            if (!selectedReason) {
                showToast("Please select a reason for reporting.", "error");
                setLoading(false);
                return;
            }
            const { error } = await supabase
                .from("comment_reports")
                .insert([
                    {
                        reporter_id: userMeta?.uid,
                        comment_id: commentId,
                        article_id: articleId,
                        reason_text: selectedReason,
                    },
                ]);
            if (error) {
                if (error.code === "23505") {
                    showToast("You have already reported this comment.", "error");
                } else {
                    throw error;
                }
            } else {
                showToast("Report submitted successfully", "success");
            }
        } catch (error) {
            showToast("Failed to report comment.", "error");
        } finally {
            setLoading(false);
            setShowModal(false);
        }
    };

    const toggleReportThrottled = createBurstRateLimitedAction("report", 10000, 3, handleReportClick);

    const popover = (
        <Popover id="popover-basic">
            <Popover.Body className={styles.reportOption}>
                <div
                    className={styles.reportText}
                    onClick={toggleReportThrottled}
                    style={{ cursor: "pointer", color: "#7c1010" }}
                >
                    <i className="fa-solid fa-flag"></i> Report
                </div>
            </Popover.Body>
        </Popover>
    );

    return (
        <>
            <div ref={triggerRef} style={{ marginLeft: "auto" }}>
                <OverlayTrigger
                    trigger="click"
                    placement="top"
                    show={showPopover}
                    overlay={popover}
                >
                    <div
                        className={styles.reportTrigger}
                        onClick={() => setShowPopover(!showPopover)}
                    >
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                </OverlayTrigger>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Report</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontSize: '17px', textAlign: 'center' }}>
                    {/* Are you sure you want to report this comment? This action cannot be undone. */}

                    Select a reason for reporting this comment:
                    {/* use select component */}
                    <select className={styles.reportReasonSelector}
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}>
                        <option value="" disabled>Select reason</option>
                        <option value="spam">Spam or misleading</option>
                        <option value="hate_speech">Hate speech or abusive content</option>
                        <option value="harassment">Harassment or bullying</option>
                        <option value="violent_content">Violent or dangerous content</option>
                        <option value="sexual_content">Sexual content</option>
                        <option value="other">Other inappropriate content</option>
                    </select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmReport}
                        disabled={loading || !selectedReason}
                        style={{ cursor: loading || !selectedReason ? "not-allowed" : "pointer" }}
                    >
                        {loading ? "Reporting..." : "Confirm"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CommentReport;
