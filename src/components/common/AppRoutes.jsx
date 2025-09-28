import HomePage from "../../features/home/pages/HomePage";
import NotFound from "./NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Dynamically load all routes.js files under /features
const routeModules = import.meta.glob("../../features/**/routes.jsx", { eager: true });
// console.log(routeModules);

const allRoutes = Object.values(routeModules).flatMap(mod => mod.default || mod.routes || []);
// console.log(allRoutes);

function renderRoutes(routes) {
    return routes.map(({ path, element, children, index }, i) => {
        if (index) {
            // Render index routes separately
            return <Route key={i} index element={element} />;
        }
        return (
            <Route key={i} path={path} element={element}>
                {children && renderRoutes(children)}
            </Route>
        );
    });
}

export default function AppRoutes() {
    return (
        // <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            {renderRoutes(allRoutes)}
        </Routes>
        // </BrowserRouter>
    );
}