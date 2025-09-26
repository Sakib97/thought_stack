import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

// const ProtectedRoute = () => {
//     const { user, loading } = useAuth();

//     if (loading) return <div>Loading...</div>;

//     return user ? <Outlet /> : <Navigate to="/auth/signin" replace />;
// }
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};
 
export default ProtectedRoute;