import { supabase } from "../../../config/supabaseClient";
import styles from '../styles/LoginFrom.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
const LoginForm = () => {
    const handleLogin = async () => {
        const { user, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) console.log('Error: ', error.message);
        else console.log('User: ', user);
    };

    return ( <div className={styles.container}>
        <div className={styles.loginForm}>
            <h2>Continue with Google</h2>
            <br />
            <button className={styles.loginButton} onClick={handleLogin}>
                <FontAwesomeIcon icon={faGoogle} style={{ marginRight: '8px' }} />
                Sign in with Google
            </button>
        </div>
    </div> );
}
 
export default LoginForm;