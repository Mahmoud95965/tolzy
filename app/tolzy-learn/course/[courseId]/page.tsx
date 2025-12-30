
import type { Metadata } from 'next';
import TolzyCoursePlayerPage from '@/src/views/TolzyCoursePlayerPage';
import { getAllCoursesFromFirebase, getCourseByIdFromFirebase } from '@/lib/firebase-admin';

type Props = {
    params: Promise<{ courseId: string }>;
};

// Generate static paths for all courses - Critical for SEO!
export async function generateStaticParams() {
    try {
        const courses = await getAllCoursesFromFirebase();

        return courses.map((course: any) => ({
            courseId: course.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Generate comprehensive metadata for Tolzy Learn courses
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { courseId } = await params;
    const course = await getCourseByIdFromFirebase(courseId);

    if (!course) {
        return {
            title: 'الكورس غير موجود - Tolzy Learn',
        };
    }

    const courseName = course.title;
    const courseDescription = course.description || 'تعلم مهارات جديدة مع Tolzy Learn';
    const courseImage = course.thumbnail || 'https://tolzy.me/Logo.png';

    return {
        title: `${courseName} - Tolzy Learn | كورسات مجانية`,
        description: courseDescription,
        keywords: [
            courseName,
            course.category || '',
            ...(course.instructor ? [course.instructor] : []),
            'Tolzy Learn',
            'كورس مجاني',
            'تعليم البرمجة بالعربي',
            'دورة شاملة',
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
                    url: courseImage,
                    width: 1200,
                    height: 630,
                    alt: courseName,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${courseName} - Tolzy Learn`,
            description: courseDescription,
            images: [courseImage],
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
    const { courseId } = await params;
    const course = await getCourseByIdFromFirebase(courseId);

    // Enhanced Course JSON-LD schema for Tolzy Learn
    const courseSchema = course ? {
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': course.title,
        'description': course.description,
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
        'image': [course.thumbnail || 'https://tolzy.me/Logo.png'],
        'educationalLevel': course.level, // beginner, intermediate, advanced
        'inLanguage': 'ar',
        'isAccessibleForFree': course.price === 'free',
        'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'online',
            'instructor': {
                '@type': 'Person', // Assuming instructor is a person, adjust if Organization
                'name': course.instructor || 'Tolzy Team'
            }
        },
        'aggregateRating': course.rating ? {
            '@type': 'AggregateRating',
            'ratingValue': course.rating,
            'reviewCount': course.reviewsCount || 1 // Avoid 0 review count for valid schema
        } : undefined,
    } : null;

    return (
        <>
            {courseSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
                />
            )}
            <TolzyCoursePlayerPage initialCourse={course} />
        </>
    );
}

export const revalidate = 3600; // Revalidate every hour
