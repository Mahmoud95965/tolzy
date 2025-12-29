import type { Metadata } from 'next';
import ContactPage from '@/src/views/ContactPage';

export const metadata: Metadata = {
    title: 'اتصل بنا - Tolzy',
    description: 'تواصل مع فريق Tolzy. نحن هنا للإجابة على أسئلتك واستفساراتك حول أدوات الذكاء الاصطناعي والمنصة.',
    openGraph: {
        title: 'اتصل بنا - Tolzy',
        description: 'تواصل مع فريق Tolzy',
        url: 'https://www.tolzy.me/contact',
    },
};

export default function Contact() {
    return <ContactPage />;
}
