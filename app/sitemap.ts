import { MetadataRoute } from 'next';
import { getAllToolsFromFirebase, getAllNewsFromFirebase, getAllCoursesFromFirebase } from '@/lib/firebase-admin';

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

        // Dynamic news pages
        const news = await getAllNewsFromFirebase();
        const newsPages: MetadataRoute.Sitemap = news.map((article: any) => ({
            url: `${baseUrl}/news/${article.id}`,
            lastModified: article.createdAt ? new Date(article.createdAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Dynamic course pages
        const courses = await getAllCoursesFromFirebase();
        const coursePages: MetadataRoute.Sitemap = courses.map((course: any) => ({
            url: `${baseUrl}/tolzy-learn/course/${course.id}`,
            lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        }));

        console.log(`✅ Generated sitemap with ${staticPages.length} static pages, ${toolPages.length} tools, ${newsPages.length} news, and ${coursePages.length} courses`);

        return [...staticPages, ...toolPages, ...newsPages, ...coursePages];
    } catch (error) {
        console.error('❌ Error generating dynamic sitemap:', error);
        // Return static pages even if dynamic generation fails
        return staticPages;
    }
}
