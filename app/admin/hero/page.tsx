"use client";
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Edit, Layout, Image as ImageIcon } from 'lucide-react';
import PageLayout from '../../../src/components/layout/PageLayout';
import { HeroSlide } from '../../../src/types/hero';
import { getHeroSlides, saveHeroSlide, deleteHeroSlide, updateSlideOrder } from '../../../src/services/hero.service';
import { Tool, NewsArticle } from '../../../src/types';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';
import { convertFirestoreDoc } from '../../../src/services/tools.service';

const HeroSliderPage = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide>>({});
    const [tools, setTools] = useState<Tool[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);

    useEffect(() => {
        fetchSlides();
        fetchToolsAndNews();
    }, []);

    const fetchSlides = async () => {
        try {
            const data = await getHeroSlides();
            setSlides(data);
        } catch (error) {
            console.error('Error fetching slides:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchToolsAndNews = async () => {
        // Fetch some initial data for selection (can be optimized with search later)
        const toolsSnapshot = await getDocs(query(collection(db, 'tools'), limit(50)));
        const newsSnapshot = await getDocs(query(collection(db, 'news'), limit(50)));

        setTools(toolsSnapshot.docs.map(convertFirestoreDoc));
        setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle)));
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(slides);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSlides(items);

        // Update order in background
        try {
            await updateSlideOrder(items);
        } catch (error) {
            console.error('Failed to update order:', error);
            // Revert on error if needed
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newSlide = {
                ...currentSlide,
                order: currentSlide.order ?? slides.length,
                isActive: currentSlide.isActive ?? true,
                type: currentSlide.type || 'external' // Default
            };

            await saveHeroSlide(newSlide as HeroSlide);
            setIsEditing(false);
            setCurrentSlide({});
            fetchSlides();
        } catch (error) {
            console.error('Error saving slide:', error);
            alert('Failed to save slide');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;
        try {
            await deleteHeroSlide(id);
            fetchSlides();
        } catch (error) {
            console.error('Error deleting slide:', error);
        }
    };

    const openEditModal = (slide?: HeroSlide) => {
        setCurrentSlide(slide || { type: 'external', isActive: true });
        setIsEditing(true);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <PageLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Layout className="w-8 h-8 text-indigo-600" />
                                إدارة سلايدر الصفحة الرئيسية
                            </h1>
                            <p className="text-gray-500 mt-1">تحكم في المحتوى الترويجي الذي يظهر في أعلى الصفحة الرئيسية</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete ALL slides? This cannot be undone.')) {
                                        try {
                                            const snapshot = await getDocs(collection(db, 'hero_slides'));
                                            await Promise.all(snapshot.docs.map(doc => deleteHeroSlide(doc.id)));
                                            fetchSlides();
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to delete all');
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                            >
                                <Trash2 className="w-5 h-5" />
                                حذف الكل
                            </button>
                            <button
                                onClick={() => openEditModal()}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Plus className="w-5 h-5" />
                                شريحة جديدة
                            </button>
                        </div>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="slides">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-4"
                                >
                                    {slides.map((slide, index) => (
                                        <Draggable key={slide.id} draggableId={slide.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4 group"
                                                >
                                                    <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                                                        <GripVertical className="w-6 h-6" />
                                                    </div>

                                                    <div className="w-20 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                        {slide.customImageUrl ? (
                                                            <img src={slide.customImageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <ImageIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium 
                                                                ${slide.type === 'tool' ? 'bg-blue-100 text-blue-700' :
                                                                    slide.type === 'news' ? 'bg-green-100 text-green-700' :
                                                                        'bg-purple-100 text-purple-700'}`}>
                                                                {slide.type === 'tool' ? 'أداة' : slide.type === 'news' ? 'خبر' : 'رابط خارجي'}
                                                            </span>
                                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                                                {slide.customTitle || (slide.type === 'tool' ? tools.find(t => t.id === slide.itemId)?.name : news.find(n => n.id === slide.itemId)?.title) || 'بدون عنوان'}
                                                            </h3>
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-md">
                                                            {slide.customDescription || '...'}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(slide)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(slide.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">
                                {currentSlide.id ? 'تعديل الشريحة' : 'شريحة جديدة'}
                            </h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع</label>
                                    <select
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={currentSlide.type}
                                        onChange={e => setCurrentSlide({ ...currentSlide, type: e.target.value as any, itemId: '' })}
                                    >
                                        <option value="external">مخصص / خارجي</option>
                                        <option value="tool">أداة</option>
                                        <option value="news">خبر</option>
                                    </select>
                                </div>

                                {currentSlide.type === 'tool' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختر الأداة</label>
                                        <select
                                            className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={currentSlide.itemId || ''}
                                            onChange={e => setCurrentSlide({ ...currentSlide, itemId: e.target.value })}
                                            required
                                        >
                                            <option value="">اختر...</option>
                                            {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {currentSlide.type === 'news' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختر الخبر</label>
                                        <select
                                            className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={currentSlide.itemId || ''}
                                            onChange={e => setCurrentSlide({ ...currentSlide, itemId: e.target.value })}
                                            required
                                        >
                                            <option value="">اختر...</option>
                                            {news.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        نص الشارة العلوية <span className="text-gray-400 text-xs">(اختياري - يظهر فوق العنوان)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={currentSlide.customBadge || ''}
                                        onChange={e => setCurrentSlide({ ...currentSlide, customBadge: e.target.value })}
                                        placeholder="مثال: أداة مميزة، خبر عاجل..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            مقدمة العنوان <span className="text-gray-400 text-xs">(يظهر قبل النص الملون)</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={currentSlide.titlePrefix || ''}
                                            onChange={e => setCurrentSlide({ ...currentSlide, titlePrefix: e.target.value })}
                                            placeholder="مثال: ابنِ موقعك مع..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            العنوان المميز <span className="text-gray-400 text-xs">(النص الملون الكبير)</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={currentSlide.customTitle || ''}
                                            onChange={e => setCurrentSlide({ ...currentSlide, customTitle: e.target.value })}
                                            placeholder="اسم الأداة أو العنوان الرئيسي"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        الوصف المخصص <span className="text-gray-400 text-xs">(اختياري)</span>
                                    </label>
                                    <textarea
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        rows={3}
                                        value={currentSlide.customDescription || ''}
                                        onChange={e => setCurrentSlide({ ...currentSlide, customDescription: e.target.value })}
                                        placeholder="وصف قصير يظهر تحت العنوان"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        المميزات <span className="text-gray-400 text-xs">(افصل بينها بفاصلة)</span>
                                    </label>
                                    <textarea
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        rows={2}
                                        value={currentSlide.features?.join('، ') || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const features = val.split(/[،,]/).map(s => s.trim()).filter(Boolean);
                                            setCurrentSlide({ ...currentSlide, features });
                                        }}
                                        placeholder="مثال: سرعة عالية، خصوصية كاملة، دعم فوري"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        رابط الصورة <span className="text-gray-400 text-xs">(اختياري)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={currentSlide.customImageUrl || ''}
                                        onChange={e => setCurrentSlide({ ...currentSlide, customImageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        الرابط <span className="text-gray-400 text-xs">{currentSlide.type === 'external' ? '(مطلوب)' : '(اختياري - يتخطى الرابط التلقائي)'}</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={currentSlide.customLink || ''}
                                        onChange={e => setCurrentSlide({ ...currentSlide, customLink: e.target.value })}
                                        placeholder={currentSlide.type === 'external' ? 'https://...' : 'اتركه فارغاً لاستخدام الرابط التلقائي'}
                                        required={currentSlide.type === 'external'}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        حفظ التغييرات
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default HeroSliderPage;
