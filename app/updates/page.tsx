import type { Metadata } from 'next';
import UpdatesPage from '@/src/views/UpdatesPage';

export const metadata: Metadata = {
    title: 'التحديثات - Tolzy',
    description: 'تابع آخر التحديثات والميزات الجديدة في منصة Tolzy.',
};

export default function Updates() {
    return <UpdatesPage />;
}
