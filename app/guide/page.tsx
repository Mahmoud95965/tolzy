import type { Metadata } from 'next';
import BeginnerGuidePage from '@/src/views/BeginnerGuidePage';

export const metadata: Metadata = {
    title: 'دليل المبتدئين - Tolzy',
    description: 'دليلك الشامل للبدء مع أدوات الذكاء الاصطناعي. تعلم كيفية استخدام ChatGPT وGemini وأدوات AI الأخرى خطوة بخطوة.',
    openGraph: {
        title: 'دليل المبتدئين - Tolzy',
        description: 'دليلك الشامل للبدء مع أدوات الذكاء الاصطناعي',
        url: 'https://www.tolzy.me/guide',
    },
};

export default function Guide() {
    return <BeginnerGuidePage />;
}
