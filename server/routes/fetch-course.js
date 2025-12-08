const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.post('/', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract metadata using Open Graph tags
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';

        // Extract JSON-LD for Rating, Reviews, and Date
        let rating = 0;
        let reviewsCount = 0;
        let datePublished = '';

        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const jsonContent = $(el).html();
                if (!jsonContent) return;

                const data = JSON.parse(jsonContent);
                const items = Array.isArray(data) ? data : [data];

                for (const item of items) {
                    // Check for Course or Product with AggregateRating
                    if (item['@type'] === 'Course' || item['@type'] === 'Product') {
                        if (item.aggregateRating) {
                            rating = parseFloat(item.aggregateRating.ratingValue) || 0;
                            reviewsCount = parseInt(item.aggregateRating.reviewCount) || 0;
                        }
                        if (item.datePublished) {
                            datePublished = item.datePublished;
                        }
                        if ((rating > 0 || reviewsCount > 0) && datePublished) break; // Found enough info
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON-LD:', e.message);
            }
        });

        // Fallback: Try to find rating in meta tags or specific selectors if JSON-LD failed
        if (rating === 0) {
            // Udemy specific (sometimes they put it in meta)
            const udemyRating = $('meta[property="udemy_com:rating"]').attr('content');
            if (udemyRating) rating = parseFloat(udemyRating);
        }

        res.json({
            title: title.trim(),
            description: description.trim(),
            thumbnail: image,
            rating,
            reviewsCount,
            datePublished
        });

    } catch (error) {
        console.error('Error fetching course:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            if (error.response.status === 403) {
                return res.status(403).json({ error: 'Udemy security blocked the request (Cloudflare). Please enter details manually.' });
            }
        }
        res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
    }
});

module.exports = router;
