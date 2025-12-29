import type { Metadata } from 'next';
import TolzyProjectsPage from '@/src/views/TolzyProjectsPage';

export const metadata: Metadata = {
    title: 'مشاريعنا - Tolzy Stack',
    description: 'استكشف مجموعة من المشاريع البرمجية مفتوحة المصدر التي تساهم في تطوير المجتمع التقني.',
};

export default function Projects() {
    return <TolzyProjectsPage />;
}
