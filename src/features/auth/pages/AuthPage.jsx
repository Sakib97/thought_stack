import { Outlet } from "react-router-dom";

const AuthPage = () => {
    return (
        <div>
            {/* <h1>Authentication</h1> */}
            <Outlet />
        </div>
    );
}
 
export default AuthPage;