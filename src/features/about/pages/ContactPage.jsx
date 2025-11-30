import AudioWordHighlighterSample from "./AudioWordHighlighterSample";
import styles from '../styles/ContactPage.module.css';

const ContactPage = () => {
    return (
        <div className="container"
            style={{ marginTop: '80px', marginBottom: '50px', height: '100vh' }}>
            <h2>Contact Us</h2>
            <p>We'd love to hear from you. Whether you have a question, suggestion or want to collaborate,
                feel free to reach out to us using the contact information
                below.
            </p>
            <br /> <br />
            <h3>Contact Information</h3>
            <hr />
            <div style={{fontSize:"20px"}} className="contact-info">
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 'bold' }}>For any queries / collaborations:</div>
                    <a href="mailto:connect@thefountainhead.org">
                        connect@thefountainhead.org
                    </a>
                </div>


                <hr />

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap' }}>
                    <div style={{ fontWeight: 'bold' }}>Address:</div>
                    <div>Dhaka, Bangladesh</div>
                </div>


            </div>
            <br /><br />

            {/* demo audio transcript section */}

            {/* <AudioWordHighlighterSample /> */}

            {/* <h5>Send Us a Message</h5>
            <br />
            <form>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea className="form-control" id="message" rows="4" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
            </form> */}
        </div>
    );
}

export default ContactPage;