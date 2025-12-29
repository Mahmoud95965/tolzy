import type { Metadata } from 'next';
import ToolsPage from '@/src/pages/ToolsPage';

export const metadata: Metadata = {
    title: 'جميع الأدوات - Tolzy',
    description: 'استكشف دليلنا الشامل لأكثر من 400 أداة ذكاء اصطناعي مع تقييمات ومقارنات احترافية. ChatGPT, Gemini, Claude, Midjourney وأكثر.',
    openGraph: {
        title: 'جميع الأدوات - Tolzy',
        description: 'استكشف دليلنا الشامل لأكثر من 400 أداة ذكاء اصطناعي',
        url: 'https://www.tolzy.me/tools',
    },
};

export default function Tools() {
    return <ToolsPage />;
}
