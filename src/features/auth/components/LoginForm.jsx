import { supabase } from "../../../config/supabaseClient";
import styles from '../styles/LoginFrom.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

/**
 * LoginForm component
 * Renders a button for users to sign in with Google using Supabase OAuth.
 * After login, redirects the user to their intended page or the homepage.
 */
const LoginForm = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleLogin = async () => {
        if (loading) return; // prevent duplicate clicks
        setErrorMsg(null);
        setLoading(true);
        try {
            const redirectTo = `${window.location.origin}${location.state?.from?.pathname || "/"}`;
            // In Supabase JS v2, signInWithOAuth returns { data, error }
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo }
            });
            if (error) {
                console.log('Error: ', error.message);
                setErrorMsg(error.message || 'Login failed. Please try again.');
            } else {
                // data.url will redirect automatically; nothing else to do
            }
        } catch (e) {
            console.error(e);
            setErrorMsg('Unexpected error. Please retry.');
        } finally {
            // We don't unset loading because the browser will navigate; but if there's an error we want to re-enable
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginForm} role="group" aria-labelledby="login-title">
                <h2 id="login-title" className={styles.title}>Welcome Back</h2>
                <p className={styles.subtext}>Sign in to continue. We currently support Google accounts.</p>
                {errorMsg && (
                    <div className={styles.error} role="alert">{errorMsg}</div>
                )}
                <button
                    className={styles.loginButton}
                    onClick={handleLogin}
                    disabled={loading}
                    aria-label="Sign in with Google"
                    aria-busy={loading}
                >
                    <span className={styles.buttonContent}>
                        {loading ? (
                            <span className={styles.spinner} aria-hidden="true" />
                        ) : (
                            <FontAwesomeIcon icon={faGoogle} className={styles.icon} />
                        )}
                        <span className={styles.btnText}>{loading ? 'Redirecting…' : 'Continue with Google'}</span>
                    </span>
                </button>
                <div className={styles.footerNote}>By continuing you agree to our <Link to="/usage-policy" className={styles.policyLink}>Usage Policy</Link>.</div>
            </div>
        </div>
    );
};

export default LoginForm;