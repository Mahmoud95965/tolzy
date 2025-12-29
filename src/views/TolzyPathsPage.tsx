"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { Rocket } from 'lucide-react';
import { learningPaths as paths } from '../data/learningPaths';

const TolzyPathsPage: React.FC = () => {
    const router = useRouter();

    // SEO: Structured Data for List of Learning Paths
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": paths.map((path, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": path.title,
            "description": path.description,
            "url": `https://tolzy.me/paths/${path.id}`
        }))
    };

    return (
        <PageLayout>
            <SEO
                title="مسارات التعلم المتكاملة - Tolzy Learn"
                description="مسارات تعليمية منظمة تأخذك من الصفر إلى الاحتراف في مجالات البرمجة والتصميم. خطط دراسية شاملة، مشاريع عملية، وشهادات معتمدة."
                keywords="learning paths, roadmap, frontend, backend, fullstack, ai, data science, cybersecurity, ui/ux, مسارات تعلم, خطة دراسية, برمجة, ذكاء اصطناعي"
                structuredData={jsonLd}
            />

            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans" dir="rtl">
                {/* Ambient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />
                </div>

                <div className="relative z-10 pt-20 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            مسارات تعليمية تفاعلية
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6">
                            اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">مسارك المهني</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            خطط دراسية شاملة، مشاريع عملية، وشهادات معتمدة. اختر المسار الذي يناسب طموحك وابدأ الرحلة.
                        </p>
                    </div>

                    {/* Paths Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paths.map((path, index) => (
                            <motion.div
                                key={path.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => router.push(`/paths/${path.id}`)}
                                className="group relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 cursor-pointer hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
                            >
                                {/* Gradient Orb on Hover */}
                                <div className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                        {path.icon}
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300`}>
                                            {path.level === 'beginner' ? 'مبتدئ' : path.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                                        </span>
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                            {path.duration}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-500 transition-colors">
                                        {path.title}
                                    </h3>

                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                        {path.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/10">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">متوسط الراتب</p>
                                            <p className="font-bold text-indigo-600 dark:text-indigo-400">{path.averageSalary}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Rocket className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyPathsPage;
