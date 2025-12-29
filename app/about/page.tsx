import type { Metadata } from 'next';
import AboutPage from '@/src/pages/AboutPage';

export const metadata: Metadata = {
    title: 'من نحن - Tolzy',
    description: 'تعرف على Tolzy، المنصة الرائدة في تقديم دليل شامل لأدوات الذكاء الاصطناعي والتعليم التفاعلي. مهمتنا تبسيط الوصول إلى أفضل أدوات AI للجميع.',
    openGraph: {
        title: 'من نحن - Tolzy',
        description: 'تعرف على Tolzy، المنصة الرائدة في تقديم دليل شامل لأدوات الذكاء الاصطناعي',
        url: 'https://www.tolzy.me/about',
    },
};

export default function About() {
    return <AboutPage />;
}
