import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useState } from 'react';
import LanguageToggle from './LanguageToggle';
import useScrollDirection from '../../hooks/useScrollDirection';
import styles from "../styles/Navbar.module.css";

const NavigationBar = () => {
    const { user, userMeta } = useAuth();

    // Offcanvas state
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const showNavbar = useScrollDirection();

    return (
        <div >
            {/* <Navbar bg="light" expand="lg" className="bg-body-tertiary" */}
            <Navbar bg="light" expand="lg"
                // className="shadow-sm mb-3"
                className={`shadow-sm fixed-top ${showNavbar ? styles.navbarShow : styles.navbarHide}`}>
                <Container style={{ padding:'0px 12px', margin: '0 0 0 9vw' }}>
                    <Navbar.Brand href="/">
                        <img
                            alt=""
                            src="/logo3.png"
                            width="35"
                            height="35"
                            className="d-inline-block align-top"
                        />
                        &nbsp;
                        Thought Stack
                    </Navbar.Brand>

                    <Navbar.Toggle onClick={handleShow} aria-controls="offcanvasNavbar-expand-lg" />
                    <Navbar.Offcanvas
                        id="offcanvasNavbar-expand-lg"
                        aria-labelledby="offcanvasNavbarLabel-expand-lg"
                        placement="end"
                        show={show}
                        onHide={handleClose}
                    >
                        <Offcanvas.Header closeButton onHide={handleClose} className="justify-content-center">
                            <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg">
                                Menu
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body  >
                        {/* <Offcanvas.Body  className={styles.offcanvasBody}> */}
                            <Nav style={{ fontSize: '1.1rem' }}
                                className="
                                    ms-auto        /* push to right on large screens */
                                    flex-lg-row    /* horizontal on large screens */
                                    flex-column    /* vertical on small screens */
                                    align-items-lg-end  /* right align on large */
                                    align-items-center  /* center align on small */
                                    gap-2
                                "
                            >
                                <Nav.Link onClick={handleClose} as={Link} to="/">Home</Nav.Link>
                                {/* <Nav.Link onClick={handleClose} href="#about">About</Nav.Link> */}
                                <Nav.Link onClick={handleClose} as={Link} to="/contact">Contact</Nav.Link>
                                {user ? (
                                    <Nav.Link onClick={handleClose} as={Link} to="/dashboard/profile">{user.user_metadata.full_name || "User"}</Nav.Link>
                                ) : (
                                    <Nav.Link onClick={handleClose} as={Link} to="/auth/signin">Sign In</Nav.Link>
                                )}
                                <Navbar.Text onClick={handleClose}>
                                    <LanguageToggle />
                                </Navbar.Text>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

        </div>
    );
}

export default NavigationBar;
