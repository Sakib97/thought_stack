import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';


const NavigationBar = () => {
    return (
        <div>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home">
                        <img
                            alt=""
                            src="public/logo1.jpeg"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />
                        &nbsp;
                        Thought Stack
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="offcanvasNavbar-expand-lg" />
                    <Navbar.Offcanvas
                        id="offcanvasNavbar-expand-lg"
                        aria-labelledby="offcanvasNavbarLabel-expand-lg"
                        placement="end"
                    >
                        <Offcanvas.Header closeButton className="justify-content-center">
                            <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg">
                                Menu
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav style={{fontSize: '1.1rem'}}
                                className="
                                    ms-auto        /* push to right on large screens */
                                    flex-lg-row    /* horizontal on large screens */
                                    flex-column    /* vertical on small screens */
                                    align-items-lg-end  /* right align on large */
                                    align-items-center  /* center align on small */
                                    gap-1
                                "
                            >
                                <Nav.Link href="#home">Home</Nav.Link>
                                <Nav.Link href="#features">Features</Nav.Link>
                                <Nav.Link href="#pricing">Pricing</Nav.Link>
                                <Nav.Link href="#about">About</Nav.Link>
                                {/* <Nav.Link href="#deets">Mark Otto</Nav.Link> */}
                                <Nav.Link href="#deets">Sign In</Nav.Link> 
                                <Nav.Link href="#deets">Sign Up</Nav.Link>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

        </div>
    );
}

export default NavigationBar;