import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem'}}>Loading...</div>;
    return user ? <Navigate to="/dashboard/profile" /> : children;
};

export default AuthRedirect;
