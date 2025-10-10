import ProtectedRoute from "../../components/common/ProjectedRoute";
import DashboardPage from "../dashboard/pages/DashboardPage";
import ProfilePage from "../dashboard/pages/ProfilePage";
import WriteArticlePage from "../articles/pages/WriteArticlePage";
import ManageUsersPage from "../dashboard/pages/ManageUsersPage";

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
      {
        path: "write-article",
        element: <WriteArticlePage />
      },
      {
        path: "manage-users",
        element: <ManageUsersPage />
      },
    ]
  },
];

export default dashboardRoutes;
