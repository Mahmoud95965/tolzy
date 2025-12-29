import type { Metadata } from 'next';
import ToolDetailPage from '@/src/views/ToolDetailPage';
import { getAllToolsFromFirebase, getToolByIdFromFirebase } from '@/lib/firebase-admin';

type Props = {
    params: Promise<{ id: string }>;
};

// Generate static paths for all tools - Critical for SEO!
export async function generateStaticParams() {
    try {
        const tools = await getAllToolsFromFirebase();

        return tools.map((tool: any) => ({
            id: tool.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Generate metadata for each tool page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const tool = await getToolByIdFromFirebase(id);

    if (!tool) {
        return {
            title: 'الأداة غير موجودة - Tolzy',
        };
    }

    const toolName = tool.name || 'أداة مجهولة';
    const toolDescription = tool.description || tool.longDescription || '';
    const toolImage = tool.imageUrl || '/image/tools/Hero.png';

    return {
        title: `${toolName} - دليل شامل ومراجعة احترافية`,
        description: toolDescription,
        keywords: [
            toolName,
            ...(tool.tags || []),
            'أداة ذكاء اصطناعي',
            'AI tool',
            'Tolzy',
        ],
        openGraph: {
            title: `${toolName} - دليل شامل ومراجعة احترافية`,
            description: toolDescription,
            url: `https://tolzy.me/tools/${id}`,
            images: [
                {
                    url: toolImage,
                    width: 1200,
                    height: 630,
                    alt: toolName,
                },
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${toolName} - دليل شامل ومراجعة احترافية`,
            description: toolDescription,
            images: [toolImage],
        },
        alternates: {
            canonical: `https://tolzy.me/tools/${id}`,
        },
    };
}

export default async function ToolDetail({ params }: Props) {
    const { id } = await params;
    const tool = await getToolByIdFromFirebase(id);

    // If server fetch fails, don't 404 immediately. 
    // Let the client component try to fetch or handle the error.
    // if (!tool) {
    //    notFound();
    // }

    // Generate JSON-LD structured data for SEO
    const jsonLd = tool ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': tool.name,
        'description': tool.description || tool.longDescription,
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web',
        'image': tool.imageUrl || 'https://tolzy.me/Logo.png',
        'url': `https://tolzy.me/tools/${id}`,
        'offers': {
            '@type': 'Offer',
            'price': tool.pricing === 'Free' ? '0' : tool.pricing === 'Paid' ? '99' : '0',
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock',
            'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        },
        'aggregateRating': tool.rating > 0 ? {
            '@type': 'AggregateRating',
            'ratingValue': tool.rating.toString(),
            'reviewCount': tool.reviewCount.toString(),
            'bestRating': '5',
            'worstRating': '1'
        } : undefined,
        'review': tool.reviewCount > 0 ? {
            '@type': 'Review',
            'reviewRating': {
                '@type': 'Rating',
                'ratingValue': tool.rating.toString()
            },
            'author': {
                '@type': 'Organization',
                'name': 'Tolzy'
            }
        } : undefined
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ToolDetailPage initialTool={tool} />
        </>
    );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
