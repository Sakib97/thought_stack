import { Space, Table, Tag } from 'antd';
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
import styles from '../../styles/CommentsList.module.css'
import { supabase } from '../../../../config/supabaseClient';
import { useState, useEffect } from 'react';
import { getFormattedTime } from '../../../../utils/dateUtil';
import { Link } from 'react-router-dom';
import { encodeId } from '../../../../utils/hashUtil';


const PAGE_SIZE = 3;
const CommentsList = () => {
    const screens = useBreakpoint(); // gives: { xs, sm, md, lg, xl, xxl }
    const isMobile = !screens.md; // true for <768px
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);


    // Fetch from Supabase view
    const fetchReports = async (pageNumber = 1) => {
        try {
            const from = (pageNumber - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            setLoading(true);
            const { data, error, count } = await supabase
                .from('comment_reports_summary') // your SQL view name
                .select('*', { count: 'exact' })
                .order('report_count', { ascending: false })
                .range(from, to);

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
        fetchReports(page);
    }, [page]);

    const columns = [
        {
            title: 'Comment ID',
            dataIndex: 'comment_id',
            key: 'comment_id',
            fixed: 'left',
            width: isMobile ? 45 : 90,

        },
        {
            title: 'Parent ID',
            dataIndex: 'parent_id',
            key: 'parent_id',
            width: isMobile ? 45 : 90,
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
            width: isMobile ? 90 : 150,

        },
        {
            title: 'Comment Text',
            dataIndex: 'comment_text',
            key: 'comment_text',
            width: isMobile ? 100 : 190,

        },
        {
            title: 'Report Count',
            dataIndex: 'report_count',
            key: 'report_count',
            align: 'center',
            width: isMobile ? 40 : 85,
            render: (report_count) =>
                <Tag color={report_count > 3 ? 'red' : 'gold'}>
                    <span style={{ fontSize: '20px', color: 'black' }}>
                        {report_count}
                    </span>
                </Tag>

        },
        {
            title: 'Last Report',
            dataIndex: 'last_report_date',
            key: 'last_report_date',
            width: isMobile ? 40 : 85,

        },
        {
            title: 'Reporting Reasons',
            dataIndex: 'reporting_reasons',
            key: 'reporting_reasons',
            width: isMobile ? 45 : 95,


        },
        {
            title: 'Visibility',
            dataIndex: 'visibility',
            key: 'visibility',
            align: 'center',
            width: isMobile ? 45 : 90,
            render: (visibility) => (
                <Tag style={{fontSize:'17px', }} color={visibility === 'Hidden' ? 'red' : 'green'}>{visibility}</Tag>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: isMobile ? 45 : 90,
            render: (record) => (
                <div className={styles.actionColumn}>
                    <i className="fi fi-sr-eye-crossed"></i>
                    <i className="fi fi-br-thumbs-up-trust"></i>
                </div>
            ),

        },
    ];
    return (
        <div>
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