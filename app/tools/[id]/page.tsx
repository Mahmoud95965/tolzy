import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolDetailPage from '@/src/pages/ToolDetailPage';
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
            url: `https://www.tolzy.me/tools/${id}`,
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
            canonical: `https://www.tolzy.me/tools/${id}`,
        },
    };
}

export default async function ToolDetail({ params }: Props) {
    const { id } = await params;
    const tool = await getToolByIdFromFirebase(id);

    if (!tool) {
        notFound();
    }

    return <ToolDetailPage />;
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
