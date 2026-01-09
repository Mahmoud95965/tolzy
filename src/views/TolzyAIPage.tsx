"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { ExternalLink, Beaker, FileQuestion } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface TestCard {
    id: string;
    name: string;
    description: string;
    url: string;
    icon: React.ReactNode;
    color: string;
    isActive?: boolean;
}

const TolzyAIPage: React.FC = () => {
    const [exams, setExams] = useState<TestCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const q = query(collection(db, 'exams'), where('isActive', '==', true));
                const querySnapshot = await getDocs(q);
                const fetchedExams: TestCard[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.title || 'اختبار بدون عنوان',
                        description: data.description || 'لا يوجد وصف لهذا الاختبار',
                        url: `/exams/${doc.id}`,
                        icon: <FileQuestion className="w-10 h-10" />,
                        color: 'blue' // Default color
                    };
                });
                setExams(fetchedExams);
            } catch (error) {
                console.error("Error fetching exams: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
            blue: {
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800',
                hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
            },
            green: {
                bg: 'bg-green-50 dark:bg-green-900/20',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-800',
                hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
            }
        };
        return colors[color] || colors.blue;
    };

    return (
        <PageLayout>
            <SEO
                title="Tolzy AI - تجارب ونماذج ذكاء اصطناعي"
                description="استكشف أحدث نماذج وتجارب الذكاء الاصطناعي من تطوير فريق Tolzy. جرب Gemini Pro وأدوات أخرى."
                keywords="tolzy ai, gemini pro, تجارب ذكاء اصطناعي, نماذج AI"
            />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                                <Beaker className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                مختبر Tolzy AI
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                                مساحة تجريبية لاستكشاف واختبار أحدث تقنيات ونماذج الذكاء الاصطناعي
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tests Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Render Dynamic Exams */}
                            {exams.length > 0 ? (
                                exams.map((test) => {
                                    const colorClasses = getColorClasses(test.color);
                                    return (
                                        <div
                                            key={test.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`p-3 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
                                                        {test.icon}
                                                    </div>
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                        نشط
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                                    {test.name}
                                                </h3>

                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 h-12 overflow-hidden line-clamp-2">
                                                    {test.description}
                                                </p>

                                                <a
                                                    href={test.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg border ${colorClasses.border} ${colorClasses.text} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium`}
                                                >
                                                    <span>بدء الاختبار</span>
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
                                    لا توجد اختبارات متاحة حالياً.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyAIPage;
