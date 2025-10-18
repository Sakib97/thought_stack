import { lazy } from "react";
import ContactPage from "./pages/ContactPage";

const LazyContactPage = lazy(() => import("./pages/ContactPage"));

const aboutRoutes = [
    {
        path: "/contact",
        // element: <ContactPage />,
        element: <LazyContactPage />,
    },
];

export default aboutRoutes;