import type { Metadata } from 'next';
import TolzyPathsPage from '@/src/pages/TolzyPathsPage';

export const metadata: Metadata = {
    title: 'مسارات التعلم - Tolzy',
    description: 'استكشف مسارات التعلم المنظمة في مختلف المجالات. خطط دراسية شاملة لتطوير مهاراتك خطوة بخطوة.',
    openGraph: {
        title: 'مسارات التعلم - Tolzy',
        description: 'استكشف مسارات التعلم المنظمة في مختلف المجالات',
        url: 'https://www.tolzy.me/paths',
    },
};

export default function Paths() {
    return <TolzyPathsPage />;
}
