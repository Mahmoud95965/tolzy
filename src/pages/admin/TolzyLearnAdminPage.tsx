import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Course, Lesson } from '../../types/learn';
import {
    LayoutDashboard, BookOpen, BarChart2, Settings, Search, Bell,
    Plus, Filter, Grid, List, Edit2, Trash2,
    ExternalLink, RefreshCw, X, UploadCloud,
    Users, Globe, Star
} from 'lucide-react';
import { tolzyAI } from '../../services/tolzy-ai.service';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        active: 'bg-green-100 text-green-700 border-green-200',
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        syncing: 'bg-blue-100 text-blue-700 border-blue-200',
        error: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.draft}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const TolzyLearnAdminPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Form State
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedCourses: Course[] = [];
            querySnapshot.forEach((doc) => {
                fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
            });
            setCourses(fetchedCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (course: Course) => {
        setCurrentCourse(course);
        setLessons(course.lessons || []);
        setIsDrawerOpen(true);
    };

    const handleCreateClick = () => {
        setCurrentCourse({
            title: '',
            description: '',
            category: '',
            level: 'beginner',
            price: 'free',
            language: 'English',
            isPublished: true
        });
        setLessons([]);
        setIsDrawerOpen(true);
    };

    // Fetching state
    const [isFetching, setIsFetching] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFetchCourse = async () => {
        if (!currentCourse.sourceUrl) {
            alert('Please enter a URL first');
            return;
        }

        setIsFetching(true);
        try {
            // 1. Try to fetch metadata from backend
            // Use relative path for Vercel deployment
            const apiUrl = import.meta.env.PROD ? '/api/fetch-course' : 'http://localhost:5000/api/fetch-course';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentCourse.sourceUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to fetch course data');
            }

            const data = await response.json();

            // 2. AI Analysis - Temporarily Disabled
            // setIsAnalyzing(true);
            // const analysis = await tolzyAI.analyzeCourseContent(data.title || '', data.description || '');

            setCurrentCourse(prev => ({
                ...prev,
                title: data.title || prev.title,
                description: data.description || prev.description,
                thumbnail: data.thumbnail || prev.thumbnail,
                platform: new URL(currentCourse.sourceUrl!).hostname.replace('www.', ''),
                language: 'English', // Default
                hasCertificate: false, // Default
                price: 'free', // Default
                // Use fetched rating/reviews if available, otherwise keep previous or default
                rating: data.rating || prev.rating || 0,
                reviewsCount: data.reviewsCount || prev.reviewsCount || 0,
                // Default values if missing
                level: prev.level || 'beginner',
                category: prev.category || 'General'
            }));

        } catch (error: any) {
            console.error('Error fetching course:', error);
            alert(error.message || 'Failed to fetch course data. Please fill details manually.');
        } finally {
            setIsFetching(false);
            // setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!currentCourse.title) return;
        setIsSaving(true);
        try {
            const courseData = {
                ...currentCourse,
                lessons,
                updatedAt: new Date().toISOString(),
                instructor: currentCourse.instructor || user?.displayName || 'Admin',
            };

            if (currentCourse.id) {
                await updateDoc(doc(db, 'courses', currentCourse.id), courseData);
            } else {
                await addDoc(collection(db, 'courses'), {
                    ...courseData,
                    createdAt: new Date().toISOString(),
                    studentsCount: 0,
                    rating: 0
                });
            }
            setIsDrawerOpen(false);
            fetchCourses();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save course');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this course?')) {
            try {
                await deleteDoc(doc(db, 'courses', id));
                fetchCourses();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    // Filtered Courses
    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        Tolzy Learn
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" />
                    <SidebarItem icon={BookOpen} label="الدورات" active />
                    <SidebarItem icon={BarChart2} label="التحليلات" />
                    <SidebarItem icon={Settings} label="الإعدادات" />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user?.displayName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'مستخدم مسؤول'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الدورات</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث عن دورات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10 pl-4 py-2 rounded-lg border border-gray-200 text-sm w-64 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            إضافة دورة جديدة
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    {/* Filters & Controls */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                                <Filter className="w-4 h-4" />
                                تصفية
                            </button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <span className="text-sm text-gray-500">{filteredCourses.length} دورة موجودة</span>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Data View */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4 w-12">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        </th>
                                        <th className="px-6 py-4">الدورة</th>
                                        <th className="px-6 py-4">المزود</th>
                                        <th className="px-6 py-4">الحالة</th>
                                        <th className="px-6 py-4">الإحصائيات</th>
                                        <th className="px-6 py-4">آخر تحديث</th>
                                        <th className="px-6 py-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                                                        <p className="text-xs text-gray-500">{course.category || 'غير مصنف'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {course.sourceUrl ? <Globe className="w-4 h-4 text-gray-400" /> : <BookOpen className="w-4 h-4 text-indigo-400" />}
                                                    <span className="text-gray-600">{course.platform || 'تولزي'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={course.isPublished ? 'active' : 'draft'} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4 text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{course.studentsCount || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span>{course.rating || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(course.updatedAt || Date.now()).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditClick(course)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(course.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                        {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => handleEditClick(course)} className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <StatusBadge status={course.isPublished ? 'active' : 'draft'} />
                                            <span className="text-xs text-gray-500">{course.platform}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 flex-1">{course.title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.studentsCount || 0}</span>
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-current" /> {course.rating || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-start">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {currentCourse.id ? 'تعديل الدورة' : 'دورة جديدة'}
                            </h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Import Section */}
                            <section className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    استيراد من رابط
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentCourse.sourceUrl || ''}
                                        onChange={e => setCurrentCourse({ ...currentCourse, sourceUrl: e.target.value })}
                                        placeholder="الصق رابط الدورة (مثلاً Coursera, Udemy)..."
                                        className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                                    />
                                    <button
                                        onClick={handleFetchCourse}
                                        disabled={isFetching || isAnalyzing || !currentCourse.sourceUrl}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
                                    >
                                        {(isFetching || isAnalyzing) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                        جلب البيانات
                                    </button>
                                </div>
                                <p className="text-xs text-indigo-600/70 mt-2">
                                    يملأ العنوان والوصف والصورة تلقائيًا ويكتشف تفاصيل المنصة.
                                </p>
                            </section>

                            {/* Basic Info */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">المعلومات الأساسية</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                                        <input
                                            type="text"
                                            value={currentCourse.title || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                        <textarea
                                            rows={4}
                                            value={currentCourse.description || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                                            <input
                                                type="text"
                                                value={currentCourse.category || ''}
                                                onChange={e => setCurrentCourse({ ...currentCourse, category: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المنصة</label>
                                            <input
                                                type="text"
                                                value={currentCourse.platform || ''}
                                                onChange={e => setCurrentCourse({ ...currentCourse, platform: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Details */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">التفاصيل والبيانات الوصفية</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                                        <select
                                            value={currentCourse.price || 'free'}
                                            onChange={e => setCurrentCourse({ ...currentCourse, price: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="free">مجاني</option>
                                            <option value="paid">مدفوع</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اللغة</label>
                                        <input
                                            type="text"
                                            value={currentCourse.language || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, language: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المدة</label>
                                        <input
                                            type="text"
                                            value={currentCourse.duration || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, duration: e.target.value })}
                                            placeholder="مثلاً 10 ساعات"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">عدد التقييمات</label>
                                        <input
                                            type="number"
                                            value={currentCourse.reviewsCount || 0}
                                            onChange={e => setCurrentCourse({ ...currentCourse, reviewsCount: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Instructor */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">المدرب</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                                        <input
                                            type="text"
                                            value={currentCourse.instructor || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, instructor: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                                        <input
                                            type="text"
                                            value={currentCourse.instructorRole || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, instructorRole: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">نبذة</label>
                                        <textarea
                                            rows={3}
                                            value={currentCourse.instructorBio || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, instructorBio: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة الرمزية</label>
                                        <input
                                            type="text"
                                            value={currentCourse.instructorAvatar || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, instructorAvatar: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* What You'll Learn */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">ماذا ستتعلم</h3>
                                <div className="space-y-2">
                                    {(currentCourse.whatYouWillLearn || []).map((point, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={point}
                                                onChange={(e) => {
                                                    const newPoints = [...(currentCourse.whatYouWillLearn || [])];
                                                    newPoints[index] = e.target.value;
                                                    setCurrentCourse({ ...currentCourse, whatYouWillLearn: newPoints });
                                                }}
                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="مثلاً: احتراف React Hooks"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newPoints = (currentCourse.whatYouWillLearn || []).filter((_, i) => i !== index);
                                                    setCurrentCourse({ ...currentCourse, whatYouWillLearn: newPoints });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newPoints = [...(currentCourse.whatYouWillLearn || []), ''];
                                            setCurrentCourse({ ...currentCourse, whatYouWillLearn: newPoints });
                                        }}
                                        className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        إضافة نقطة
                                    </button>
                                </div>
                            </section>

                            {/* Media */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">الوسائط</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة المصغرة</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={currentCourse.thumbnail || ''}
                                            onChange={e => setCurrentCourse({ ...currentCourse, thumbnail: e.target.value })}
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                        <div className="w-24 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            {currentCourse.thumbnail && <img src={currentCourse.thumbnail} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TolzyLearnAdminPage;
