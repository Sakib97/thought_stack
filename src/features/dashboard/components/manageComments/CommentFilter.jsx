import styles from '../../styles/Filters.module.css'
import { Dropdown, Space } from 'antd';

const CommentFilter = ({filter, setFilter}) => {
    const getFilters = () => [
        {
            key: '1',
            label: <span className={styles.filterOption}>All Reports</span>,
            disabled: filter === 'all_reports',

        },
        {
            key: '2',
            label: <span className={styles.filterOption}>Pending Reports</span>,
            disabled: filter === 'pending_reports',

        },
        {
            key: '3',
            label: <span className={styles.filterOption}>Reviewed Reports</span>,
            disabled: filter === 'reviewed_reports',
            // selected: true

        },
        {
            key: '4',
            label: <span className={styles.filterOption}>Hidden Comments</span>,
            disabled: filter === 'hidden_comments',
            // selected: true
        },
        

    ];

    const handleMenuClick = ({ key }) => {
        if (key === '1') {
            setFilter('all_reports');
        } else if (key === '2') {
            setFilter('pending_reports');
        } else if (key === '3') {
            setFilter('reviewed_reports');
        } else if (key === '4') {
            setFilter('hidden_comments');
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
                        {/* {filter === 'new_deactive' ? 'New Deactive Users' :
                            filter === 'deactivated_by_admin' ? 'Deactivated by Admin' :
                                filter === 'active' ? 'Active Users' :
                                    filter === 'editor' ? 'Editors' :
                                        filter === 'admin' ? 'Admins' :
                                            filter === 'all_users' ? 'All Users' :
                                                'Filter By'} */}
                                
                                {filter === 'all_reports' ? 'All Reports' :
                                    filter === 'pending_reports' ? 'Pending Reports' :
                                        filter === 'reviewed_reports' ? 'Reviewed Reports' :
                                            filter === 'hidden_comments' ? 'Hidden Comments' :
                                                'Filter By'}


                        <div style={{ fontSize: '23px', transform: 'translateY(10%)' }}>
                            <i className="fi fi-rr-filter-list"></i>
                        </div>

                    </Space>
                </a>
            </Dropdown>

        </div>);
}

export default CommentFilter;