import styles from "../styles/Footer.module.css";
const Footer = () => {
    return (
        <div style={{ backgroundColor: 'white' }}>
         {/* <div style={{ backgroundColor: 'rgb(230, 226, 222)' }}> */}
            {/* <hr /> */}
            <div style={{
                textAlign: 'center', padding: '20px 0',
                borderTop: '1px solid rgb(150, 142, 142)',
            }}>
                <span style={{ fontSize: '14px', color: 'grey' }}>
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