import styles from '../../styles/ArticleFeature.module.css';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, List, Modal, Button, Select, message, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import { showToast } from '../../../../components/layout/CustomToast';
import { getFormattedTime } from '../../../../utils/dateUtil';
import { get } from 'lodash';
import dayjs from 'dayjs';


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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
                    articles (
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
            showToast('Failed to fetch featured articles', 'error');
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
            setData(prev => {
                const activeIndex = prev.findIndex(i => i.key === active.id);
                const overIndex = prev.findIndex(i => i.key === over.id);
                return arrayMove(prev, activeIndex, overIndex);
            });

            // Update priorities in database
            try {
                const activeIndex = oldData.findIndex(i => i.key === active.id);
                const overIndex = oldData.findIndex(i => i.key === over.id);
                const newData = arrayMove(oldData, activeIndex, overIndex);

                // Update priorities for all items
                const updates = newData.map((item, index) => ({
                    article_id: item.article_id,
                    priority: index + 1,
                }));

                for (const update of updates) {
                    const { error } = await supabase
                        .from('featured_articles')
                        .update({ priority: update.priority })
                        .eq('article_id', update.article_id);

                    if (error) throw error;
                }

                // message.success('Article order updated successfully');
                showToast('Article order updated successfully', 'success');
            } catch (error) {
                // console.error('Error updating priorities:', error);
                showToast('Failed to update article order', 'error');
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
                .from('articles')
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
            await fetchFeaturedArticles();
        } catch (error) {
            console.error('Error adding featured article:', error);
            showToast('Failed to add article', 'error');
        }
    };

    const handleRemoveArticle = async (articleId) => {
        try {
            const { error } = await supabase
                .from('featured_articles')
                .delete()
                .eq('article_id', articleId);

            if (error) throw error;

            showToast('Article removed from featured list', 'success');
            await fetchFeaturedArticles();
        } catch (error) {
            // console.error('Error removing featured article:', error);
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
            await fetchFeaturedArticles();
        } catch (error) {
            console.error('Error updating article dates:', error);
            showToast('Failed to update article dates', 'error');
        }
    };

    const disabledDate = (current) => {
        // Disable dates before today
        return current && current < dayjs().startOf('day');
    };


    return (<div>
        <h2>Set Feature Articles</h2>
        <div style={{ fontSize: '20px' }}>
            (At most five (05) articles can be featured on the homepage.)
        </div>
        <hr />

        <div>
            <DndContext sensors={sensors} onDragEnd={onDragEnd} id="list-grid-drag-sorting">
                <SortableContext items={data.map(item => item.key)}>
                    <List
                        loading={loading}
                        grid={{ gutter: 16, column: 4 }}
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
                                    <Card
                                        // title={item.title}
                                        extra={
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showEditModal(item);
                                                    }}
                                                />
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveArticle(item.article_id);
                                                    }}
                                                />
                                            </div>
                                        }
                                    >
                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.title}</div>
                                        <br />
                                        <div style={{ fontSize: '15px' }}>
                                            <div><strong>Author:</strong> {item.author}</div>
                                            <div><strong>Priority:</strong> {item.priority}</div>
                                            <div><strong>Featured From:</strong> {item.start_date || 'N/A'}</div>
                                            <div><strong>Featured Until:</strong> {item.end_date || 'N/A'}</div>
                                        </div>

                                    </Card>
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
            okText="Add Article"
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
            okText="Update Dates"
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

        <Modal
            title="Edit Featured Article Dates"
            open={isEditModalOpen}
            onOk={handleUpdateDates}
            onCancel={handleEditModalCancel}
            okText="Update Dates"
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

    </div>);
}

export default ArticleFeature;