import LogoutButton from "../../auth/components/LogoutButton";
import { useAuth } from "../../../context/AuthProvider";
import styles from '../styles/ProfilePage.module.css';
const ProfilePage = () => {
    const { user } = useAuth();
    if (!user) {
        return <p>Not Logged In !</p>;
    }
    // console.log(user);

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>User Profile</h1>
                    <img
                        src={
                            user.user_metadata?.avatar_url ||
                            "https://via.placeholder.com/100/cccccc/000000?text=User"
                        }
                        alt="avatar"
                        className={styles.avatar}
                        referrerPolicy="no-referrer"
                    />
                    <h2 className={styles.welcome}>
                        Welcome {user.user_metadata?.full_name || "User"}
                    </h2>
                    <p className={styles.email}>{user.email}</p>
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;