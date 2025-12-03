import { Toaster } from "react-hot-toast";
import { useState } from "react";
import styles from "../styles/ManageArticlesPage.module.css";
import ArticleFilter from "../components/manageArticles/ArticleFilter";
import ArticleList from "../components/manageArticles/ArticleList";
import RefreshBtn from "../components/RefreshBtn";
import ArticleFeature from "../components/manageArticles/ArticleFeature";
import {useAuth} from "../../../context/AuthProvider";
const ManageArticlesPage = () => {
    const [filter, setFilter] = useState('all_articles');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const {userMeta} = useAuth();
    const isUserAdmin = userMeta?.role === 'admin';
    const isUserActive = userMeta?.is_active;

    if ( !isUserActive) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }
    
    return (
        <div>
            <Toaster />
            <h2>Article Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <ArticleFilter filter={filter} setFilter={setFilter} />
                <RefreshBtn refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger} />
            </div>
            <hr />
            <ArticleList filter={filter} refreshTrigger={refreshTrigger} />

            <hr />

            {/* only admins can set featured article */}
            {isUserAdmin && ( 
                <>
                    <hr />
                    <ArticleFeature />
                    <hr />
                </>
            )}
        </div>
    );
}

export default ManageArticlesPage;