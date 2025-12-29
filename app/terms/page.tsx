import type { Metadata } from 'next';
import TermsPage from '@/src/views/TermsPage';

export const metadata: Metadata = {
    title: 'شروط الاستخدام - Tolzy',
    description: 'شروط وأحكام استخدام موقع Tolzy. اقرأ سياسات الاستخدام والشروط القانونية للمنصة.',
    openGraph: {
        title: 'شروط الاستخدام - Tolzy',
        description: 'شروط وأحكام استخدام موقع Tolzy',
        url: 'https://www.tolzy.me/terms',
    },
};

export default function Terms() {
    return <TermsPage />;
}
