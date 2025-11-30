import styles from "../styles/UsagePolicyPage.module.css";

const sections = [
    {
        id: "acceptable-use",
        title: "1. Acceptable Use",
        body: [
            "Users must not engage in any activity that disrupts or interferes with the services or servers.",
            "Prohibited activities include, but are not limited to, unauthorized access, automated scraping without consent, data mining at scale, and spreading malware or malicious links."
        ]
    },
    {
        id: "comment-guidelines",
        title: "2. Comment Guidelines",
        body: [
            "You are solely responsible for the comments you share on The Fountainhead.",
            "Comments must not be illegal, harmful, defamatory, or infringe on intellectual property or privacy rights.",
            "We may remove or restrict comments that violate these guidelines, at our discretion."
        ]
    },
    {
        id: "privacy",
        title: "3. Privacy & Data Protection",
        body: [
            "We are committed to safeguarding your personal data.",
            // "Review our Privacy Policy to learn how information is collected, processed, stored, and retained.",
            "Never share personal or sensitive data in public posts unless you fully understand the visibility implications."
        ]
    },
    {
        id: "account-security",
        title: "4. Account Security",
        body: [
            "Maintain the confidentiality of your credentials and never share them with others.",
            "Immediately report suspected unauthorized access or suspicious account activity via the support channel.",
        ]
    },
    {
        id: "termination",
        title: "5. Suspension & Termination",
        body: [
            "We reserve the right to suspend or terminate accounts that violate policies, engage in abusive behavior, or pose security risks.",
            "Serious violations may result in immediate termination without prior warning."
        ]
    },
    {
        id: "changes",
        title: "6. Changes to This Policy",
        body: [
            "We may update this Usage Policy periodically to reflect platform changes, regulatory updates, or new security practices.",
            "Continued use of the platform after changes indicates acceptance of the updated terms."
        ]
    }
];

export default function UsagePolicyPage() {
    return (
        <main className={styles.wrapper}>
            <header className={styles.header}>
                <h1 className={styles.title}>Usage Policy</h1>
                <p className={styles.lead}>Your use of <b>The Fountainhead</b> implies agreement with the practices outlined below. Please read carefully.</p>
            </header>
            <nav className={styles.toc} aria-label="Usage policy table of contents">
                <ul>
                    {sections.map(s => (
                        <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                    ))}
                </ul>
            </nav>
            <div className={styles.sections}>
                {sections.map(section => (
                    <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
                        <h2 id={`${section.id}-title`} className={styles.sectionTitle}>{section.title}</h2>
                        {section.body.map((p, i) => <p key={i} className={styles.paragraph}>{p}</p>)}
                    </section>
                ))}
            </div>
            <footer className={styles.footer}>
                <p>Questions or concerns? Reach us at <a href="mailto:connect@thefountainhead.org" className={styles.link}>connect@thefountainhead.org</a>.</p>
                {/* <p className={styles.version}>Last updated: Nov 22, 2025</p> */}
            </footer>
        </main>
    );
}