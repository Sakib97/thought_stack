import { useNavigate } from 'react-router-dom';
import styles from '../styles/NotFound.module.css';
const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.container}>
            <h1>404</h1>
            <p>Oops! The page you're looking for does not exist.</p>
            <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
    );
}

export default NotFound;