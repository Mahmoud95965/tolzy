import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { Search } from 'lucide-react';
import { Course } from '../types/learn';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import SkillTreeSidebar from '../components/learn/SkillTreeSidebar';
import SmartCourseCard from '../components/learn/SmartCourseCard';
import CommandPalette from '../components/learn/CommandPalette';

const TolzyLearnPage: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesRef = collection(db, 'courses');
                const q = query(coursesRef, where('isPublished', '==', true));
                const querySnapshot = await getDocs(q);
                const fetchedCourses = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Course[];
                setCourses(fetchedCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        if (selectedCategory === 'all') return true;
        // Simple category matching for now, can be enhanced with the tree structure
        return course.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            selectedCategory.toLowerCase().includes(course.category.toLowerCase());
    });

    // Sort to put featured/popular courses first for the Bento Grid
    const sortedCourses = [...filteredCourses].sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0));

    const handleCourseClick = (courseId: string) => {
        navigate(`/tolzy-learn/course/${courseId}`);
    };

    return (
        <PageLayout>
            <SEO
                title="Tolzy Learn - منصة تعليمية شاملة للمطورين | كورسات برمجة وذكاء اصطناعي مجانية"
                description="ابدأ رحلة التعلم مع Tolzy Learn. مكتبة ضخمة من الكورسات المجانية والمدفوعة في البرمجة، الذكاء الاصطناعي، تصميم الويب، وعلم البيانات. مسارات تعليمية متكاملة من الصفر حتى الاحتراف. تعلم React, Node.js, Python, Machine Learning. شهادات معتمدة، مشاريع عملية، ومجتمع تعليمي نشط. طور مهاراتك التقنية اليوم!"
                keywords="Tolzy Learn, كورسات برمجة مجانية, تعلم البرمجة من الصفر, دورات ذكاء اصطناعي, تعلم Python, كورس React كامل, تعلم Node.js, تطوير الويب, Web Development, Data Science, Machine Learning, Deep Learning, تعلم الآلة, علم البيانات, كورسات تصميم, UI/UX Design, هندسة البرمجيات, Software Engineering, مسارات تعليمية, Roadmap, شهادات معتمدة, منح تعليمية, تدريب عملي, مشاريع تخرج, أفضل منصة تعليمية عربية, كورسات أونلاين, تعلم عن بعد, مهارات المستقبل, التحول الرقمي, الذكاء الاصطناعي التوليدي, Generative AI"
            />

            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-300 font-sans selection:bg-indigo-500/30 transition-colors duration-300" dir="rtl">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                {/* Navbar */}
                <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                <span className="text-indigo-600 dark:text-indigo-500">تولزي</span> للتعلم
                            </h1>
                        </div>

                        {/* Command Palette Trigger */}
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg transition-all group w-64"
                        >
                            <Search className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            <span className="text-sm text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">ابحث عن الدورات...</span>
                            <div className="mr-auto flex items-center gap-1">
                                <span className="text-[10px] font-mono bg-gray-200 dark:bg-black/50 px-1.5 py-0.5 rounded text-gray-500 border border-gray-300 dark:border-white/5">⌘K</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative z-10 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0a]/50 transition-colors duration-300">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                                احترف مستقبل <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                                    التقنية وهندسة الذكاء الاصطناعي
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl">
                                مسارات تعليمية مختارة للمطورين. من React و Node.js إلى وكلاء الذكاء الاصطناعي المتقدمين.
                                تتبع تقدمك، احصل على شهادات، وطور مهاراتك.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setIsCommandPaletteOpen(true)}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 font-medium flex items-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    ابحث عن دورة
                                </button>
                                <button className="px-8 py-3 bg-white dark:bg-white/5 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-medium">
                                    شاهد خارطة الطريق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto flex">
                    {/* Sidebar */}
                    <SkillTreeSidebar
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />

                    {/* Main Content */}
                    <main className="flex-1 p-6 lg:p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {selectedCategory === 'all' ? 'دورات مميزة' : selectedCategory}
                                    </h2>
                                    <p className="text-gray-500">
                                        {filteredCourses.length} دورة متاحة
                                    </p>
                                </div>

                                {/* Bento Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(300px,auto)]">
                                    {sortedCourses.map((course, index) => (
                                        <SmartCourseCard
                                            key={course.id}
                                            course={course}
                                            onClick={() => handleCourseClick(course.id)}
                                            // Make the first item featured (2x2)
                                            featured={index === 0 && selectedCategory === 'all'}
                                        />
                                    ))}
                                </div>

                                {filteredCourses.length === 0 && (
                                    <div className="text-center py-20">
                                        <p className="text-gray-500">لم يتم العثور على دورات في هذا القسم.</p>
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm"
                                        >
                                            مسح التصنيفات
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    courses={courses}
                    onSelectCourse={handleCourseClick}
                />
            </div>
        </PageLayout>
    );
};

export default TolzyLearnPage;

