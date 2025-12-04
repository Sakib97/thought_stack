import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import styles from '../styles/ContactPage.module.css';
import { showToast } from '../../../components/layout/CustomToast';


const ContactPage = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        const mailtoLink = `mailto:thefountainhead.org@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        window.location.href = mailtoLink;
        // showToast('Message sent successfully!', 'success');
        form.reset();
    };

    return (
        <div className={styles.contactWrapper}>
            <Container>
                <div className="text-center mb-5">
                    <h2 className={styles.sectionTitle}>Get in Touch</h2>
                    <p className={styles.sectionSubtitle}>
                        We'd love to hear from you. Whether you have a question, suggestion, 
                        or want to collaborate, feel free to reach out to us.
                    </p>
                </div>

                <Row className="g-4">
                    {/* Contact Information Column */}
                    <Col lg={5} md={12}>
                        <div className="d-flex flex-column gap-4 h-100">
                            <Card className={styles.infoCard}>
                                <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                                    <div className={styles.iconWrapper}>
                                        <FaEnvelope />
                                    </div>
                                    <h5 className={styles.infoTitle}>Email Us</h5>
                                    <p className="text-muted mb-2">For queries & collaborations</p>
                                    <a href="mailto:connect@thefountainhead.org" className={styles.infoText}>
                                        connect@thefountainhead.org
                                    </a>
                                </Card.Body>
                            </Card>

                            <Card className={styles.infoCard}>
                                <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                                    <div className={styles.iconWrapper}>
                                        <FaMapMarkerAlt />
                                    </div>
                                    <h5 className={styles.infoTitle}>Visit Us</h5>
                                    <p className="text-muted mb-2">Our Office Location</p>
                                    <span className={styles.infoText}>
                                        Dhaka, Bangladesh
                                    </span>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    {/* Contact Form Column */}
                    <Col lg={7} md={12}>
                        <Card className={styles.formCard}>
                            <h4 className="mb-4 fw-bold text-dark">Send a Message</h4>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="formName">
                                            <Form.Label>Your Name</Form.Label>
                                            <Form.Control name="name" type="text" placeholder="John Doe" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="formEmail">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control name="email" type="email" placeholder="john@example.com" required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="formSubject">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control name="subject" type="text" placeholder="How can we help?" required />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formMessage">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control name="message" as="textarea" rows={5} placeholder="Write your message here..." required />
                                </Form.Group>

                                <Button variant="primary" type="submit" className={`w-100 ${styles.submitBtn}`}>
                                    <FaPaperPlane className="me-2" /> Send Message
                                </Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
            
            {/* <AudioWordHighlighterSample /> */}
        </div>
    );
}

export default ContactPage;
