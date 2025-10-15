import ProtectedRoute from "../../components/common/ProjectedRoute";
import DashboardPage from "../dashboard/pages/DashboardPage";
import ProfilePage from "../dashboard/pages/ProfilePage";
import WriteArticlePage from "../articles/pages/WriteArticlePage";
import ManageUsersPage from "../dashboard/pages/ManageUsersPage";
import ManageArticlesPage from "../dashboard/pages/ManageArticlesPage";
import ManageCommentsPage from "../dashboard/pages/ManageCommentsPage";
import { Navigate } from "react-router-dom";
import AdminOnlyRoute from "../../components/common/AdminOnlyRoute";
import AdminAndEditorOnlyRoute from "../../components/common/AdminAndEditorOnlyRoute";

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
        element: 
        (
          <AdminAndEditorOnlyRoute>
            <WriteArticlePage />
          </AdminAndEditorOnlyRoute>
        ),
        
      },
      {
        path: "manage-articles",
        element: (
          <AdminAndEditorOnlyRoute>
            <ManageArticlesPage />
          </AdminAndEditorOnlyRoute>
        ),
      },
      {
        path: "manage-comments",
        element:
          (
            <AdminAndEditorOnlyRoute>
              <ManageCommentsPage />
            </AdminAndEditorOnlyRoute>
          ),
      },
      {
        path: "manage-users",
        element: (
          <AdminOnlyRoute>
            <ManageUsersPage />
          </AdminOnlyRoute>
        ),
      },
    ]
  },
];

export default dashboardRoutes;
