import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import Spinner from "react-bootstrap/Spinner";

const AdminOnlyRoute = ({ children }) => {
    const { user, userMeta, loading } = useAuth();
    const location = useLocation();

    // Show spinner while loading user info
    if (loading) {
        console.log(userMeta);
        
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    // If not logged in
    if (!user) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }

    // If user is not admin
    if (!userMeta || userMeta.is_active === false || userMeta.role !== "admin") {
        return <Navigate to="/notfound" replace />;
    }

    // Authorized admin
    return children;
};

export default AdminOnlyRoute;