import CommentFilter from "../components/manageComments/CommentFilter";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import styles from "../styles/ManageCommentsPage.module.css";
import CommentsList from "../components/manageComments/CommentsList";
import RefreshBtn from "../components/RefreshBtn";

const ManageCommentsPage = () => {
    const [filter, setFilter] = useState('all_reports');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return ( 
        <div>
            <Toaster />
            <h2>Reported Comment Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <CommentFilter filter={filter} setFilter={setFilter} />
                <RefreshBtn refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger} />
            </div>
            <hr />
            <CommentsList filter={filter} refreshTrigger={refreshTrigger} />
        </div>
     );
}
 
export default ManageCommentsPage;