
import type { Metadata } from 'next';
import NewsDetailPage from '@/src/views/NewsDetailPage';
import { getAllNewsFromFirebase, getNewsByIdFromFirebase } from '@/lib/firebase-admin';

type Props = {
    params: Promise<{ id: string }>;
};

// Generate static paths for all news - Critical for SEO!
export async function generateStaticParams() {
    try {
        const news = await getAllNewsFromFirebase();

        return news.map((article: any) => ({
            id: article.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Generate metadata for each news page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const article = await getNewsByIdFromFirebase(id);

    if (!article) {
        return {
            title: 'الخبر غير موجود - Tolzy',
        };
    }

    const articleTitle = article.title;
    const articleDescription = article.content.substring(0, 160).replace(/\n/g, ' ') + '...';
    const articleImage = article.coverImageUrl || 'https://tolzy.me/image/tools/Hero.png';
    const publishedTime = article.createdAt;

    return {
        title: `${articleTitle} - Tolzy News`,
        description: articleDescription,
        keywords: [
            articleTitle,
            ...(article.tags || []),
            'Tolzy News',
            'أخبار الذكاء الاصطناعي',
            'AI News',
        ],
        openGraph: {
            title: articleTitle,
            description: articleDescription,
            url: `https://tolzy.me/news/${id}`,
            images: [
                {
                    url: articleImage,
                    width: 1200,
                    height: 630,
                    alt: articleTitle,
                },
            ],
            type: 'article',
            publishedTime: publishedTime,
            authors: ['Tolzy'],
        },
        twitter: {
            card: 'summary_large_image',
            title: articleTitle,
            description: articleDescription,
            images: [articleImage],
        },
        alternates: {
            canonical: `https://tolzy.me/news/${id}`,
        },
    };
}

export default async function NewsDetail({ params }: Props) {
    const { id } = await params;
    const article = await getNewsByIdFromFirebase(id);

    // Generate JSON-LD structured data for SEO
    const jsonLd = article ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': article.title,
        'image': [article.coverImageUrl || 'https://tolzy.me/image/tools/Hero.png'],
        'datePublished': article.createdAt,
        'dateModified': article.createdAt,
        'author': {
            '@type': 'Organization',
            'name': 'Tolzy'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Tolzy',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://tolzy.me/Logo.png'
            }
        },
        'description': article.content.substring(0, 160).replace(/\n/g, ' ') + '...'
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <NewsDetailPage initialArticle={article} />
        </>
    );
}

// Enable ISR
export const revalidate = 3600; // Revalidate every hour
