import { Navigate } from "react-router-dom";
import ArticleDetails from "./pages/ArticleDetails";

const articleRoutes = [
    {
        path: "/article/:articleID/:articleTitleSlug",
        element: <ArticleDetails />,
    },
];

export default articleRoutes;