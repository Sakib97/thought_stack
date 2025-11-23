import styles from '../styles/PrivacyPolicyPage.module.css';

// Simple helper to format current date (policy last updated)
const formatDate = (date) => date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
});

const PrivacyPolicyPage = () => {
    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last updated: {formatDate(new Date())}</p>
                <p className={styles.intro}>
                    Your privacy matters. This Privacy Policy explains how <strong>Thought Stack</strong> collects,
                    uses, discloses, and safeguards personal information when you use our website, platform, and related
                    services (collectively, the "Services"). If you disagree with any part of this Policy, please
                    discontinue use of the Services.
                </p>
            </header>

            <nav className={styles.toc} aria-label="Table of contents">
                <h2 className={styles.sectionHeading}>Contents</h2>
                <ul>
                    <li><a href="#information-we-collect">Information We Collect</a></li>
                    <li><a href="#how-we-use-information">How We Use Information</a></li>
                    <li><a href="#cookies-and-tracking">Cookies & Tracking</a></li>
                    {/* <li><a href="#legal-bases">Legal Bases (EEA / UK)</a></li> */}
                    <li><a href="#data-sharing">Data Sharing & Third Parties</a></li>
                    <li><a href="#data-retention">Data Retention</a></li>
                    <li><a href="#your-rights">Your Rights</a></li>
                    <li><a href="#security">Security</a></li>
                    <li><a href="#international-transfers">International Transfers</a></li>
                    <li><a href="#children">Children's Privacy</a></li>
                    <li><a href="#changes">Changes to this Policy</a></li>
                    <li><a href="#contact">Contact Us</a></li>
                </ul>
            </nav>

            <section id="information-we-collect" className={styles.section}>
                <h2>Information We Collect</h2>
                <p>We collect information to operate effectively and provide you with a personalized experience.</p>
                <ul className={styles.list}>
                    <li><strong>Account Data:</strong> Name, display name, email address, profile details you submit.</li>
                    <li><strong>Content:</strong> Articles, comments, reactions, and any media you upload or generate.</li>
                    <li><strong>Usage Data:</strong> Pages viewed, features used, referral URLs, timestamps, approximate location (derived from IP), device type, browser.</li>
                    <li><strong>Technical Data:</strong> IP address, user agent, operating system, language preference, authentication tokens.</li>
                    <li><strong>Support & Communications:</strong> Messages you send us (e.g., through the contact page) and related metadata.</li>
                    <li><strong>Optional Data:</strong> Preferences such as language selections or consent choices.</li>
                </ul>
            </section>

            <section id="how-we-use-information" className={styles.section}>
                <h2>How We Use Information</h2>
                <ul className={styles.list}>
                    <li>Provide, maintain, and improve the Services and core features (publishing, commenting, collaboration).</li>
                    <li>Personalize content recommendations and user experience.</li>
                    <li>Respond to inquiries, feedback, and support requests.</li>
                    <li>Monitor platform integrity, prevent spam, abuse, and enforce policies.</li>
                    <li>Perform analytics to understand engagement and improve performance.</li>
                    <li>Comply with legal obligations and protect rights, property, and safety.</li>
                    <li>Send service-related notifications (e.g., account or security alerts).</li>
                </ul>
            </section>

            <section id="cookies-and-tracking" className={styles.section}>
                <h2>Cookies & Tracking Technologies</h2>
                <p>We use cookies and similar technologies to remember preferences, secure your session, and analyze usage. You can typically control cookies via your browser settings. Disabling certain cookies may impact functionality. Categories may include:</p>
                <ul className={styles.list}>
                    <li><strong>Essential:</strong> Required for authentication and core operations.</li>
                    <li><strong>Functional:</strong> Remember preferences (e.g., language).</li>
                    <li><strong>Analytics:</strong> Aggregate usage insights to improve the platform.</li>
                </ul>
            </section>
{/* 
            <section id="legal-bases" className={styles.section}>
                <h2>Legal Bases (EEA / UK Users)</h2>
                <p>Where GDPR or UK GDPR applies, we process personal data under these legal bases:</p>
                <ul className={styles.list}>
                    <li><strong>Contract:</strong> To deliver the Services you request.</li>
                    <li><strong>Consent:</strong> For optional features or email communications.</li>
                    <li><strong>Legitimate Interests:</strong> Securing and improving the platform, preventing misuse.</li>
                    <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations.</li>
                </ul>
            </section> */}

            <section id="data-sharing" className={styles.section}>
                <h2>Data Sharing & Third Parties</h2>
                <p>We do not sell personal information. We may share data with trusted service providers strictly as needed to operate and enhance the Services (e.g., hosting, analytics, storage, security). Third parties must process data according to our instructions and applicable law.</p>
                <p>Content you choose to publish (articles, comments) is publicly visible. Avoid posting sensitive personal information.</p>
            </section>

            <section id="data-retention" className={styles.section}>
                <h2>Data Retention</h2>
                <p>We retain personal data only for as long as necessary to fulfill the purposes described or to comply with legal retention requirements. Public content may remain visible even after account closure unless you request removal where feasible.</p>
            </section>

            <section id="your-rights" className={styles.section}>
                <h2>Your Rights</h2>
                <p>Depending on your jurisdiction, you may have rights to:</p>
                <ul className={styles.list}>
                    <li>Access, correct, or delete your personal data.</li>
                    <li>Object to or restrict certain processing.</li>
                    <li>Port data in a structured, machine-readable format.</li>
                    <li>Withdraw consent where processing relies on consent.</li>
                    <li>Lodge a complaint with a supervisory authority.</li>
                </ul>
                <p>To exercise rights, contact us using the details below. We may verify your identity before fulfilling requests.</p>
            </section>

            <section id="security" className={styles.section}>
                <h2>Security</h2>
                <p>We implement reasonable technical and organizational safeguards to protect data (access controls, encryption in transit, monitoring). No method of transmission or storage is 100% secure; users are encouraged to use strong passwords and safeguard account credentials.</p>
            </section>

            <section id="international-transfers" className={styles.section}>
                <h2>International Transfers</h2>
                <p>Your information may be processed in countries other than your own. Where required, we implement appropriate safeguards (e.g., contractual clauses) to protect data when transferred internationally.</p>
            </section>

            <section id="children" className={styles.section}>
                <h2>Children's Privacy</h2>
                <p>The Services are not directed to children under 13 (or the age defined by local law). We do not knowingly collect data from minors. If you believe a minor has provided data, contact us for removal.</p>
            </section>

            <section id="changes" className={styles.section}>
                <h2>Changes to this Policy</h2>
                <p>We may update this Privacy Policy to reflect changes in law, technology, or our practices. Revisions become effective when posted. Continued use of the Services after changes constitutes acceptance.</p>
            </section>

            <section id="contact" className={styles.section}>
                <h2>Contact Us</h2>
                <p>If you have questions, requests, or concerns about privacy, contact us through the <a href="/contact">Contact page</a> or email: <strong>privacy@thoughtstack.example</strong>.</p>
            </section>
        </main>
    );
};

export default PrivacyPolicyPage;