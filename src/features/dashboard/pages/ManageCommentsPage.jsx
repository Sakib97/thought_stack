import CommentFilter from "../components/manageComments/CommentFilter";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import styles from "../styles/ManageCommentsPage.module.css";
import CommentsList from "../components/manageComments/CommentsList";

const ManageCommentsPage = () => {
    const [filter, setFilter] = useState('all_reports');

    return ( 
        <div>
            <Toaster />
            <h2>Comment Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <CommentFilter filter={filter} setFilter={setFilter} />
            </div>
            <hr />
            <CommentsList filter={filter}  />
        </div>
     );
}
 
export default ManageCommentsPage;