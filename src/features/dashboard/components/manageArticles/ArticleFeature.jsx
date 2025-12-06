import styles from '../../styles/ArticleFeature.module.css';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, List, Modal, Button, Select, message, DatePicker, Badge, Tag, Typography, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import { showToast } from '../../../../components/layout/CustomToast';
import { getFormattedTime } from '../../../../utils/dateUtil';
import { get } from 'lodash';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';


const SortableListItem = props => {
    const { itemKey, style, ...rest } = props;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: itemKey,
    });
    const listStyle = {
        ...style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };
    return <List.Item {...rest} ref={setNodeRef} style={listStyle} {...attributes} {...listeners} />;
};

const ArticleFeature = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableArticles, setAvailableArticles] = useState([]);
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
                distance: 1,
            },
        }),
    );

    // Fetch featured articles from database
    useEffect(() => {
        fetchFeaturedArticles();
    }, []);

    const fetchFeaturedArticles = async () => {
        setLoading(true);
        try {
            const { data: featuredData, error } = await supabase
                .from('featured_articles')
                .select(`
                    article_id,
                    priority,
                    start_at,
                    end_at,
                    articles_secure (
                        title_en,
                        author_name
                    )
                `)
                .order('priority', { ascending: true });

            if (error) throw error;

            const formattedData = featuredData.map((item, index) => ({
                key: item.article_id,
                article_id: item.article_id,
                title: item.articles?.title_en || 'Untitled',
                author: item.articles?.author_name || 'Unknown Author',
                priority: item.priority || index + 1,
                start_date: getFormattedTime(item.start_at),
                end_date: getFormattedTime(item.end_at),
            }));

            setData(formattedData);
        } catch (error) {
            console.error('Error fetching featured articles:', error);
            // message.error('Failed to fetch featured articles');
            showToast('Failed to fetch featured article(s) !', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async ({ active, over }) => {
        if (!active || !over) {
            return;
        }
        if (active.id !== over.id) {
            const oldData = [...data];
            const activeIndex = oldData.findIndex(i => i.key === active.id);
            const overIndex = oldData.findIndex(i => i.key === over.id);
            const newData = arrayMove(oldData, activeIndex, overIndex);

            // Update UI immediately with new priorities
            const updatedData = newData.map((item, index) => ({
                ...item,
                priority: index + 1,
            }));
            setData(updatedData);

            // Update priorities in database
            try {
                const updates = updatedData.map((item, index) => ({
                    article_id: item.article_id,
                    priority: index + 1,
                }));

                // show loading toast
                const loadingToastId = 'updating-order';
                showToast('Updating article order...', 'loading', loadingToastId);
                for (const update of updates) {
                    const { error } = await supabase
                        .from('featured_articles')
                        .update({ priority: update.priority })
                        .eq('article_id', update.article_id);

                    if (error) throw error;
                }
                toast.dismiss(loadingToastId);
                showToast('Article order updated successfully', 'success');
            } catch (error) {
                toast.dismiss(loadingToastId);
                showToast('Failed to update article order !', 'error');
                setData(oldData); // Revert on error
            }
        }
    };

    const showModal = async () => {
        setIsModalOpen(true);
        await fetchAvailableArticles();
    };

    const fetchAvailableArticles = async () => {
        try {
            // Get all articles that are not already featured
            const featuredIds = data.map(item => item.article_id);

            const { data: articles, error } = await supabase
                .from('articles_secure')
                .select('id, title_en, author_name')
                .not('id', 'in', `(${featuredIds.length > 0 ? featuredIds.join(',') : -1})`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAvailableArticles(articles || []);
        } catch (error) {
            console.error('Error fetching available articles:', error);
            // message.error('Failed to fetch available articles');
            showToast('Failed to fetch available articles', 'error');
        }
    };

    const handleAddArticle = async () => {
        if (!selectedArticleId) {
            showToast('Please select an article', 'warning');
            return;
        }

        setIsAdding(true);
        try {
            const selectedArticle = availableArticles.find(a => a.id === selectedArticleId);

            const { error } = await supabase
                .from('featured_articles')
                .insert({
                    article_id: selectedArticleId,
                    priority: data.length + 1,
                    start_at: new Date().toISOString(),
                    end_at: null,
                });

            if (error) throw error;

            showToast('Article added to featured list', 'success');
            setIsModalOpen(false);
            setSelectedArticleId(null);
            setIsAdding(false);
            await fetchFeaturedArticles();
        } catch (error) {
            console.error('Error adding featured article:', error);
            showToast('Failed to add article', 'error');
            setIsAdding(false);
        }
    };

    const showDeleteModal = (articleId) => {
        setIsDeleteModalOpen(true);
        setSelectedArticleId(articleId);
    };
    const handleDeleteModalCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedArticleId(null);
    };

    const handleRemoveArticle = async (articleId) => {
        setIsDeleting(true);
        try {
            // Get the priority of the article being deleted
            const articleToDelete = data.find(item => item.article_id === articleId);
            const deletedPriority = articleToDelete?.priority;

            // Delete the article
            const { error: deleteError } = await supabase
                .from('featured_articles')
                .delete()
                .eq('article_id', articleId);

            if (deleteError) throw deleteError;

            // Update priorities for remaining articles with priority greater than the deleted one
            if (deletedPriority) {
                const articlesWithHigherPriority = data.filter(
                    item => item.priority > deletedPriority
                );

                for (const article of articlesWithHigherPriority) {
                    const { error: updateError } = await supabase
                        .from('featured_articles')
                        .update({ priority: article.priority - 1 })
                        .eq('article_id', article.article_id);

                    if (updateError) throw updateError;
                }
            }

            setIsDeleteModalOpen(false);
            setSelectedArticleId(null);
            setIsDeleting(false);
            showToast('Article removed from featured list', 'success');
            await fetchFeaturedArticles();
        } catch (error) {
            setIsDeleteModalOpen(false);
            setSelectedArticleId(null);
            setIsDeleting(false);
            showToast('Failed to remove article', 'error');
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setSelectedArticleId(null);
    };

    const showEditModal = (article) => {
        setEditingArticle(article);
        setStartDate(article.start_date ? dayjs(article.start_date) : null);
        setEndDate(article.end_date ? dayjs(article.end_date) : null);
        setIsEditModalOpen(true);
    };

    const handleEditModalCancel = () => {
        setIsEditModalOpen(false);
        setEditingArticle(null);
        setStartDate(null);
        setEndDate(null);
    };

    const handleUpdateDates = async () => {
        if (!editingArticle) return;

        // Validation
        const now = dayjs();
        if (startDate && startDate.isBefore(now, 'day')) {
            showToast('Start date cannot be before today', 'error');
            return;
        }
        if (endDate && endDate.isBefore(now, 'day')) {
            showToast('End date cannot be before today', 'error');
            return;
        }
        if (startDate && endDate && endDate.isBefore(startDate, 'day')) {
            showToast('End date cannot be before start date', 'error');
            return;
        }

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('featured_articles')
                .update({
                    start_at: startDate ? startDate.toISOString() : null,
                    end_at: endDate ? endDate.toISOString() : null,
                })
                .eq('article_id', editingArticle.article_id);

            if (error) throw error;

            showToast('Article dates updated successfully', 'success');
            setIsEditModalOpen(false);
            setEditingArticle(null);
            setStartDate(null);
            setEndDate(null);
            setIsUpdating(false);
            await fetchFeaturedArticles();
        } catch (error) {
            console.error('Error updating article dates:', error);
            showToast('Failed to update article dates', 'error');
            setIsUpdating(false);
        }
    };

    const disabledDate = (current) => {
        // Disable dates before today
        return current && current < dayjs().startOf('day');
    };


    return (<div>
        <h2>Set Feature Articles</h2>
        <div style={{ fontSize: '20px' }}>
            (At most <b>five (05)</b>  articles can be featured on the homepage.)
        </div>
        <hr />

        <div>
            <DndContext sensors={sensors} onDragEnd={onDragEnd} id="list-grid-drag-sorting">
                <SortableContext items={data.map(item => item.key)}>
                    <List
                        loading={loading}
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 3,
                            xl: 4,
                            xxl: 4
                        }}
                        dataSource={[...data, ...(data.length < 5 ? [{ isAddButton: true }] : [])]}
                        renderItem={item => {
                            if (item.isAddButton) {
                                return (
                                    <List.Item>
                                        <Card
                                            className={styles.addCard}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: '200px',
                                                cursor: 'pointer',
                                                border: '2px dashed #d9d9d9'
                                            }}
                                            onClick={showModal}
                                        >
                                            <div style={{ textAlign: 'center' }}>
                                                <PlusOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                                <div style={{ marginTop: '16px', fontSize: '16px' }}>
                                                    Add Featured Article
                                                </div>
                                            </div>
                                        </Card>
                                    </List.Item>
                                );
                            }

                            return (
                                <SortableListItem key={item.key} itemKey={item.key}>
                                    <Badge.Ribbon text={`#${item.priority}`} color="geekblue">
                                        <Card
                                            className={styles.articleFeatureCard}
                                            hoverable
                                            styles={{ body: { padding: 16 } }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                                {/* <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    title="Edit dates"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showEditModal(item);
                                                    }}
                                                /> */}
                                                <Button
                                                    style={{fontSize:'20px'}}
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    title="Remove from featured"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showDeleteModal(item.article_id);
                                                    }}
                                                />

                                            </div>
                                            <hr />
                                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                <Typography.Title level={5} style={{ margin: 0, fontSize: '20px' }}>
                                                    {item.title}
                                                </Typography.Title>
                                                <hr />

                                                <Space align="center" style={{ justifyContent: 'space-between' }}>
                                                    <Space size={8}>
                                                        <Tag color="blue" style={{ fontSize: '16px' }}>Author</Tag>
                                                        <Typography.Text style={{ fontSize: '18px' }}>{item.author}</Typography.Text>
                                                    </Space>
                                                </Space>
                                                <hr />

                                                {/* <div
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: 10,
                                                        fontSize: 14
                                                    }}
                                                >
                                                    <div style={{borderRight: '2px solid black'}}>
                                                        <Typography.Text type="secondary">Featured From</Typography.Text>
                                                        <div>{item.start_date || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <Typography.Text type="secondary">Featured Until</Typography.Text>
                                                        <div>{item.end_date || 'N/A'}</div>
                                                    </div>
                                                </div> */}
                                            </Space>
                                        </Card>
                                    </Badge.Ribbon>
                                </SortableListItem>
                            );
                        }}
                    />
                </SortableContext>
            </DndContext>
        </div>

        <Modal
            title="Add Featured Article"
            open={isModalOpen}
            onOk={handleAddArticle}
            onCancel={handleModalCancel}
            okText={isAdding ? "Adding..." : "Add Article"}
            okButtonProps={{ loading: isAdding }}
            cancelButtonProps={{ disabled: isAdding }}
        >
            <div style={{ marginTop: '20px' }}>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Select an article"
                    value={selectedArticleId}
                    onChange={setSelectedArticleId}
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={availableArticles.map(article => ({
                        value: article.id,
                        label: `${article.title_en} - by ${article.author_name}`,
                    }))}
                />
            </div>
        </Modal>

        <Modal
            title="Edit Featured Article Dates"
            open={isEditModalOpen}
            onOk={handleUpdateDates}
            onCancel={handleEditModalCancel}
            okText={isUpdating ? "Updating..." : "Update Dates"}
            okButtonProps={{ loading: isUpdating }}
            cancelButtonProps={{ disabled: isUpdating }}
        >
            {editingArticle && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                        {editingArticle.title}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Start Date:
                        </label>
                        <DatePicker
                            style={{ width: '100%' }}
                            value={startDate}
                            onChange={setStartDate}
                            disabledDate={disabledDate}
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="Select start date"
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            End Date:
                        </label>
                        <DatePicker
                            style={{ width: '100%' }}
                            value={endDate}
                            onChange={setEndDate}
                            disabledDate={disabledDate}
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="Select end date (optional)"
                        />
                    </div>
                    <div style={{ color: '#666', fontSize: '13px' }}>
                        Note: Dates cannot be set before today. End date must be after start date.
                    </div>
                </div>
            )}
        </Modal>

        {/* delete confirmation modal */}
        <Modal
            title="Confirm Deletion"
            open={isDeleteModalOpen}
            onOk={() => handleRemoveArticle(selectedArticleId)}
            onCancel={handleDeleteModalCancel}
            okText={isDeleting ? "Deleting..." : "Delete"}
            okButtonProps={{ danger: true, loading: isDeleting }}
            cancelButtonProps={{ disabled: isDeleting }}
        >
            <div>
                Are you sure you want to remove this article from the featured list?
            </div>
        </Modal>



    </div>);
}

export default ArticleFeature;