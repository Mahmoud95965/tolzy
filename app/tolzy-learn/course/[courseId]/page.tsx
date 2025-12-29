import type { Metadata } from 'next';
import TolzyCoursePlayerPage from '@/src/views/TolzyCoursePlayerPage';

type Props = {
    params: Promise<{ courseId: string }>;
};

// Generate comprehensive metadata for Tolzy Learn courses
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { courseId } = await params;

    const courseName = 'دورة برمجة شاملة';
    const courseDescription = 'تعلم البرمجة من الصفر حتى الاحتراف مع Tolzy Learn - أفضل الكورسات المجانية بجودة عالية، شروحات بالعربية، ومشاريع عملية. ابدأ رحلتك في عالم البرمجة الآن!';

    return {
        title: `${courseName} - Tolzy Learn | كورسات برمجة مجانية عالية الجودة`,
        description: courseDescription,
        keywords: [
            courseName,
            'كورس برمجة مجاني',
            'تعليم البرمجة بالعربي',
            'Tolzy Learn',
            'دورة برمجة كاملة',
            'تعلم البرمجة من الصفر',
            'programming course Arabic',
            'كورسات اونلاين مجانية',
            'web development tutorial',
            'دروس برمجة',
        ],
        openGraph: {
            title: `${courseName} - Tolzy Learn`,
            description: courseDescription,
            url: `https://tolzy.me/tolzy-learn/course/${courseId}`,
            type: 'article',
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
            title: `${courseName} - Tolzy Learn`,
            description: courseDescription,
            images: ['https://tolzy.me/Logo.png'],
        },
        alternates: {
            canonical: `https://tolzy.me/tolzy-learn/course/${courseId}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function CoursePlayer({ params }: Props) {
    await params;

    // Enhanced Course JSON-LD schema for Tolzy Learn
    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': 'دورة برمجة شاملة - Tolzy Learn',
        'description': 'كورس برمجة مجاني شامل من الصفر حتى الاحتراف. تعلم تطوير الويب، JavaScript، React، وأكثر مع مشاريع عملية',
        'provider': {
            '@type': 'Organization',
            'name': 'Tolzy',
            'url': 'https://tolzy.me',
            'logo': 'https://tolzy.me/Logo.png',
            'sameAs': [
                'https://twitter.com/tolzy',
                'https://facebook.com/tolzy'
            ]
        },
        'educationalLevel': 'Beginner to Advanced',
        'inLanguage': 'ar',
        'isAccessibleForFree': true,
        'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'online',
            'courseWorkload': 'PT30H', // 30 hours
            'instructor': {
                '@type': 'Organization',
                'name': 'Tolzy'
            }
        },
        'teaches': [
            'Web Development',
            'JavaScript',
            'React',
            'Programming Fundamentals',
            'Project Building'
        ],
        'audience': {
            '@type': 'EducationalAudience',
            'educationalRole': 'student'
        },
        'coursePrerequisites': 'لا توجد متطلبات مسبقة - مناسب للمبتدئين'
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
            />
            <TolzyCoursePlayerPage />
        </>
    );
}

export const revalidate = 3600; // Revalidate every hour
