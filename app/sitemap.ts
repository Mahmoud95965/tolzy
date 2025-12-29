import { MetadataRoute } from 'next';
import { getAllToolsFromFirebase } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tolzy.me';

    // Static pages with SEO priorities
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/tolzy-learn`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/updates`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Dynamic tool pages - CRITICAL FOR SEO!
    try {
        const tools = await getAllToolsFromFirebase();

        const toolPages: MetadataRoute.Sitemap = tools.map((tool: any) => ({
            url: `${baseUrl}/tools/${tool.id}`,
            lastModified: tool.submittedAt ? new Date(tool.submittedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        console.log(`✅ Generated sitemap with ${staticPages.length} static pages and ${toolPages.length} tool pages`);

        return [...staticPages, ...toolPages];
    } catch (error) {
        console.error('❌ Error generating dynamic sitemap:', error);
        // Return static pages even if dynamic generation fails
        return staticPages;
    }
}
