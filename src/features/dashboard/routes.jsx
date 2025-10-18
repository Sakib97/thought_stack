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
import { lazy } from "react";

const LazyDashboardPage = lazy(() => import("../dashboard/pages/DashboardPage"));
const LazyProfilePage = lazy(() => import("../dashboard/pages/ProfilePage"));
const LazyWriteArticlePage = lazy(() => import("../articles/pages/WriteArticlePage"));
const LazyManageUsersPage = lazy(() => import("../dashboard/pages/ManageUsersPage"));
const LazyManageArticlesPage = lazy(() => import("../dashboard/pages/ManageArticlesPage"));
const LazyManageCommentsPage = lazy(() => import("../dashboard/pages/ManageCommentsPage"));

const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        {/* <DashboardPage /> */}
        <LazyDashboardPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="profile" replace />,
      },
      {
        path: "profile",
        // element: <ProfilePage />
        element: <LazyProfilePage />,
      },
      {
        path: "write-article",
        element: 
        (
          <AdminAndEditorOnlyRoute>
            {/* <WriteArticlePage /> */}
            <LazyWriteArticlePage />
          </AdminAndEditorOnlyRoute>
        ),
        
      },
      {
        path: "manage-articles",
        element: (
          <AdminAndEditorOnlyRoute>
            {/* <ManageArticlesPage /> */}
            <LazyManageArticlesPage />
          </AdminAndEditorOnlyRoute>
        ),
      },
      {
        path: "manage-comments",
        element:
          (
            <AdminAndEditorOnlyRoute>
              {/* <ManageCommentsPage /> */}
              <LazyManageCommentsPage />
            </AdminAndEditorOnlyRoute>
          ),
      },
      {
        path: "manage-users",
        element: (
          <AdminOnlyRoute>
            {/* <ManageUsersPage /> */}
            <LazyManageUsersPage />
          </AdminOnlyRoute>
        ),
      },
    ]
  },
];

export default dashboardRoutes;
