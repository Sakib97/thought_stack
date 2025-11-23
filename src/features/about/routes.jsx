import { lazy } from "react";

// Lazy loaded pages for "about" feature
const LazyContactPage = lazy(() => import("./pages/ContactPage"));
const LazyUsagePolicyPage = lazy(() => import("./pages/UsagePolicyPage"));
const LazyPrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const LazyTermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));

const aboutRoutes = [
    {
        path: "/contact",
        element: <LazyContactPage />,
    },
    {
        path: "/usage-policy",
        element: <LazyUsagePolicyPage />,
    },
    {
        path: "/privacy-policy",
        element: <LazyPrivacyPolicyPage />,
    }
    ,
    {
        path: "/terms-of-service",
        element: <LazyTermsOfServicePage />,
    }
];

export default aboutRoutes;