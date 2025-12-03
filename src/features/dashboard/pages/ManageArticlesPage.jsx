import { Toaster } from "react-hot-toast";
import { useState } from "react";
import styles from "../styles/ManageArticlesPage.module.css";
import ArticleFilter from "../components/manageArticles/ArticleFilter";
import ArticleList from "../components/manageArticles/ArticleList";
import RefreshBtn from "../components/RefreshBtn";
import ArticleFeature from "../components/manageArticles/ArticleFeature";

const ManageArticlesPage = () => {
    const [filter, setFilter] = useState('all_articles');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
            <hr />
            <ArticleFeature />
            <hr />
        </div>
    );
}

export default ManageArticlesPage;