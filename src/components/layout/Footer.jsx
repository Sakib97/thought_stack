import styles from "../styles/Footer.module.css";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { FaGlobe } from "react-icons/fa";
const Footer = () => {
    return (
        <div className={styles.footer_background}>
            <link href="https://fonts.googleapis.com/css2?family=Anton+SC&display=swap" rel="stylesheet" />
            <link rel="styleSheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
            <link href="https://fonts.googleapis.com/css2?family=Anton+SC&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap" rel="stylesheet" />

            <div className={styles.footer_area}>
                <Link to="/" className={styles.logo}>Thought Stack</Link>
                <div className={styles.about_area}>
                    <div className={styles.about_text}>About</div>
                    <Link to="/" className={styles.about}>About us</Link>
                    <Link to="/" className={styles.blog}>Blog</Link>
                </div>
                <div className={styles.contact_area}>
                    <div className={styles.support_text}>Support</div>
                    <Link to="/contact" className={styles.contact}>Contact us</Link>
                    <Link to="/" className={styles.faq}>FAQ</Link>
                </div>
                <div className={styles.socials_area}>
                    <Link to="/" className={styles.social}><FaFacebook /></Link>
                    <Link to="/" className={styles.social}><IoMail /></Link>
                    <Link to="/" className={styles.social}><FaGlobe /></Link>
                </div>
            </div>
            {/* <div style={{ backgroundColor: 'rgb(230, 226, 222)' }}> */}
            {/* <hr /> */}
            <div style={{
                textAlign: 'center', padding: '20px 0',
                borderTop: '0px solid #5C86A0',
            }} className={styles.copyright_area}>
                <span style={{ fontSize: '14px', color: 'white' }}>
                    © {new Date().getFullYear()} Thought Stack. All rights reserved.
                </span>
                <br />
                <span style={{ fontSize: '14px', color: 'grey' }}>
                    Dhaka, Bangladesh
                </span>
            </div>
        </div>);
}

export default Footer; 
