import axios from 'axios';
import * as cheerio from 'cheerio';
import { adminDb } from '../lib/firebase-admin'; // Ensure this path is correct for your project structure

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, courseId } = req.body; // Accept courseId to update Firestore

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            },
            timeout: 8000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract metadata
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';

        // Extract JSON-LD for Rating, Reviews, Date, and Student Count
        let rating = 0;
        let reviewsCount = 0;
        let datePublished = '';
        let studentsCount = 0;

        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const jsonContent = $(el).html();
                if (!jsonContent) return;

                const data = JSON.parse(jsonContent);
                const items = Array.isArray(data) ? data : [data];

                for (const item of items) {
                    if (item['@type'] === 'Course' || item['@type'] === 'Product') {
                        if (item.aggregateRating) {
                            rating = parseFloat(item.aggregateRating.ratingValue) || 0;
                            reviewsCount = parseInt(item.aggregateRating.reviewCount) || 0;
                        }
                        if (item.datePublished) {
                            datePublished = item.datePublished;
                        }
                        if (item.interactionStatistic) {
                            const stats = Array.isArray(item.interactionStatistic) ? item.interactionStatistic : [item.interactionStatistic];
                            for (const stat of stats) {
                                if (stat.interactionType === 'http://schema.org/RegisterAction' || stat.interactionType === 'RegisterAction') {
                                    studentsCount = parseInt(stat.userInteractionCount) || 0;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON-LD:', e.message);
            }
        });

        // Fallback: Regex for student count
        if (studentsCount === 0) {
            const bodyText = $('body').text();
            const studentPatterns = [
                /([\d,.]+[kKmM]?)\s+students/i,
                /([\d,.]+[kKmM]?)\s+learners/i,
                /([\d,.]+[kKmM]?)\s+enrolled/i,
                /enrolled\s*:\s*([\d,.]+[kKmM]?)/i
            ];

            for (const pattern of studentPatterns) {
                const match = bodyText.match(pattern);
                if (match) {
                    let numStr = match[1].toLowerCase().replace(/,/g, '');
                    let multiplier = 1;
                    if (numStr.includes('k')) { multiplier = 1000; numStr = numStr.replace('k', ''); }
                    else if (numStr.includes('m')) { multiplier = 1000000; numStr = numStr.replace('m', ''); }

                    const parsed = parseFloat(numStr);
                    if (!isNaN(parsed)) {
                        studentsCount = Math.floor(parsed * multiplier);
                        break;
                    }
                }
            }
        }

        // Fallback: Meta rating
        if (rating === 0) {
            const udemyRating = $('meta[property="udemy_com:rating"]').attr('content');
            if (udemyRating) rating = parseFloat(udemyRating);
        }

        // --- Server-Side Update Logic ---
        // If courseId is provided and we found a new student count, update Firestore secure
        if (courseId && studentsCount > 0 && adminDb) {
            try {
                const courseRef = adminDb.collection('courses').doc(courseId);
                await courseRef.update({ studentsCount: studentsCount });
                console.log(`✅ [API] Updated student count for ${courseId}: ${studentsCount}`);
            } catch (dbError) {
                console.error('❌ [API] Failed to update Firestore:', dbError);
                // Continue execution, don't fail the request just because of DB update
            }
        }

        res.status(200).json({
            title: title.trim(),
            description: description.trim(),
            thumbnail: image,
            rating,
            reviewsCount,
            datePublished,
            studentsCount
        });

    } catch (error) {
        console.error('Error fetching course:', error.message);
        if (error.response?.status === 403) {
            return res.status(403).json({ error: 'Udemy security blocked the request.' });
        }
        res.status(200).json({
            title: '',
            description: '',
            thumbnail: '',
            rating: 0,
            reviewsCount: 0,
            datePublished: '',
            studentsCount: 0,
            error: 'Scraping blocked or failed'
        });
    }
}
