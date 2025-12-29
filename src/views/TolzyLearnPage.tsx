"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';

import { Search, Menu, X } from 'lucide-react';
import { Course } from '../types/learn';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import SkillTreeSidebar, { skillTreeData, SkillNode } from '../components/learn/SkillTreeSidebar';
import SmartCourseCard from '../components/learn/SmartCourseCard';
import CommandPalette from '../components/learn/CommandPalette';

const TolzyLearnPage: React.FC = () => {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        const findCategoryKeywords = (categoryId: string): string[] => {
            const keywords: string[] = [categoryId];

            const findNode = (nodes: SkillNode[]): SkillNode | undefined => {
                for (const node of nodes) {
                    if (node.id === categoryId) return node;
                    if (node.children) {
                        const found = findNode(node.children);
                        if (found) return found;
                    }
                }
                return undefined;
            };

            const node = findNode(skillTreeData);
            if (node) {
                keywords.push(node.label.toLowerCase());
                if (node.children) {
                    node.children.forEach(child => {
                        keywords.push(child.id);
                        keywords.push(child.label.toLowerCase());
                        keywords.push(...findCategoryKeywords(child.id));
                    });
                }
            }
            return keywords;
        };

        const searchKeywords = findCategoryKeywords(selectedCategory);

        // Add specific mapping for known categories to ensure broad matching
        if (selectedCategory === 'web-dev') searchKeywords.push('web', 'frontend', 'backend', 'react', 'node');
        if (selectedCategory === 'ai-foundations') searchKeywords.push('ai', 'machine learning', 'python');
        if (selectedCategory === 'ai-skills') searchKeywords.push('prompt', 'gpt', 'midjourney', 'tools', 'ai tools', 'هندسة');

        return searchKeywords.some(keyword =>
            course.category?.toLowerCase().includes(keyword.toLowerCase()) ||
            course.title.toLowerCase().includes(keyword.toLowerCase())
        );
    });

    const handleCourseClick = (courseId: string) => {
        router.push(`/tolzy-learn/course/${courseId}`);
    };

    const sortedCourses = filteredCourses;

    return (
        <PageLayout>
            <div className="relative min-h-screen bg-[#FDFDFD] dark:bg-[#050505] transition-colors duration-300 overflow-x-hidden">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
                    <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-2000" />
                </div >

                {/* Hero Section */}
                < div className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden" >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className="font-bold tracking-wide">Tolzy Learn</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
                            اصنع مستقبلك <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">
                                بالبرمجة والذكاء
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
                            اكتشف مئات المسارات التعليمية المصممة بعناية لتأخذك من الأساسيات إلى الاحتراف.
                            تعلم، طبق، وابني مشاريع حقيقية.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setIsCommandPaletteOpen(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-105 transition-transform duration-200 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                            >
                                <Search className="w-5 h-5" />
                                ابدأ البحث
                            </button>
                            <button
                                onClick={() => router.push('/paths')}
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
                            >
                                استكشف المسارات
                            </button>
                        </div>
                    </div>
                </div >

                {/* Main Content Area */}
                < div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-20" >
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Desktop */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <div className="sticky top-24">
                                <SkillTreeSidebar
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                />
                            </div>
                        </aside>

                        {/* Content */}
                        <main className="flex-1 min-w-0">
                            {/* Filter Bar */}
                            <div className="sticky top-0 z-30 py-4 mb-8 bg-[#FDFDFD]/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-all">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => setIsSidebarOpen(true)}
                                            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white"
                                        >
                                            <Menu className="w-5 h-5" />
                                        </button>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {selectedCategory === 'all' ? 'أحدث الكورسات' : selectedCategory}
                                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                                {filteredCourses.length}
                                            </span>
                                        </h2>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                                        {['all', 'AI Skills', 'Web Development', 'AI', 'Design', 'Cybersecurity'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(
                                                    cat === 'Web Development' ? 'web-dev' :
                                                        cat === 'AI' ? 'ai-foundations' :
                                                            cat === 'AI Skills' ? 'ai-skills' :
                                                                cat === 'Design' ? 'design' :
                                                                    cat === 'Cybersecurity' ? 'cybersecurity' :
                                                                        cat
                                                )}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${(
                                                    selectedCategory === cat ||
                                                    (cat === 'Web Development' && selectedCategory === 'web-dev') ||
                                                    (cat === 'AI' && selectedCategory === 'ai-foundations') ||
                                                    (cat === 'AI Skills' && selectedCategory === 'ai-skills') ||
                                                    (cat === 'Design' && selectedCategory === 'design') ||
                                                    (cat === 'Cybersecurity' && selectedCategory === 'cybersecurity')
                                                )
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-indigo-500/30'
                                                    }`}
                                            >
                                                {
                                                    cat === 'all' ? 'الكل' :
                                                        cat === 'AI Skills' ? 'مهارات الذكاء الاصطناعي' :
                                                            cat === 'Web Development' ? 'تطوير الويب' :
                                                                cat === 'AI' ? 'الذكاء الاصطناعي' :
                                                                    cat === 'Design' ? 'التصميم' :
                                                                        cat === 'Cybersecurity' ? 'الأمن السيبراني' :
                                                                            cat
                                                }
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="aspect-[4/5] rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    <AnimatePresence mode='popLayout'>
                                        {sortedCourses.map((course, index) => (
                                            <motion.div
                                                key={course.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <SmartCourseCard
                                                    course={course}
                                                    onClick={() => handleCourseClick(course.id)}
                                                    featured={false}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {!loading && filteredCourses.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <Search className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد نتائج</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                                        لم نتمكن من العثور على دورات تطابق معايير البحث الخاصة بك. حاول تغيير الفلتر أو ابحث عن شيء آخر.
                                    </p>
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
                                    >
                                        عرض كل الدورات
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div >

                {/* Mobile Sidebar Drawer */}
                <AnimatePresence>
                    {
                        isSidebarOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: "spring", damping: 20 }}
                                    className="fixed inset-y-0 right-0 z-50 w-80 bg-[#FDFDFD] dark:bg-[#050505] shadow-2xl lg:hidden overflow-y-auto"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold">القائمة</h2>
                                            <button
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <SkillTreeSidebar
                                            selectedCategory={selectedCategory}
                                            onSelectCategory={(cat) => {
                                                setSelectedCategory(cat);
                                                setIsSidebarOpen(false);
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            </>
                        )
                    }
                </AnimatePresence >

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    courses={courses}
                    onSelectCourse={handleCourseClick}
                />
            </div >
        </PageLayout >
    );
};

export default TolzyLearnPage;
