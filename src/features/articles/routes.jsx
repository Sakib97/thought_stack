import { Navigate } from "react-router-dom";
import ArticleDetails from "./pages/ArticleDetails";
import { lazy } from "react";

const LazyArticleDetails = lazy(() => import("./pages/ArticleDetails"));

const articleRoutes = [
    {
        path: "/article/:articleID/:articleTitleSlug",
        // element: <ArticleDetails />,
        element: <LazyArticleDetails />,
    },
];

export default articleRoutes; 