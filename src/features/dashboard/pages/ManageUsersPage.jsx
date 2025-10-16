import UserFilter from "../components/manageUsers/UserFilter";
import styles from "../styles/ManageUsersPage.module.css";
import UserList from "../components/manageUsers/UserList";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import RefreshBtn from "../components/RefreshBtn";

const ManageUsersPage = () => {
    const [filter, setFilter] = useState('all_users');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // console.log(refreshTrigger);
    
    return (
        <div>
            <Toaster />
            <h2>User Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <UserFilter filter={filter} setFilter={setFilter} />
                <RefreshBtn refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger} />
            </div>
            <hr />
            <UserList filter={filter} refreshTrigger={refreshTrigger} />
        </div>
    );
}

export default ManageUsersPage;