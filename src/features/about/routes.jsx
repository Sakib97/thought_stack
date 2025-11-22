import { lazy } from "react";

// Lazy loaded pages for "about" feature
const LazyContactPage = lazy(() => import("./pages/ContactPage"));
const LazyUsagePolicyPage = lazy(() => import("./pages/UsagePolicyPage"));

const aboutRoutes = [
    {
        path: "/contact",
        element: <LazyContactPage />,
    },
    {
        path: "/usage-policy",
        element: <LazyUsagePolicyPage />,
    }
];

export default aboutRoutes;