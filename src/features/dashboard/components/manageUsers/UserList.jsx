import { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Avatar, Input, Space, Table } from 'antd';
import styles from '../../styles/UserList.module.css'
import { supabase } from '../../../../config/supabaseClient';
import Badge from 'react-bootstrap/Badge';
import ActivateBtn from './ActivateBtn';
import { Grid } from 'antd';
import RoleChangeBtn from './RoleChangeBtn';
import { getFormattedTime } from '../../../../utils/dateUtil';
import RefreshBtn from '../RefreshBtn';

const { useBreakpoint } = Grid;

const PAGE_SIZE = 3;
const UserList = ({ filter, refreshTrigger }) => {
    // console.log('UserList filter prop:', filter);

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
    const fetchUsers = async (pageNumber = 1, field = null, value = '', filter) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // base query
            let query = supabase
                .from('users_meta')
                .select('uid, created_at, email, role, name, is_active, avatar_url, status_reason', { count: 'exact' })
                .order('created_at', { ascending: false }); // newest first

            // optional search
            if (field && value) {
                query = query.ilike(field, `%${value}%`);
            }

            // search by filter
            if (filter === "new_deactive") {
                query = query.eq('status_reason', 'new_user');
            } else if (filter === "deactivated_by_admin") {
                query = query.eq('status_reason', 'deactivated_by_admin');
            } else if (filter === "active") {
                query = query.eq('is_active', true);
            } else if (filter === "editor") {
                query = query.eq('role', 'editor');
            } else if (filter === "admin") {
                query = query.eq('role', 'admin');
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
                    createdAt: user.created_at,
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

    // When filter changes, always reset page to 1
    useEffect(() => {
        setPage(1);
    }, [filter, refreshTrigger]);

    // fetch data when page/search/filter changes
    useEffect(() => {
        fetchUsers(page, searchField, searchValue, filter);
    }, [page, searchField, searchValue, filter]);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        // console.log('Searching:', selectedKeys, dataIndex); //['ash'], name

        setSearchField(dataIndex);
        setSearchValue(selectedKeys[0]);
        setPage(1); // reset to first page on new search
    };

    const handleReset = (clearFilters, confirm) => {
        // console.log("data before reset:", data);

        clearFilters();
        setSearchField(null);
        setSearchValue('');
        confirm({ closeDropdown: true }); // closes dropdown & resets AntD filter UI
        setPage(1); // reset to first page on reset
        // console.log(data);

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
    const handleRoleChange = (userId, newRole) => {
        setData(prevData =>
            prevData.map(user =>
                user.uid === userId
                    ? {
                        ...user,
                        role: newRole,
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
            width: isMobile ? 45 : 90,
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
            width: isMobile ? 60 : 150,
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
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: isMobile ? 50 : 100,
            render: (createdAt) => {
                return (
                    <div style={{ fontSize: '15px' }}>
                        {getFormattedTime(createdAt)}
                    </div>
                );
            },
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
                    <Badge bg={role === 'admin' ? 'success' : role === 'editor' ? 'info' : 'secondary'}>
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
            width: isMobile ? 45 : 150,
            render: (record) => (
                <div className={styles.actionColumn}>
                    <ActivateBtn userId={record.uid}
                        userStatus={record.activeStatus}
                        onStatusChange={handleStatusChange} />
                    &nbsp;&nbsp;
                    <RoleChangeBtn userId={record.uid}
                        userRole={record.role}
                        onRoleChange={handleRoleChange} />

                </div>
            ),
            // onHeaderCell: () => ({ style: { textAlign: isMobile ? 'center' : 'left' } }),

        },
    ];



    return (
        <div className={styles.tableContainer}>
            <div className={styles.userCountSectionContainer}>
                {totalCount > 0 && (

                    <div className={styles.userCountSection}>
                        {totalCount} {totalCount === 1 ? 'User' : 'Users'}
                    </div>
                )}
                
            </div>
            <Table
                className={styles.customTable}
                columns={columns}
                dataSource={data}
                bordered
                size="large"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: totalCount,
                    onChange: (p) => setPage(p),
                }}
                tableLayout='fixed'
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
            />
        </div>
    );
}

export default UserList;