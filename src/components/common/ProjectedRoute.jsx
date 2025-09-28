import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem'}}>Loading...</div>;

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return children;
};
 
export default ProtectedRoute;