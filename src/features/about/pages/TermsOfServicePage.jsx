import styles from '../styles/TermsOfServicePage.module.css';

const formatDate = (date) => date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const TermsOfService = () => {
    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Terms of Service</h1>
                <p className={styles.lastUpdated}>Effective date: {formatDate(new Date())}</p>
                <p className={styles.intro}>
                    These Terms of Service ("Terms") govern your access to and use of the The Fountainhead platform, website,
                    and related services (collectively, the "Services"). By creating an account, accessing, or using the
                    Services you agree to be bound by these Terms. If you do not agree, you must discontinue use.
                </p>
            </header>

            <nav className={styles.toc} aria-label="Table of contents">
                <h2 className={styles.tocHeading}>Contents</h2>
                <ul>
                    <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                    <li><a href="#accounts">2. Accounts & Eligibility</a></li>
                    <li><a href="#user-content">3. User Content & License</a></li>
                    <li><a href="#ip">4. Intellectual Property</a></li>
                    <li><a href="#prohibited">5. Prohibited Conduct</a></li>
                    <li><a href="#availability">6. Platform Availability & Changes</a></li>
                    <li><a href="#third-party">7. Third-Party Services & Links</a></li>
                    <li><a href="#disclaimers">8. Disclaimers</a></li>
                    <li><a href="#liability">9. Limitation of Liability</a></li>
                    <li><a href="#indemnification">10. Indemnification</a></li>
                    <li><a href="#termination">11. Termination</a></li>
                    <li><a href="#governing-law">12. Governing Law</a></li>
                    <li><a href="#changes">13. Changes to Terms</a></li>
                    <li><a href="#contact">14. Contact</a></li>
                </ul>
            </nav>

            <section id="acceptance" className={styles.section}>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    Your use of the Services is subject to these Terms and our Privacy Policy. Supplemental guidelines or
                    rules may apply to specific features; all such additional terms are incorporated by reference.
                </p>
            </section>

            <section id="accounts" className={styles.section}>
                <h2>2. Accounts & Eligibility</h2>
                <ul className={styles.list}>
                    <li>You must provide accurate, complete information when creating an account.</li>
                    <li>You are responsible for safeguarding credentials and all activity under your account.</li>
                    <li>You must be at least the age of majority in your jurisdiction or have parental consent where required.</li>
                    <li>We may suspend or reject accounts that violate these Terms or applicable law.</li>
                </ul>
            </section>

            <section id="user-content" className={styles.section}>
                <h2>3. User Content & License</h2>
                <p>
                    "User Content" includes articles, comments, media, and other material you submit or publish. You retain
                    ownership of your User Content. By submitting, you grant  The Fountainhead a worldwide, non-exclusive,
                    royalty-free license to host, store, display, reproduce, and distribute your User Content solely for
                    operating, promoting, and improving the Services. You represent you have the rights necessary to grant
                    this license and that your content does not infringe third-party rights.
                </p>
                <p>We may moderate, remove, or restrict visibility of content that violates policies.</p>
            </section>

            <section id="ip" className={styles.section}>
                <h2>4. Intellectual Property</h2>
                <p>
                    All platform code, trademarks, logos, and design elements are the property of  The Fountainhead or its
                    licensors. Except for limited rights granted herein, no intellectual property rights are transferred.
                </p>
            </section>

            <section id="prohibited" className={styles.section}>
                <h2>5. Prohibited Conduct</h2>
                <p>When using the Services you must NOT:</p>
                <ul className={styles.list}>
                    <li>Violate any applicable law or regulation.</li>
                    <li>Post abusive, harassing, hateful, defamatory, or deceptive material.</li>
                    <li>Attempt to exploit or harm minors.</li>
                    <li>Transmit malware, spam, or automated scraping without permission.</li>
                    <li>Reverse engineer, disrupt, or overload platform infrastructure.</li>
                    <li>Misrepresent identity or affiliation.</li>
                    <li>Collect personal data of others without lawful basis or consent.</li>
                </ul>
            </section>

            <section id="availability" className={styles.section}>
                <h2>6. Platform Availability & Changes</h2>
                <p>
                    We strive for continuous availability but do not guarantee uninterrupted operation. Features may change,
                    pause, or be discontinued at our discretion without liability. Advance notice may be provided when feasible.
                </p>
            </section>

            <section id="third-party" className={styles.section}>
                <h2>7. Third-Party Services & Links</h2>
                <p>
                    The Services may integrate or link to third-party sites or tools. We do not endorse or assume responsibility
                    for third-party content, privacy practices, or operations. Use at your own risk.
                </p>
            </section>

            <section id="disclaimers" className={styles.section}>
                <h2>8. Disclaimers</h2>
                <p>
                    THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                    LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Your use is at your risk.
                </p>
            </section>

            <section id="liability" className={styles.section}>
                <h2>9. Limitation of Liability</h2>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW,  THE FOUNTAINHEAD AND ITS AFFILIATES SHALL NOT BE LIABLE FOR INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR REVENUE, ARISING
                    FROM OR RELATED TO YOUR USE OF THE SERVICES. TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU (IF ANY)
                    TO USE THE SERVICES IN THE SIX (6) MONTHS PRECEDING THE CLAIM.
                </p>
            </section>

            <section id="indemnification" className={styles.section}>
                <h2>10. Indemnification</h2>
                <p>
                    You agree to defend, indemnify, and hold harmless The Fountainhead and its officers, directors, employees, and
                    agents from any claims, damages, liabilities, costs, or expenses (including reasonable legal fees) arising out
                    of your User Content, misuse of the Services, violation of these Terms, or infringement of third-party rights.
                </p>
            </section>

            <section id="termination" className={styles.section}>
                <h2>11. Termination</h2>
                <p>
                    We may suspend or terminate access to the Services at any time for breach or suspected breach of these Terms
                    or to protect platform integrity. Upon termination, your right to use the Services ceases immediately. Certain
                    provisions (ownership, disclaimers, limitation of liability, indemnification) survive termination.
                </p>
            </section>

            <section id="governing-law" className={styles.section}>
                <h2>12. Governing Law</h2>
                <p>
                    These Terms are governed by the laws of Bangladesh (without regard to conflict of law principles), unless
                    mandatory local consumer protections require otherwise.
                </p>
            </section>

            <section id="changes" className={styles.section}>
                <h2>13. Changes to Terms</h2>
                <p>
                    We may revise these Terms periodically. Updated versions are effective when posted. Continued use after changes
                    constitutes acceptance. Material changes may be highlighted or communicated via notices.
                </p>
            </section>

            <section id="contact" className={styles.section}>
                <h2>14. Contact</h2>
                <p>
                    Questions about these Terms? Reach out via the <a href="/contact">Contact page</a> or email:
                    <strong> connect@thefountainhead.org </strong>.
                </p>
            </section>
        </main>
    );
};

export default TermsOfService;