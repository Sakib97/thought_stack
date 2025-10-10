import { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Avatar, Input, Space, Table } from 'antd';
import styles from '../../styles/UserList.module.css'
import { supabase } from '../../../../config/supabaseClient';
import Badge from 'react-bootstrap/Badge';
import ActivateBtn from './ActivateBtn';

import { Grid } from 'antd';
import RoleChangeBtn from './RoleChangeBtn';
const { useBreakpoint } = Grid;

const PAGE_SIZE = 3;
const UserList = () => {
    const screens = useBreakpoint(); // gives: { xs, sm, md, lg, xl, xxl }
    const isMobile = !screens.md; // true for <768px

    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // The database column being searched (e.g. "name" or "email")
    const [searchField, setSearchField] = useState(null);
    //The text searching for in that column (e.g. "john")
    const [searchValue, setSearchValue] = useState('');

    const searchInput = useRef(null);

    // Fetch users (handles both search + pagination)
    const fetchUsers = async (pageNumber = 1, field = null, value = '') => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // base query
            let query = supabase
                .from('users_meta')
                .select('uid, email, role, name, is_active, avatar_url, status_reason', { count: 'exact' })
                .order('name', { ascending: true });

            // optional search
            if (field && value) {
                query = query.ilike(field, `%${value}%`);
            }

            // add pagination
            query = query.range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;

            setData(
                data.map((user, idx) => ({
                    // key: idx + from + 1,
                    key: user.uid,
                    uid: user.uid,
                    profilePicture: user.avatar_url,
                    name: user.name,
                    email: user.email,
                    activeStatus: user.is_active ? 'Active' : 'Inactive',
                    role: user.role,
                    statusReason: user.status_reason,
                }))
            );
            setTotalCount(count || 0); // ensures pagination knows total records
        } catch (err) {
            console.error('Error fetching users:', err.message);
        } finally {
            setLoading(false);
        }
    };

    // fetch data when page/search changes
    useEffect(() => {
        fetchUsers(page, searchField, searchValue);
    }, [page, searchField, searchValue]);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        // console.log('Searching:', selectedKeys, dataIndex); //['ash'], name

        setSearchField(dataIndex);
        setSearchValue(selectedKeys[0]);
        setPage(1); // reset to first page on new search
    };

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchField(null);
        setSearchValue('');
        confirm({ closeDropdown: true }); // closes dropdown & resets AntD filter UI
        setPage(1); // reset to first page on reset
        console.log(data);

    };

    // Update the specific row in data state when status changes
    const handleStatusChange = (userId, newIsActive) => {
        setData(prevData =>
            prevData.map(user =>
                user.uid === userId
                    ? {
                        ...user,
                        activeStatus: newIsActive ? 'Active' : 'Inactive',
                        statusReason: newIsActive
                            ? 'activated_by_admin'
                            : 'deactivated_by_admin',
                    }
                    : user
            )
        );
    };

    // Generic search filter for any column
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters, confirm)} size="small">
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    fontSize: '15px',
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
    });

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePicture',
            key: 'profilePicture',
            width: isMobile ? 40 : 90,
            fixed: 'left',
            align: 'center',
            className: styles.fixedColumn,
            render: (src) =>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar src={src} />
                </div>
            ,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            // align: 'center',
            width: isMobile ? 130 : 150,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            //  align: 'center',
            width: isMobile ? 100 : 200,
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Active Status',
            dataIndex: 'activeStatus',
            key: 'activeStatus',
            align: 'center',
            width: isMobile ? 50 : 100,
            render: (status) => (
                <span
                    style={{
                        fontWeight: 'bold',
                    }}
                >
                    <Badge bg={status === 'Active' ? 'success' : 'danger'}>{status}</Badge>
                </span>
            ),
        },
        Table.EXPAND_COLUMN,
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            align: 'center',
            width: isMobile ? 50 : 100,
            render: (role) => (
                <span
                    style={{
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                    }}
                >
                    <Badge bg={role === 'admin' ? 'success' : role === 'editor' ? 'warning' : 'secondary'}>
                        {role}
                    </Badge>
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: isMobile ? 40 : 150,
            render: (record) => (
                <div className={styles.actionColumn}>
                    <ActivateBtn userId={record.uid}
                        userStatus={record.activeStatus}
                        onStatusChange={handleStatusChange} />
                    &nbsp;&nbsp;
                    <RoleChangeBtn />

                </div>
            ),
        },
    ];



    return (
        <div className={styles.tableContainer}>
            <Table
                className={styles.customTable}
                columns={columns}
                dataSource={data}
                // bordered
                size="large"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: totalCount,
                    onChange: (p) => setPage(p),
                }}
                // tableLayout='auto'
                scroll={{
                    x: 800, // horizontal scroll
                    y: 400,  // vertical scroll
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '12px 24px', background: '#f9f9f9' }}>
                            <strong>Status Reason:</strong> {record.statusReason.toUpperCase()}
                        </div>
                    ),
                    rowExpandable: (record) =>
                        record.statusReason === 'new_user' || record.statusReason === 'deactivated_by_admin',
                }}
            // expandable={{
            //     expandedRowRender: record => <p style={{ margin: 0 }}>{record.statusReason}</p>,
            // }}
            />
        </div>
    );
}

export default UserList;