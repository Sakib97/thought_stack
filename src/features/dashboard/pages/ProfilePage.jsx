import LogoutButton from "../../auth/components/LogoutButton";
import { useAuth } from "../../../context/AuthProvider";

const ProfilePage = () => {
    const { user } = useAuth();
    if (!user) {
        return <p>Not Logged In !</p>;
    }
    // console.log(user);

    return (
        <div>
            <h1>User Profile</h1>
            <h2>Welcome {user.user_metadata.full_name || "User"}</h2>
            <p>Email: {user.email}</p>
            <img
                src="https://lh3.googleusercontent.com/a/ACg8ocLLxyuALY9fC6H4nKxHRHD_KROL5lNOOwbZzUY-P3OPVeB92A4k=s96-c"
                alt="avatar"
                width="50"
                height="50"
                style={{ borderRadius: '50%' }}
                referrerPolicy="no-referrer" 
            />
            <br />
            <LogoutButton />
        </div>
    );
}

export default ProfilePage;