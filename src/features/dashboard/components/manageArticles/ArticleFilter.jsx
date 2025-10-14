import styles from '../../styles/Filters.module.css'
import { Dropdown, Space } from 'antd';

const ArticleFilter = ({ filter, setFilter }) => {

    const getFilters = () => [
        {
            key: '1',
            label: <span className={styles.filterOption}>All Articles</span>,
            disabled: filter === 'all_articles',
        },
        {
            key: '2',
            label: <span className={styles.filterOption}>Restricted Articles</span>,
            disabled: filter === 'restricted_articles',

        },
        {
            key: '3',
            label: <span className={styles.filterOption}>Active Articles</span>,
            disabled: filter === 'active_articles',
        },

    ];

    const handleMenuClick = ({ key }) => {
        if (key === '1') {
            setFilter('all_articles');
        } else if (key === '2') {
            setFilter('restricted_articles');
        } else if (key === '3') {
            setFilter('active_articles');
        } 

    };

    return (
        <div>
            <Dropdown
                menu={{
                    items: getFilters(),
                    onClick: handleMenuClick,
                }}
                className={styles.filterDropdown}
                placement="bottom"
                arrow
            >
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        {filter === 'all_articles' ? 'All Articles' :
                            filter === 'restricted_articles' ? 'Restricted Articles' :
                                filter === 'active_articles' ? 'Active Articles' :
                                    'Filter By'}


                        <div style={{ fontSize: '23px', transform: 'translateY(10%)' }}>
                            <i className="fi fi-rr-filter-list"></i>
                        </div>

                    </Space>
                </a>
            </Dropdown>
        </div>
    );
}

export default ArticleFilter;