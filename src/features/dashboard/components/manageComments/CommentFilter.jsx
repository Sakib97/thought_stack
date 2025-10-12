import styles from '../../styles/Filters.module.css'
import { Dropdown, Space } from 'antd';

const CommentFilter = () => {
    const getFilters = () => [
        {
            key: '1',
            label: <span className={styles.filterOption}>All Reports</span>,
            // disabled: filter === 'all_users',
            // selected: true

        },
        {
            key: '2',
            label: <span className={styles.filterOption}>Pending Reports</span>,
            // disabled: filter === 'all_users',
            // selected: true

        },
        {
            key: '3',
            label: <span className={styles.filterOption}>Resolved Reports</span>,
            // disabled: filter === 'new_deactive',

        },
        

    ];


    return (
        <div>

            <Dropdown
                menu={{
                    items: getFilters(),
                    // onClick: handleMenuClick,
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
                                Filter By


                        <div style={{ fontSize: '23px', transform: 'translateY(10%)' }}>
                            <i className="fi fi-rr-filter-list"></i>
                        </div>

                    </Space>
                </a>
            </Dropdown>

        </div>);
}

export default CommentFilter;