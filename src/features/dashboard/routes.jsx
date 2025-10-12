import ProtectedRoute from "../../components/common/ProjectedRoute";
import DashboardPage from "../dashboard/pages/DashboardPage";
import ProfilePage from "../dashboard/pages/ProfilePage";
import WriteArticlePage from "../articles/pages/WriteArticlePage";
import ManageUsersPage from "../dashboard/pages/ManageUsersPage";
import ManageArticlesPage from "../dashboard/pages/ManageArticlesPage";
import ManageCommentsPage from "../dashboard/pages/ManageCommentsPage";

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
        path: "manage-articles",
        element: <ManageArticlesPage />
      },
      {
        path: "manage-comments",
        element: <ManageCommentsPage />
      },
      {
        path: "manage-users",
        element: <ManageUsersPage />
      },
    ]
  },
];

export default dashboardRoutes;
