import UserFilter from "../components/manageUsers/UserFilter";
import styles from "../styles/ManageUsersPage.module.css";
import UserList from "../components/manageUsers/UserList";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

const ManageUsersPage = () => {
    const [filter, setFilter] = useState('all_users');
    return (
        <div>
            <Toaster />
            <h2>User Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <UserFilter filter={filter} setFilter={setFilter} />
            </div>
            <hr />
            <UserList filter={filter} />
        </div>
    );
}

export default ManageUsersPage;