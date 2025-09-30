import AuthPage from "./pages/AuthPage";
import LoginForm from "./components/LoginForm";
import AuthRedirect from "../../components/common/AuthRedirect";
import { Navigate } from "react-router-dom";
const authRoutes = [
  {
    path: "/auth",
    element: <AuthPage />,
    children: [
      {
        index: true,
        element: <Navigate to="signin" replace />,
      },
      {
        path: "signin",
        element: (
          <AuthRedirect>
            <LoginForm />
          </AuthRedirect>
        ),
      },
    ],
  },
];

export default authRoutes;