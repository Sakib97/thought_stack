import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CookieConsent.module.css';

/*
  CookieConsent component
  - Persists user choice in localStorage under key "ts_cookie_consent"
  - Accessible banner announced politely, supports keyboard navigation
  - Provides link to usage policy for transparency
*/
const STORAGE_KEY = 'ts_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      // Defer showing slightly to avoid layout shift during initial render
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const acceptCookies = () => {
    // Single consent path; can be expanded later for granular settings
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, level: 'all', ts: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-modal="false" aria-live="polite" aria-label="Cookie usage notice">
      <div className={styles.contentArea}>
        <div className={styles.textBlock}>
          <h2 className={styles.heading}>We value your privacy</h2>
          <p className={styles.paragraph}>
            Thought Stack uses cookies to keep you signed in, remember preferences, 
            and gather anonymous usage stats that help improve the platform. 
            By continuing you consent to our cookie usage. 
            See our <Link to="/usage-policy" className={styles.inlineLink}>Usage Policy</Link> for details.
          </p>
          {showPrefs && (
            <div className={styles.preferences}>
              <p className={styles.prefIntro}>What we store:</p>
              <ul className={styles.prefList}>
                <li><strong>Session</strong>: Secure authentication & load balancing.</li>
                <li><strong>Analytics</strong>: Aggregated page usage (never personal content).</li>
                <li><strong>Preferences</strong>: Language / theme selections.</li>
              </ul>
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryBtn} onClick={acceptCookies}>
            Accept & Continue
          </button>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => setShowPrefs(v => !v)}
            aria-expanded={showPrefs}
          >
            <span style={{color:'rgb(92, 75, 73)'}}>{showPrefs ? 'Hide details' : 'Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}