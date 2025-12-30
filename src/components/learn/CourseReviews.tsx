"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Star, User, MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface CourseReviewsProps {
    courseId: string;
    onRatingUpdate?: (newRating: number, newCount: number) => void;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, onRatingUpdate }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const q = query(
                collection(db, 'reviews'),
                where('courseId', '==', courseId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const fetchedReviews: Review[] = [];
            querySnapshot.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
            });
            setReviews(fetchedReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('يجب عليك تسجيل الدخول أولاً');
            return;
        }
        if (rating === 0) {
            toast.error('الرجاء اختيار تقييم');
            return;
        }
        if (!comment.trim()) { // Changed from 'comment'
            toast.error('يرجى كتابة تعليق');
            return;
        }

        setIsSubmitting(true);
        try {
            const newReview = {
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'مستخدم مجهول', // Adjusted default name
                userAvatar: user.photoURL || '',
                rating: rating,
                comment: comment,
            };

            // Call API endpoint
            // fetch-course used http://localhost:5000 logic, let's stick to that if it's a separate express server. 
            // Wait, fetch-course.js is in /api/ folder. If it's Vercel, it's just /api/submit-review.

            const response = await fetch('/api/submit-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    review: newReview
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit review');
            }

            const data = await response.json();

            // Optimistic Update (or use returned data)
            const addedReview = {
                ...newReview,
                courseId,
                createdAt: new Date().toISOString(),
                id: data.reviewId
            };

            setReviews(prev => [addedReview, ...prev]);

            // Notify parent to update stats
            if (onRatingUpdate) {
                onRatingUpdate(data.newRating, data.newReviewsCount);
            }

            toast.success('تم إضافة تقييمك بنجاح!');
            setRating(0);
            setComment('');
        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.error('حدث خطأ أثناء إرسال التقييم: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            toast.success('تم حذف التعليق بنجاح');

            // Note: We are not updating the aggregate rating here immediately as it requires server-side recalc or complex client-side math. 
            // Ideally, the parent component should refetch or the Cloud Function handles aggregations properly.
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('حدث خطأ أثناء حذف التعليق');
        }
    };

    return (
        <div className="space-y-8 bg-white dark:bg-[#0f0f0f] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    التقييمات والمراجعات
                </h3>
                <span className="text-sm text-gray-500 font-medium bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                    {reviews.length} مراجعة
                </span>
            </div>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            ما هو تقييمك للكورس؟
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${(hoverRating || rating) >= star
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            اكتب تعليقك
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="شاركنا رأيك في محتوى الكورس، أسلوب الشرح، والفائدة التي حصلت عليها..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none h-32"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting ? 'animate-pulse' : ''}`}
                        >
                            {isSubmitting ? 'جاري النشر...' : (
                                <>
                                    <span>نشر التقييم</span>
                                    <Send className="w-4 h-4 rtl:-scale-x-100" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">
                        قم بتسجيل الدخول لتتمكن من إضافة تقييمك ومشاركة رأيك
                    </p>
                    <a
                        href="/auth"
                        className="inline-flex items-center px-6 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold shadow-sm hover:shadow-md transition-all border border-indigo-100 dark:border-indigo-500/20"
                    >
                        تسجيل الدخول
                    </a>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>لا توجد تقييمات بعد. كن أول من يقيم هذا الكورس!</p>
                    </div>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {rev.userAvatar ? (
                                        <img src={rev.userAvatar} alt={rev.userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center ring-2 ring-gray-100 dark:ring-white/10">
                                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{rev.userName}</h4>
                                        <span className="text-xs text-gray-400">
                                            {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star <= rev.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-200 dark:text-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                        {rev.comment}
                                    </p>
                                </div>
                                {user && user.uid === rev.userId && (
                                    <button
                                        onClick={() => handleDelete(rev.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="حذف التعليق"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseReviews;
