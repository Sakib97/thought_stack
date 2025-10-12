import styles from '../../styles/Filters.module.css'
import { Dropdown, Space } from 'antd';

const UserFilter = ({ filter, setFilter }) => {

    const getFilters = () => [
        {
            key: '1',
            label: <span className={styles.filterOption}>All Users</span>,
            disabled: filter === 'all_users',
            // selected: true

        },
        {
            key: '2',
            label: <span className={styles.filterOption}>New Deactive Users</span>,
            disabled: filter === 'new_deactive',

        },
        {
            key: '3',
            label: <span className={styles.filterOption}>Deactivated by Admin</span>,
            disabled: filter === 'deactivated_by_admin',
        },
        {
            key: '4',
            label: <span className={styles.filterOption}>Active Users</span>,
            disabled: filter === 'active',
        },
        {
            key: '5',
            label: <span className={styles.filterOption}>Editors</span>,
            disabled: filter === 'editor',
        },
        {
            key: '6',
            label: <span className={styles.filterOption}>Admins</span>,
            disabled: filter === 'admin',
        },

    ];

    const handleMenuClick = ({ key }) => {
        if (key === '1') {
            setFilter('all_users');
        } else if (key === '2') {
            setFilter('new_deactive');
        } else if (key === '3') {
            setFilter('deactivated_by_admin');
        } else if (key === '4') {
            setFilter('active');
        } else if (key === '5') {
            setFilter('editor');
        } else if (key === '6') {
            setFilter('admin');
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
                        {filter === 'new_deactive' ? 'New Deactive Users' :
                            filter === 'deactivated_by_admin' ? 'Deactivated by Admin' :
                                filter === 'active' ? 'Active Users' :
                                    filter === 'editor' ? 'Editors' :
                                        filter === 'admin' ? 'Admins' :
                                            filter === 'all_users' ? 'All Users' :
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

export default UserFilter;