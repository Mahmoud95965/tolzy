import TolzyAIPage from '@/src/views/TolzyAIPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tolzy AI - تجارب ونماذج الذكاء الاصطناعي',
    description: 'استكشف أحدث نماذج وتجارب الذكاء الاصطناعي من تطوير فريق Tolzy. جرب Gemini Pro وأدوات أخرى.',
    keywords: [
        'tolzy ai',
        'gemini pro',
        'تجارب ذكاء اصطناعي',
        'نماذج AI',
        'ذكاء اصطناعي تجريبي'
    ],
    openGraph: {
        title: 'Tolzy AI - تجارب ونماذج ذكاء اصطناعي',
        description: 'مختبر Tolzy AI لاستكشاف أحدث تقنيات الذكاء الاصطناعي',
        url: 'https://tolzy.me/tolzy-ai',
    }
};

export default function Page() {
    return <TolzyAIPage />;
}
