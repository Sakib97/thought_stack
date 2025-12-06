import styles from '../../styles/ArticleList.module.css';
import { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import { supabase } from '../../../../config/supabaseClient';
import { ADMIN_SECTION_PAGE_SIZE } from '../../../../config/appConfig';
import Badge from 'react-bootstrap/Badge';
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
import { Link } from 'react-router-dom';
import { encodeId } from '../../../../utils/hashUtil';
import { showToast } from '../../../../components/layout/CustomToast';
import { useAuth } from '../../../../context/AuthProvider';
import ArticleVisibilityBtn from './ArticleVisibilityBtn';
import ArticleEditBtn from './ArticleEditBtn';



const ArticleList = ({ filter, refreshTrigger }) => {
    const { userMeta } = useAuth();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // The database column being searched (e.g. "name" or "email")
    const [searchField, setSearchField] = useState(null);
    //The text searching for in that column (e.g. "john")
    const [searchValue, setSearchValue] = useState('');
    const searchInput = useRef(null);

    // Fetch Articles
    const fetchArticles = async (pageNumber = 1, filterValue = filter, field = null, value = '') => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ADMIN_SECTION_PAGE_SIZE;
            const to = from + ADMIN_SECTION_PAGE_SIZE - 1;

            let query = supabase
                .from('articles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            // Role-based filtering
            if (userMeta?.role === 'editor') {
                query = query.eq('editor_email', userMeta?.email);
            }

            // optional search
            if (field && value) {
                query = query.ilike(field, `%${value}%`);
            }

            // Filter by article status
            if (filterValue === 'pending_articles') {
                query = query.eq('article_status', 'pending');
            } else if (filterValue === 'active_articles') {
                query = query.eq('article_status', 'accepted');
            } else if (filterValue === 'restricted_articles') {
                query = query.eq('article_status', 'restricted');
            }

            query = query.range(from, to);

            const { data: fetchedData, count, error } = await query;

            if (error) {
                console.error('Error fetching articles:', error.message);
                showToast('Error fetching articles', 'error');
            } else {
                setData(
                    (fetchedData || []).map((article, idx) => ({
                        key: idx + from + 1,
                        article_id: article.id,
                        article_title: article.title_en,
                        article_slug: article.article_slug,
                        author_name: article.author_name,
                        author_email: article.author_email,
                        editor_name: article.editor_name,
                        editor_email: article.editor_email,
                        article_status: article.article_status,
                    }))
                );
                setTotalCount(count || 0);
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    // When filter changes, always reset page to 1
    useEffect(() => {
        setPage(1);
    }, [filter, refreshTrigger]);

    // Fetch articles when page, filter, userMeta, searchField, or searchValue changes
    useEffect(() => {
        if (userMeta) fetchArticles(page, filter, searchField, searchValue);
    }, [page, filter, userMeta, searchField, searchValue, refreshTrigger]);

    // --- AntD Column Search Helpers ---
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
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
    };

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${placeholder}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
    });

    const handleStatusChange = (articleId, newStatus) => {
        setData(prevData =>
            prevData.map(article =>
                article.article_id === articleId
                    ? {
                        ...article,
                        article_status: newStatus,
                    }
                    : article
            )
        );
    };

    // --- Columns ---
    const columns = [
        {
            title: 'Article Title',
            dataIndex: 'article_title',
            key: 'article_title',
            fixed: 'left',
            ...getColumnSearchProps('title_en', 'Article Title'),
            render: (_, record) => (
                <div className={styles.articleTitle}>
                    <Link
                        to={`/article/${encodeId(record.article_id)}/${record.article_slug}`}
                        className={styles.articleTitle}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span style={{ fontSize: '17px', fontWeight: 'bold' }}>
                            {record.article_title}
                        </span>
                    </Link>
                </div>
            ),
        },
        {
            title: 'Author Name',
            dataIndex: 'author_name',
            key: 'author_name',
            align: 'center',
            ...getColumnSearchProps('author_name', 'Author Name'),
        },
        {
            title: 'Author Email',
            dataIndex: 'author_email',
            key: 'author_email',
            ...getColumnSearchProps('author_email', 'Author Email'),
        },
        {
            title: 'Editor Email',
            dataIndex: 'editor_email',
            key: 'editor_email',
            ...getColumnSearchProps('editor_email', 'Editor Email'),
        },
        {
            title: 'Article Status',
            dataIndex: 'article_status',
            key: 'article_status',
            align: 'center',
            render: (status) => (
                <Badge bg={status === 'accepted' ? 'success' : 'danger'}>
                    {status.toUpperCase()}
                </Badge>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (record) => (
                <div className={styles.actionColumn}>
                    {userMeta?.role === "admin" && userMeta?.is_active &&
                        < ArticleVisibilityBtn
                            articleId={record.article_id}
                            articleStatus={record.article_status}
                            onStatusChange={handleStatusChange} />
                    }

                    <ArticleEditBtn
                        articleId={record.article_id}
                    />
                </div>
            ),
        },
    ];

    return (
        <div>
            {totalCount > 0 && (
                <div className={styles.articleCountSectionContainer}>
                    <div className={styles.articleCountSection}>
                        {totalCount} {totalCount === 1 ? 'Article' : 'Articles'}
                    </div>
                </div>

            )}
            <Table
                className={styles.customTable}
                dataSource={data}
                columns={columns}
                bordered
                size="large"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: ADMIN_SECTION_PAGE_SIZE,
                    total: totalCount,
                    onChange: (p) => setPage(p),
                }}
                scroll={{
                    x: 800,
                    y: 400,
                }}
            />
        </div>
    );
};

export default ArticleList;
