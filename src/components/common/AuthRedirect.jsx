import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? <Navigate to="/dashboard" /> : children;
};

export default AuthRedirect;
