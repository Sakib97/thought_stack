import { Table, Tag, Input, Space, Button, } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
import styles from '../../styles/CommentsList.module.css'
import { supabase } from '../../../../config/supabaseClient';
import { useState, useEffect, useRef } from 'react';
import { getFormattedTime } from '../../../../utils/dateUtil';
import { Link } from 'react-router-dom';
import { encodeId } from '../../../../utils/hashUtil';
import Badge from 'react-bootstrap/Badge';
import HideCommentBtn from './HideCommentBtn';
import ReviewCommentBtn from './ReviewCommentBtn';


const PAGE_SIZE = 3;
const CommentsList = ({ filter, refreshTrigger }) => {
    const screens = useBreakpoint(); // gives: { xs, sm, md, lg, xl, xxl }
    const isMobile = !screens.md; // true for <768px
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);

    // The database column being searched (e.g. "name" or "email")
    const [searchField, setSearchField] = useState(null);
    //The text searching for in that column (e.g. "john")
    const [searchValue, setSearchValue] = useState('');
    const searchInput = useRef(null);


    // Fetch from Supabase view
    const fetchReports = async (pageNumber = 1, filterValue = filter, field = null, value = '',) => {
        try {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            setLoading(true);
            let query = supabase
                .from('comment_reports_summary')
                .select('*', { count: 'exact' })
                .order('report_count', { ascending: false })
                .range(from, to);

            // optional search
            if (field && value) {
                if (field === 'comment_id') {
                    query = query.eq('comment_id', parseInt(value));

                } else {
                    query = query.ilike(field, `%${value}%`);
                }
            }

            // Apply filter conditions
            if (filterValue === 'pending_reports') {
                query = query.eq('review_status', 'pending');
                setPage(1); // reset to first page on new search
            } else if (filterValue === 'reviewed_reports') {
                query = query.eq('review_status', 'reviewed');
                setPage(1); // reset to first page on new search
            } else if (filterValue === 'hidden_comments') {
                query = query.eq('is_hidden', true);
                setPage(1); // reset to first page on new search
            }
            // 'all_reports' => no filter (default)

            const { data, error, count } = await query;
            if (error) throw error;

            // Optional: format reporting_reasons array into readable text
            const formattedData = data.map((item, index) => ({
                key: index,
                comment_id: item.comment_id,
                parent_id: item.parent_id,
                article_id: item.article_id,
                article_title: item.article_title,
                article_slug: item.article_slug,
                comment_text: item.comment_text,
                commenter_email: item.commenter_email,
                report_count: item.report_count,
                last_report_date: getFormattedTime(item.latest_report_date) || 'N/A',
                // reporting_reasons: item.reporting_reasons?.join(', ') || '—',
                reporting_reasons: item.reporting_reasons || '—',
                visibility: item.is_hidden ? 'Hidden' : 'Visible',
                review_status: item.review_status,
            }));

            setDataSource(formattedData);
            setTotalCount(count || 0); // ensures pagination knows total records


        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(page, filter, searchField, searchValue);
    }, [page, filter, searchField, searchValue]);

    useEffect(() => {
        setPage(1);
        fetchReports(page, filter, searchField, searchValue);
    }, [refreshTrigger]);

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

    // Generic search filter for any column
    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    // placeholder={`Search ${dataIndex}`}
                    placeholder={`🔎 ${placeholder}`}
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

    // Update the specific row in data state when visibility changes
    const handleVisibleChange = (commentId, newVisibility) => {
        setDataSource(prevData =>
            prevData.map(comment =>
                comment.comment_id === commentId
                    ? {
                        ...comment,
                        visibility: newVisibility,
                    }
                    : comment
            )
        );
    };

    const handleReviewStatusChange = (commentId, newStatus) => {
        setDataSource(prevData =>
            prevData.map(comment =>
                comment.comment_id === commentId
                    ? { ...comment, review_status: newStatus }
                    : comment
            )
        );
    };

    const columns = [
        {
            title: 'Cmnt. ID',
            dataIndex: 'comment_id',
            key: 'comment_id',
            fixed: 'left',
            width: isMobile ? 100 : 110,
            ...getColumnSearchProps('comment_id', 'Comment with ID'),

        },
        {
            title: 'Parent ID',
            dataIndex: 'parent_id',
            key: 'parent_id',
            width: isMobile ? 100 : 100,
            render: (parent_id) => {
                return <>
                    {parent_id ? <>
                        Reply comment, Parent comment ID: {parent_id}
                    </> :
                        <>
                            Main comment, no parent
                        </>
                    }
                </>
            }
        },
        {
            title: 'Article Title',
            dataIndex: 'article_title',
            key: 'article_title',
            width: isMobile ? 100 : 150,
            ...getColumnSearchProps('article_title' , 'Article Title'),
            render: (_, record) => (
                <div className={styles.articleTitle}>
                    <Link to={`/article/${encodeId(record.article_id)}/${record.article_slug}`}
                        className={styles.articleTitle}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span style={{ fontSize: '17px', fontWeight: 'bold' }} >
                            {record.article_title}
                        </span>
                    </Link>
                </div>
            ),

        },
        {
            title: 'Comment Text',
            dataIndex: 'comment_text',
            key: 'comment_text',
            width: isMobile ? 210 : 390,
        },
        {
            title: 'Commenter Email',
            dataIndex: 'commenter_email',
            key: 'commenter_email',
            width: isMobile ? 130 : 150,
            ...getColumnSearchProps('commenter_email' , 'Commenter Email'), // commenter_email
        },
        {
            title: 'Report Count',
            dataIndex: 'report_count',
            key: 'report_count', //
            align: 'center',
            width: isMobile ? 85 : 85,
            render: (report_count) =>
                <Tag color={report_count > 4 ? 'rgb(255, 40, 2)' : 'rgb(213, 144, 7) '}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        {report_count}
                    </span>
                </Tag>

        },
        {
            title: 'Last Report',
            dataIndex: 'last_report_date',
            key: 'last_report_date',
            width: isMobile ?85 : 85,

        },
        {
            title: 'Reporting Reasons',
            dataIndex: 'reporting_reasons',
            key: 'reporting_reasons',
            width: isMobile ? 100 : 75,
        },
        {
            title: 'Visibility',
            dataIndex: 'visibility',
            key: 'visibility',
            align: 'center',
            width: isMobile ? 100 : 110,
            render: (visibility) => (
                <Badge style={{ fontSize: '12px' }} bg={visibility === 'Hidden' ?
                    'danger' : 'success'}>
                    {isMobile ? <>
                        {visibility === 'Hidden' ?
                            <i style={{ fontSize: '13px' }} className="fi fi-br-cross"></i> :
                            <i style={{ fontSize: '13px' }} className="fi fi-br-check"></i>}
                    </> :
                        <>{visibility.toUpperCase()}</>}
                </Badge>
            ),
        },
        {
            title: 'Review Status',
            dataIndex: 'review_status',
            key: 'review_status',
            align: 'center',
            width: isMobile ? 100 : 110,
            render: (review_status) => (
                <Badge style={{ fontSize: '12px' }} bg={review_status === 'pending' ?
                    'danger' : 'success'}>
                    {isMobile ? <>
                        {review_status === 'pending' ?
                            <i style={{ fontSize: '13px' }} className="fi fi-br-cross"></i> :
                            <i style={{ fontSize: '13px' }} className="fi fi-br-check"></i>}
                    </> :
                        <>{review_status.toUpperCase()}</>}
                </Badge>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            // fixed: 'right',
            width: isMobile ? 100 : 110,
            render: (_, record) => (
                <div className={styles.actionColumn}>
                    {/* {console.log(record)} */}

                    <HideCommentBtn
                        commentId={record.comment_id}
                        parentId={record.parent_id}
                        isHidden={record.visibility === 'Hidden'}
                        onVisibilityActionComplete={handleVisibleChange}
                    />
                    <ReviewCommentBtn
                        commentId={record.comment_id}
                        reviewStatus={record.review_status}
                        onReviewComplete={handleReviewStatusChange}
                    />
                </div>
            ),

        },
    ];
    return (
        <div>
            {totalCount > 0 && (
                <div className={styles.commentCountSectionContainer}>
                    <div className={styles.commentCountSection}>
                        {totalCount} {totalCount === 1 ? 'Comment' : 'Comments'}
                    </div>
                </div>

            )}
            <Table
                className={styles.customTable}
                dataSource={dataSource}
                columns={columns}
                bordered
                size="large"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: totalCount,
                    onChange: (p) => setPage(p),
                }}
                scroll={{
                    x: 800, // horizontal scroll
                    y: 400,  // vertical scroll
                }}
            />;
        </div>
    );
}

export default CommentsList;