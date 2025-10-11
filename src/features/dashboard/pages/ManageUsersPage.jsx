import SearchBox from "../components/manageUsers/SearchBox";
import UserFilter from "../components/manageUsers/UserFilter";
import styles from "../styles/ManageUsersPage.module.css";
import UserList from "../components/manageUsers/UserList";
import { Toaster } from "react-hot-toast";

const ManageUsersPage = () => {
    return (
        <div>
            <Toaster />
            <h2>User Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <UserFilter />
                <SearchBox />
            </div>
            <hr />
            <UserList />
        </div>
    );
}

export default ManageUsersPage;