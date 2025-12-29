import type { Metadata } from 'next';
import FAQPage from '@/src/pages/FAQPage';

export const metadata: Metadata = {
    title: 'الأسئلة الشائعة - Tolzy',
    description: 'إجابات على الأسئلة الأكثر شيوعاً حول Tolzy وأدوات الذكاء الاصطناعي. كل ما تحتاج معرفته عن المنصة والأدوات المتوفرة.',
    openGraph: {
        title: 'الأسئلة الشائعة - Tolzy',
        description: 'إجابات على الأسئلة الأكثر شيوعاً حول Tolzy وأدوات الذكاء الاصطناعي',
        url: 'https://www.tolzy.me/faq',
    },
};

export default function FAQ() {
    return <FAQPage />;
}
