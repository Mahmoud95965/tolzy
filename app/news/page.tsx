import type { Metadata } from 'next';
import NewsPage from '@/src/views/NewsPage';

export const metadata: Metadata = {
    title: 'الأخبار - Tolzy',
    description: 'آخر أخبار وتحديثات عالم الذكاء الاصطناعي وأدوات AI. تابع أحدث التطورات والإصدارات الجديدة.',
    openGraph: {
        title: 'الأخبار - Tolzy',
        description: 'آخر أخبار وتحديثات عالم الذكاء الاصطناعي وأدوات AI',
        url: 'https://www.tolzy.me/news',
    },
};

export default function News() {
    return <NewsPage />;
}
