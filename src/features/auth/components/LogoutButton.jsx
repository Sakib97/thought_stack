import { supabase } from "../../../config/supabaseClient";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth/signin");
    };

    return (
        <button onClick={handleLogout} style={{ cursor: "pointer", backgroundColor: "red", color: "white" }}>
            Logout
        </button>
    );
}
 
export default LogoutButton;