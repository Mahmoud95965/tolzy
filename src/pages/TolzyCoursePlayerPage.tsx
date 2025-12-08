import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types/learn';
import { ExternalLink, Globe, Clock, Users, ArrowLeft, Sparkles, CheckCircle2, PlayCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

import SEO from '../components/SEO';

const TolzyCoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-300 relative overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300" dir="rtl">
                {/* Background Decor */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/tolzy-learn')}
                        className="group flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors font-medium"
                    >
                        <div className="p-2 bg-white dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors shadow-sm">
                            <ArrowLeft className="w-4 h-4 group-hover:translate-x-0.5 transition-transform rotate-180" />
                        </div>
                        <span>العودة للدورات</span>
                    </motion.button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-7 space-y-8"
                        >
                            {/* Header */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                        {course.category || 'دورة'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                                        <Globe className="w-4 h-4" />
                                        {course.platform || 'خارجي'}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
                                    {course.title}
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {course.description}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-colors flex flex-col items-center justify-center text-center gap-2 backdrop-blur-sm shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{course.studentsCount?.toLocaleString() || '2.5k'}</p>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">طالب</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-colors flex flex-col items-center justify-center text-center gap-2 backdrop-blur-sm shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{course.duration || 'سرعة ذاتية'}</p>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">المدة</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-colors flex flex-col items-center justify-center text-center gap-2 backdrop-blur-sm shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white capitalize">
                                            {{
                                                'beginner': 'مبتدئ',
                                                'intermediate': 'متوسط',
                                                'advanced': 'متقدم',
                                                'all': 'جميع المستويات'
                                            }[course.level?.toLowerCase() || 'all'] || course.level || 'جميع المستويات'}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">المستوى</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-colors flex flex-col items-center justify-center text-center gap-2 backdrop-blur-sm shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 justify-center">
                                            <p className="font-bold text-gray-900 dark:text-white">{course.rating || 5.0}</p>
                                            {course.reviewsCount ? <span className="text-xs text-gray-500">({course.reviewsCount.toLocaleString()})</span> : null}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">التقييم</p>
                                    </div>
                                </div>
                            </div>

                            {/* What you'll learn */}
                            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                                <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-white/10 backdrop-blur-sm shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                                        ماذا ستتعلم
                                    </h3>
                                    <ul className="grid sm:grid-cols-2 gap-4">
                                        {course.whatYouWillLearn.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-2.5 flex-shrink-0 shadow-sm dark:shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>

                        {/* Right Column: Sticky Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-5 lg:sticky lg:top-24"
                        >
                            <div className="bg-white dark:bg-[#0f0f0f] rounded-[2rem] shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-white/10 overflow-hidden p-2 relative transition-colors">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                                {/* Image Container */}
                                <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-2 group cursor-pointer" onClick={handleEnroll}>
                                    <img
                                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-100 dark:opacity-90 dark:group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-black/10 dark:bg-black/20 group-hover:bg-black/20 dark:group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/20">
                                            <PlayCircle className="w-8 h-8 text-indigo-600 dark:text-white ml-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 relative">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="text-right w-full">
                                            <div className="flex items-center justify-end gap-1 text-amber-500 dark:text-amber-400 font-bold">
                                                <span>4.8</span>
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">(1.2k تقييم)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleEnroll}
                                            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                                        >
                                            <span>الذهاب للدورة</span>
                                            <ExternalLink className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        </button>

                                        <button
                                            onClick={handleEnroll}
                                            className="w-full py-3 px-6 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2"
                                        >
                                            <span>عرض السعر على {course.platform || 'Coursera'}</span>
                                            <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        </button>
                                    </div>

                                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6 leading-relaxed">
                                        ضمان استراد الاموال عند {course.platform || 'Coursera'}
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
