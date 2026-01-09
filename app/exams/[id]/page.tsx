"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';
import ExamPage, { ExamData } from '../../../src/views/ExamPage';

export default function Page() {
    const params = useParams();
    const id = params.id as string;
    const [exam, setExam] = useState<ExamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExam = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'exams', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setExam({ id: docSnap.id, ...docSnap.data() } as ExamData);
                } else {
                    setError('عذراً، هذا الاختبار غير موجود.');
                }
            } catch (err) {
                console.error('Error fetching exam:', err);
                setError('حدث خطأ أثناء تحميل الاختبار.');
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">خطأ</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <a
                    href="/tolzy-ai"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    العودة للرئيسية
                </a>
            </div>
        );
    }

    return <ExamPage exam={exam} />;
}
