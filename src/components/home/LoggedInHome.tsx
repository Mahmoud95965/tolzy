"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, TrendingUp, Newspaper, ChevronLeft, ChevronRight, GraduationCap, Check } from 'lucide-react';
import { useTools } from '../../hooks/useTools';
// import { listPublishedNews } from '../../services/news.service';
import { NewsArticle } from '../../types'; // Kept for type casting if needed inside loops
import ToolCard from '../tools/ToolCard';
import { collection, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Course } from '../../types/learn';
import SmartCourseCard from '../learn/SmartCourseCard';
import { convertFirestoreDoc } from '../../services/tools.service';
import { getHeroSlides } from '../../services/hero.service';

const LoggedInHome: React.FC = () => {
    const router = useRouter();
    const { featuredTools } = useTools();
    const [slides, setSlides] = useState<any[]>([]);
    // Fetched news removed to fix build error as it was unused
    // const [news, setNews] = useState<NewsArticle[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch News - Unused
                // const articles = await listPublishedNews();
                // setNews(articles.slice(0, 4));

                // Fetch Courses
                const coursesRef = collection(db, 'courses');
                const q = query(coursesRef, where('isPublished', '==', true), limit(6));
                const querySnapshot = await getDocs(q);
                const fetchedCourses = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Course[];
                setCourses(fetchedCourses);

                // Fetch Hero Slides
                const heroSlides = await getHeroSlides();

                // Helper to ensure absolute URL for external links
                const ensureAbsoluteUrl = (url: string) => {
                    if (!url) return '';
                    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
                        return url;
                    }
                    return `https://${url}`;
                };

                // Process slides to resolve relations
                const processedSlides = await Promise.all(heroSlides.map(async (slide: any) => {
                    let itemData: any = { ...slide };

                    if (slide.type === 'tool' && slide.itemId) {
                        try {
                            const toolDoc = await getDoc(doc(db, 'tools', slide.itemId));
                            if (toolDoc.exists()) {
                                const tool = convertFirestoreDoc(toolDoc);
                                itemData = {
                                    ...tool,
                                    ...itemData, // Keep slide override props
                                    name: slide.customTitle || tool.name,
                                    description: slide.customDescription || tool.description,
                                    imageUrl: slide.customImageUrl || tool.imageUrl,
                                    url: slide.customLink ? ensureAbsoluteUrl(slide.customLink) : `/tools/${tool.id}`
                                };
                            }
                        } catch (e) {
                            console.error('Error fetching tool for slide:', e);
                        }
                    } else if (slide.type === 'news' && slide.itemId) {
                        try {
                            const newsDoc = await getDoc(doc(db, 'news', slide.itemId));
                            if (newsDoc.exists()) {
                                const newsItem = newsDoc.data() as NewsArticle;
                                itemData = {
                                    ...newsItem,
                                    ...itemData,
                                    title: slide.customTitle || newsItem.title,
                                    content: slide.customDescription || newsItem.content,
                                    coverImageUrl: slide.customImageUrl || newsItem.coverImageUrl,
                                    url: slide.customLink ? ensureAbsoluteUrl(slide.customLink) : `/news/${newsItem.id}`
                                };
                            }
                        } catch (e) {
                            console.error('Error fetching news for slide:', e);
                        }
                    } else if (slide.type === 'external') {
                        itemData = {
                            ...itemData,
                            title: slide.customTitle || '',
                            description: slide.customDescription || '',
                            imageUrl: slide.customImageUrl || '',
                            url: ensureAbsoluteUrl(slide.customLink || '#')
                        };
                    }

                    return itemData;
                }));

                setSlides(processedSlides.filter(s => s)); // Filter out nulls if any

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Auto-rotate Effect
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 6000); // 6 seconds per slide

        return () => clearInterval(interval);
    }, [slides.length, currentIndex]);

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
            setIsTransitioning(false);
        }, 300); // Wait for fade out
    };

    const handlePrev = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
            setIsTransitioning(false);
        }, 300);
    };

    const currentSlide = slides[currentIndex];

    // Render logic based on item type
    const renderSlideContent = (item: any) => {
        if (item.type === 'tool') {
            // Tool Layout
            return (
                <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            <span>{item.customBadge || 'أداة مميزة لهذا الأسبوع'}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            {item.titlePrefix ? `${item.titlePrefix} ` : (item.name.toLowerCase().includes('crawleo') ? 'غذّي نموذجك ' : 'ابنِ موقعك مع ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">{item.name}</span>
                        </h1>
                        <p className="text-xl text-indigo-100/90 leading-relaxed max-w-2xl">
                            {item.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {item.features?.map((feature: string, idx: number) => (
                                <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-base text-white/90 border border-white/5 font-medium">
                                    <Check className="w-4 h-4 text-green-400" />
                                    {feature}
                                </span>
                            ))}
                        </div>
                        <div className="pt-4">
                            <Link
                                href={item.url}
                                className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
                            >
                                جرب الأداة الآن
                                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>
                    <div className="relative group h-full flex items-center justify-center animate-fade-in-left">
                        <div className="w-full aspect-video bg-indigo-950/50 rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl relative transform hover:scale-[1.02] transition-transform duration-500">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            );
        } else if (item.type === 'news') {
            // News Layout
            return (
                <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/30 border border-pink-400/30 text-pink-100 text-sm font-medium">
                            <Newspaper className="w-4 h-4" />
                            <span>{item.customBadge || 'أحدث الأخبار'}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight line-clamp-3">
                            {item.titlePrefix ? <span className="block text-2xl mb-2 text-gray-300 font-normal">{item.titlePrefix}</span> : null}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">{item.title}</span>
                        </h1>
                        <p className="text-lg text-indigo-100/80 leading-relaxed max-w-2xl line-clamp-3">
                            {item.content}
                        </p>
                        {item.features && item.features.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                {item.features.map((feature: string, idx: number) => (
                                    <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-base text-indigo-100 border border-white/10 font-medium">
                                        <Check className="w-4 h-4 text-pink-400" />
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="pt-4">
                            <Link
                                href={item.url}
                                className="inline-flex items-center gap-2 bg-pink-600 border border-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg hover:scale-105"
                            >
                                اقرأ المزيد
                                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>
                    <div className="relative group h-full flex items-center justify-center animate-fade-in-left">
                        <div className="w-full aspect-video bg-indigo-950/50 rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl relative transform hover:scale-[1.02] transition-transform duration-500">
                            {item.coverImageUrl ? (
                                <img
                                    src={item.coverImageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                    <Newspaper className="w-20 h-20 opacity-50" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent"></div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // External / Default Layout
            return (
                <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-100 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            <span>{item.customBadge || 'مميز'}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            {item.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">{item.title}</span>
                        </h1>
                        <p className="text-xl text-indigo-100/90 leading-relaxed max-w-2xl">
                            {item.description}
                        </p>
                        {item.features && item.features.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                {item.features.map((feature: string, idx: number) => (
                                    <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-base text-indigo-100 border border-white/10 font-medium">
                                        <Check className="w-4 h-4 text-purple-400" />
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="pt-4">
                            <Link
                                href={item.url || '#'}
                                className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
                            >
                                استكشف الآن
                                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>
                    <div className="relative group h-full flex items-center justify-center animate-fade-in-left">
                        <div className="w-full aspect-video bg-indigo-950/50 rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl relative transform hover:scale-[1.02] transition-transform duration-500">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Fallback UI when no slides exist
    const renderFallbackUI = () => (
        <div className="grid md:grid-cols-2 gap-12 items-center h-full">
            <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-100 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>مستقبل الذكاء الاصطناعي</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    مرحباً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Tolzy</span>
                </h1>
                <p className="text-xl text-indigo-100/90 leading-relaxed max-w-2xl">
                    اكتشف أفضل أدوات الذكاء الاصطناعي، طور مهاراتك من خلال مسارات تعليمية متقدمة، وابنِ مشاريعك بكل سهولة.
                </p>
                <div className="pt-4 flex gap-4">
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
                    >
                        تصفح الأدوات
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
            <div className="relative group h-full flex items-center justify-center animate-fade-in-left">
                <div className="w-full aspect-video relative flex items-center justify-center">
                    {/* Animated Abstract Shape */}
                    <div className="absolute w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute w-64 h-64 bg-blue-600/30 rounded-full blur-3xl animate-pulse delay-700 right-10"></div>
                    <div className="relative z-10 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                        <img
                            src="/image/tools/Logo.png"
                            alt="Tolzy Logo"
                            className="w-32 h-32 object-contain opacity-90 drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-12 pb-12">

            {/* Unified Hero Slider */}
            <div className="w-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 shadow-2xl relative overflow-hidden min-h-[600px] flex items-center">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                    {/* Slide Content */}
                    <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        {slides.length > 0 ? (currentSlide && renderSlideContent(currentSlide)) : renderFallbackUI()}
                    </div>
                </div>

                {/* Slider Navigation Dots */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setIsTransitioning(true);
                                setTimeout(() => {
                                    setCurrentIndex(idx);
                                    setIsTransitioning(false);
                                }, 300);
                            }}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-white w-8'
                                : 'bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Arrow Nav (Optional but helpful) */}
                <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all hidden md:block">
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all hidden md:block">
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Popular Tools */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            أدوات شائعة قد تهمك
                        </h2>
                        <Link href="/tools" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                            عرض الكل
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredTools.slice(0, 4).map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                </div>

                {/* Tolzy Learn Promo Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-6 text-center md:text-right max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-md">
                                <GraduationCap className="w-4 h-4" />
                                <span>ابدأ رحلة التعلم اليوم</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                تعلم البرمجة والذكاء الاصطناعي <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">مجاناً وباحترافية</span>
                            </h2>
                            <p className="text-lg text-indigo-100 leading-relaxed">
                                اكتشف مئات المسارات التعليمية الشاملة، طبق ما تعلمته في مشاريع حقيقية، واحصل على شهادات معتمدة لتطوير مسارك المهني.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
                                <button
                                    onClick={() => router.push('/tolzy-learn')}
                                    className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg hover:scale-105 flex items-center gap-2"
                                >
                                    استكشف المسارات
                                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                </button>
                                <button
                                    onClick={() => router.push('/paths')}
                                    className="px-8 py-4 bg-indigo-700/50 text-white border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-700 transition-colors backdrop-blur-sm"
                                >
                                    مسارات التعلم
                                </button>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            {/* Decorative Icon Visual */}
                            <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm relative">
                                <div className="absolute inset-0 animate-spin-slow opacity-30">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)]"></div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.5)]"></div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-400 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.5)]"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.5)]"></div>
                                </div>
                                <GraduationCap className="w-32 h-32 text-white/90 drop-shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* From Tolzy Learn (New Section) */}
                {courses.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                من Tolzy Learn
                            </h2>
                            <Link href="/tolzy-learn" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                                تصفح جميع الكورسات
                            </Link>
                        </div>

                        {/* Courses Horizontal Slider */}
                        <div className="relative group">
                            <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x pt-2">
                                {courses.map(course => (
                                    <div key={course.id} className="min-w-[300px] md:min-w-[350px] snap-center">
                                        <SmartCourseCard
                                            course={course}
                                            onClick={() => router.push(`/tolzy-learn/course/${course.id}`)}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Fade effect on edges */}
                            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#FDFDFD] dark:from-[#050505] to-transparent pointer-events-none lg:block hidden"></div>
                            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#FDFDFD] dark:from-[#050505] to-transparent pointer-events-none lg:block hidden"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoggedInHome;
