import styles from '../../styles/Filters.module.css'
import { Dropdown, Space } from 'antd';
import { useRef, useState } from 'react';
const UserFilter = () => {

    const getFilters = () => [
        {
            key: '1',
            label: <span>New Deactive Users</span>,
            // disabled: sortOrder === 'desc', 
        },
        {
            key: '2',
            label: <span>Forced Deactive Users</span>,
            // disabled: sortOrder === 'asc', 
        },
        {
            key: '3',
            label: <span>Active Users</span>,
            // disabled: sortOrder === 'asc', 
        },
    ];
    return (
        <div>
            <Dropdown
                menu={{
                    items: getFilters(),
                }}
                className={styles.filterDropdown}
            >
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        Filter By
                        {/* <DownOutlined /> */}
                        <i style={{ fontSize: '23px', transform: 'translateY(20%)' }} className="fi fi-rr-filter-list"></i>
                    </Space>
                </a>
            </Dropdown>
        </div>
    );
}

export default UserFilter;