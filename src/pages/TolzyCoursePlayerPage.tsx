import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types/learn';
import { ExternalLink, Globe, Clock, Users, ArrowLeft, Sparkles, CheckCircle2, PlayCircle, Star, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import SEO from '../components/SEO';

const TolzyCoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    // Auto-fetch real student count if missing
    // Auto-fetch real student count
    const fetchRealStudentCount = async () => {
        if (!course || !course.sourceUrl) return;

        try {
            // Determine API URL based on environment
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_BASE = isLocal ? 'http://localhost:5000' : '';

            const response = await axios.post(`${API_BASE}/api/fetch-course`, { url: course.sourceUrl });

            if (response.data && response.data.studentsCount > 0) {
                const newCount = response.data.studentsCount;

                // 1. Update Layout State
                setCourse(prev => prev ? ({ ...prev, studentsCount: newCount }) : null);

                // 2. Persist to Firestore (only if changed, practically)
                const courseRef = doc(db, 'courses', course.id);
                await updateDoc(courseRef, { studentsCount: newCount });
                console.log(`Updated student count for ${course.title}: ${newCount}`);
            }
        } catch (error) {
            // calculated silence: scraping often fails due to adblockers/CORS/etc
            // console.warn("Auto-refresh skipped");
        }
    };

    // Trigger on load if missing
    useEffect(() => {
        if (course && (!course.studentsCount || course.studentsCount === 0)) {
            fetchRealStudentCount();
        }
    }, [course?.id]);


    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            try {
                const docRef = doc(db, 'courses', courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
                } else {
                    navigate('/tolzy-learn');
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, navigate]);

    const handleEnroll = () => {
        if (course?.sourceUrl) {
            window.open(course.sourceUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-500"></div>
            </div>
        );
    }

    if (!course) return null;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "provider": {
            "@type": "Organization",
            "name": course.platform || "Tolzy Learn",
            "sameAs": course.sourceUrl
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": course.rating || 5,
            "reviewCount": course.reviewsCount || 1
        },
        "offers": {
            "@type": "Offer",
            "category": "Free"
        }
    };

    return (
        <PageLayout>
            <SEO
                title={`${course.title} | كورس مجاني على Tolzy Learn`}
                description={course.description?.slice(0, 160) || `تعلم ${course.title} مجاناً على منصة Tolzy Learn. كورس شامل في ${course.category} للمستوى ${course.level}.`}
                keywords={`${course.title}, كورس ${course.title}, تعلم ${course.category}, دورة ${course.category}, ${course.platform || 'Tolzy'}, كورسات مجانية, تعلم البرمجة`}
                image={course.thumbnail}
                structuredData={structuredData}
            />
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050505] font-sans text-gray-900 dark:text-gray-300 relative overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-300" dir="rtl">
                {/* Background Decor - Enhanced */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 dark:bg-indigo-500/10 rounded-full blur-[150px] animate-pulse-slow" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-500/10 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-purple-600/5 dark:bg-purple-500/10 rounded-full blur-[150px] animate-pulse-slow delay-2000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/tolzy-learn')}
                        className="group flex items-center gap-3 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-10 transition-colors font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl w-fit"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>العودة للدورات</span>
                    </motion.button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        {/* Left Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-7 space-y-10"
                        >
                            {/* Header */}
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-500/30">
                                        {course.category || 'دورة'}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-white/10">
                                        <Globe className="w-3.5 h-3.5" />
                                        {course.platform || 'خارجي'}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tight">
                                    {course.title}
                                </h1>
                                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                                    {course.description}
                                </p>
                            </div>

                            {/* Stats Grid - Redesigned */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        icon: <Users className="w-5 h-5" />,
                                        value: (
                                            <div className="flex items-center gap-2 justify-center">
                                                <span>{(course.studentsCount !== undefined && course.studentsCount !== null) ? course.studentsCount.toLocaleString() : '...'}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetchRealStudentCount(); // Expose this or move logic
                                                    }}
                                                    className="p-1 hover:bg-blue-100 rounded-full transition-colors hidden group-hover:block"
                                                    title="Refresh Count"
                                                >
                                                    <RefreshCw className="w-3 h-3 text-blue-500" />
                                                </button>
                                            </div>
                                        ),
                                        label: 'طالب (عالمياً)',
                                        color: 'text-blue-500',
                                        bg: 'bg-blue-500/10'
                                    },
                                    {
                                        icon: <Clock className="w-5 h-5" />,
                                        value: course.duration || 'ذاتي',
                                        label: 'المدة',
                                        color: 'text-amber-500',
                                        bg: 'bg-amber-500/10'
                                    },
                                    {
                                        icon: <Sparkles className="w-5 h-5" />,
                                        value: { 'beginner': 'مبتدئ', 'intermediate': 'متوسط', 'advanced': 'متقدم', 'all': 'الجميع' }[course.level?.toLowerCase() || 'all'] || course.level,
                                        label: 'المستوى',
                                        color: 'text-emerald-500',
                                        bg: 'bg-emerald-500/10'
                                    },
                                    {
                                        icon: <Star className="w-5 h-5 fill-current" />,
                                        value: course.rating || 5.0,
                                        label: 'التقييم',
                                        color: 'text-yellow-500',
                                        bg: 'bg-yellow-500/10'
                                    }
                                ].map((stat, i) => (
                                    <div key={i} className="p-5 bg-white dark:bg-[#0f0f0f] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3 group">
                                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{stat.value}</p>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* What you'll learn - Modern List */}
                            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        ماذا ستتعلم
                                    </h3>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {course.whatYouWillLearn.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-200 text-base font-medium leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Right Column: Sticky Card - Enhanced */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-5 lg:sticky lg:top-24"
                        >
                            <div className="bg-white dark:bg-[#0f0f0f]/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-gray-100 dark:border-white/10 overflow-hidden p-3 relative group">
                                {/* Image Container */}
                                <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-4 cursor-pointer shadow-lg" onClick={handleEnroll}>
                                    <img
                                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]">
                                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                                            <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span>{course.rating || 4.8}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 pb-6">
                                    <div className="mb-6">
                                        <span className={`text-2xl font-bold ${(course.price === 'free' || !course.price)
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {(course.price === 'free' || !course.price) ? 'مجاني بالكامل' : 'مدفوع'}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleEnroll}
                                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 flex items-center justify-center gap-3"
                                        >
                                            <span>ابدأ التعلم الآن</span>
                                            <ExternalLink className="w-5 h-5 rtl:-scale-x-100" />
                                        </button>

                                        <button
                                            onClick={handleEnroll}
                                            className="w-full py-4 px-6 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all border border-gray-200 dark:border-white/10 flex items-center justify-center gap-3 group/btn"
                                        >
                                            <span className="opacity-80 group-hover/btn:opacity-100">عرض التفاصيل في {course.platform || 'المصدر'}</span>
                                            <ExternalLink className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 rtl:-scale-x-100" />
                                        </button>
                                    </div>

                                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6 font-medium">
                                        {(course.studentsCount && course.studentsCount > 0)
                                            ? `🔥 ينضم أكثر من ${Math.ceil(course.studentsCount / 1000)} طالب يومياً لهذه الدورة`
                                            : '🔥 ينضم مئات الطلاب يومياً لهذه الدورة'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyCoursePlayerPage;
