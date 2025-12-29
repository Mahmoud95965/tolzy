import type { Metadata } from 'next';
import TolzyLearnPage from '@/src/views/TolzyLearnPage';

export const metadata: Metadata = {
    title: 'Tolzy Learn - كورسات برمجة مجانية عالية الجودة | تعلم البرمجة من الصفر',
    description: 'منصة Tolzy Learn التعليمية - أفضل كورسات البرمجة المجانية بالعربية. تعلم تطوير الويب، JavaScript، React، Python، وأكثر من خلال دورات شاملة ومشاريع عملية. ابدأ رحلتك في عالم البرمجة مجاناً الآن!',
    keywords: [
        'Tolzy Learn',
        'كورسات برمجة مجانية',
        'تعلم البرمجة بالعربي',
        'دورات برمجة اونلاين',
        'تعليم البرمجة من الصفر',
        'كورس JavaScript',
        'كورس React',
        'كورس Python',
        'web development tutorial',
        'programming courses Arabic',
        'دروس برمجة مجانية',
        'تطوير الويب',
    ],
    openGraph: {
        title: 'Tolzy Learn - كورسات برمجة مجانية عالية الجودة',
        description: 'أفضل كورسات البرمجة المجانية بالعربية. تعلم تطوير الويب والبرمجة من خلال دورات شاملة ومشاريع عملية',
        url: 'https://tolzy.me/tolzy-learn',
        type: 'website',
        locale: 'ar_EG',
        siteName: 'Tolzy Learn',
        images: [
            {
                url: 'https://tolzy.me/Logo.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy Learn - تعلم البرمجة مجاناً',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tolzy Learn - كورسات برمجة مجانية',
        description: 'أفضل كورسات البرمجة المجانية بالعربية',
        images: ['https://tolzy.me/Logo.png'],
    },
    alternates: {
        canonical: 'https://tolzy.me/tolzy-learn',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TolzyLearn() {
    return <TolzyLearnPage />;
}
