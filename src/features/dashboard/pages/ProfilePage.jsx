import LogoutButton from "../../auth/components/LogoutButton";
import { useAuth } from "../../../context/AuthProvider";
import styles from '../styles/ProfilePage.module.css';
import useUserMeta from "../../../hooks/useUserMeta";
import Badge from 'react-bootstrap/Badge';

const ProfilePage = () => {
    const { user, userMeta } = useAuth();
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
                    {userMeta?.is_active ? (
                        <>
                            Role : <Badge
                                bg={
                                    userMeta?.role === "admin"
                                        ? "success"
                                        : userMeta?.role === "editor"
                                            ? "primary"
                                            : "secondary"
                                }
                            >
                                <span style={{fontSize:'13px'}}>{userMeta?.role?.toUpperCase() || "N/A"}</span>
                            </Badge>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'red' }}>
                                Your account is currently deactivated.</span>
                        </>
                    )}
                    <br /> <br />
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;