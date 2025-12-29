import type { Metadata } from 'next';
import TolzyLearnPage from '@/src/pages/TolzyLearnPage';

export const metadata: Metadata = {
    title: 'Tolzy Learn - كورسات برمجة مجانية',
    description: 'منصة Tolzy Learn التعليمية - اكتشف مئات الدورات المجانية في البرمجة والذكاء الاصطناعي والتصميم. تعلم وطور مهاراتك مجاناً.',
    openGraph: {
        title: 'Tolzy Learn - كورسات برمجة مجانية',
        description: 'منصة Tolzy Learn التعليمية - اكتشف مئات الدورات المجانية',
        url: 'https://www.tolzy.me/tolzy-learn',
    },
};

export default function TolzyLearn() {
    return <TolzyLearnPage />;
}
