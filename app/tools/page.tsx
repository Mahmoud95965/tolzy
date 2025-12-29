import type { Metadata } from 'next';
import ToolsPage from '@/src/views/ToolsPage';

export const metadata: Metadata = {
    title: 'جميع الأدوات - دليل شامل لـ400+ أداة ذكاء اصطناعي | Tolzy',
    description: 'استكشف أكبر دليل عربي لأدوات الذكاء الاصطناعي. أكثر من 400 أداة مع تقييمات حقيقية، مقارنات احترافية، ومراجعات مفصلة. ChatGPT، Gemini، Claude، Midjourney، DALL-E وأكثر. ابحث عن الأداة المثالية لمشروعك.',
    keywords: [
        'أدوات ذكاء اصطناعي',
        'AI tools',
        'ChatGPT',
        'Google Gemini',
        'Claude AI',
        'Midjourney',
        'DALL-E',
        'تقييم أدوات AI',
        'مقارنة أدوات الذكاء الاصطناعي',
        'أفضل أدوات AI 2025',
        'دليل أدوات الذكاء الاصطناعي',
    ],
    openGraph: {
        title: 'جميع الأدوات - دليل شامل لـ400+ أداة ذكاء اصطناعي',
        description: 'أكبر دليل عربي لأدوات الذكاء الاصطناعي مع تقييمات ومقارنات احترافية',
        url: 'https://tolzy.me/tools',
        type: 'website',
        locale: 'ar_EG',
        siteName: 'Tolzy',
        images: [
            {
                url: 'https://tolzy.me/Logo.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy - دليل أدوات الذكاء الاصطناعي',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'جميع الأدوات - Tolzy',
        description: 'أكبر دليل عربي لأدوات الذكاء الاصطناعي',
        images: ['https://tolzy.me/Logo.png'],
    },
    alternates: {
        canonical: 'https://tolzy.me/tools',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function Tools() {
    return <ToolsPage />;
}
