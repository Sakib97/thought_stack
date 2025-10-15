import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import Spinner from "react-bootstrap/Spinner";

const AdminAndEditorOnlyRoute = ({ children }) => {
    const { user, userMeta, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while user state is being resolved
    if (loading) {
        return (
            <div style={{ textAlign: "center", margin: "100px" }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    // Redirect to sign in if user not logged in
    if (!user) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }

    // Check if userMeta exists and role/is_active are valid
    const allowedRoles = ["admin", "editor"];
    const isAllowed =
        userMeta &&
        allowedRoles.includes(userMeta.role) &&
        userMeta.is_active === true;

    if (!isAllowed) {
        return <Navigate to="/notfound" replace />;
    }

    // Authorized (admin or active editor)
    return children;
};

export default AdminAndEditorOnlyRoute;
