import ProtectedRoute from "../../components/common/ProjectedRoute";
import DashboardPage from "../dashboard/pages/DashboardPage";
import ProfilePage from "../dashboard/pages/ProfilePage";
import { Navigate } from "react-router-dom";
const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="profile" replace />,
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
    ]
  },
];

export default dashboardRoutes;
