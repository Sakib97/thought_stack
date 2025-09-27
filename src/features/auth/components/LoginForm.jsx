import { supabase } from "../../../config/supabaseClient";
import styles from '../styles/LoginFrom.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useLocation } from "react-router-dom";

/**
 * LoginForm component
 * Renders a button for users to sign in with Google using Supabase OAuth.
 * After login, redirects the user to their intended page or the homepage.
 */
const LoginForm = () => {
    // Get the current location object from React Router
    const location = useLocation();
    // console.log('Location State: ', location.state);
    
    /**
     * Handles the Google login process using Supabase OAuth.
     * Redirects the user to the original page they tried to access, or to "/".
     */
    const handleLogin = async () => {
        // Determine redirect URL after login
        // window.location.origin gives the base URL of the app (e.g., http://localhost:3000 or https://myapp.com)
        // location.state?.from?.pathname checks if there's a saved path to redirect to
        // If not, it defaults to "/"
        const redirectTo = `${window.location.origin}${location.state?.from?.pathname || "/"
            }`;

        // Initiate Supabase OAuth sign-in with Google
        const { user, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo // tell supabase where to send user back after login
            }
        });

        // Log any errors or the user object for debugging
        if (error) console.log('Error: ', error.message);
        else console.log('User: ', user);
    };

    // Render the login form UI
    return (
        <div className={styles.container}>
            <div className={styles.loginForm}>
                <h2>Continue with Google</h2>
                <br />
                <button className={styles.loginButton} onClick={handleLogin}>
                    <FontAwesomeIcon icon={faGoogle} style={{ marginRight: '8px' }} /> 
                     {/* divider */}
                     <span style={{ margin: '0 3px' }}>|</span>
                     &nbsp;
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

export default LoginForm;