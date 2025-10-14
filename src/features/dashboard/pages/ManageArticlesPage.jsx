import { Toaster } from "react-hot-toast";
import { useState } from "react";
import styles from "../styles/ManageArticlesPage.module.css";
import ArticleFilter from "../components/manageArticles/ArticleFilter";
import ArticleList from "../components/manageArticles/ArticleList";
                        
const ManageArticlesPage = () => {
    const [filter, setFilter] = useState('all_articles');

    return (
        <div>
            <Toaster />
            <h2>Article Management</h2>
            <hr />
            <div className={styles.filtersContainer}>
                <ArticleFilter filter={filter} setFilter={setFilter} />
            </div>
            <hr />
            <ArticleList filter={filter} />
        </div>
    );
}

export default ManageArticlesPage;