import { adminDb } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { courseId, review } = req.body;

        if (!courseId || !review || !review.userId || !review.rating) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!adminDb) {
            return res.status(500).json({ error: 'Database not initialized' });
        }

        // 1. Add Review to 'reviews' collection
        const reviewRef = await adminDb.collection('reviews').add({
            ...review,
            courseId,
            createdAt: new Date().toISOString() // Ensure server-side timestamp or consistent string
        });

        // 2. Recalculate Average Rating & Count for the Course
        // We can do this by fetching all reviews for this course.
        // For scalability, we might want to use increment/aggregation, but for now fetching is fine.
        const reviewsSnapshot = await adminDb.collection('reviews').where('courseId', '==', courseId).get();

        let totalRating = 0;
        let count = 0;

        reviewsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.rating) {
                totalRating += data.rating;
                count++;
            }
        });

        const newAverage = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

        // 3. Update Course Document
        const courseRef = adminDb.collection('courses').doc(courseId);
        await courseRef.update({
            rating: newAverage,
            reviewsCount: count
        });

        console.log(`✅ [API] Review added for ${courseId}. New Rating: ${newAverage} (${count})`);

        return res.status(200).json({
            success: true,
            reviewId: reviewRef.id,
            newRating: newAverage,
            newReviewsCount: count
        });

    } catch (error) {
        console.error('❌ [API] Error submitting review:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
