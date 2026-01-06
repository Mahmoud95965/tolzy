"use client";
import React, { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { getNewsById, toggleLikeNews, incrementShareCount } from '../services/news.service';
import type { NewsArticle } from '../types/index';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Share2, Facebook, Linkedin, Link as LinkIcon, Clock, User, ArrowRight, Loader, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NewsDetailPageProps {
  initialArticle?: NewsArticle | null;
}

// X Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ initialArticle }) => {
  // ... existing hooks ...
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<NewsArticle | null>(initialArticle || null);
  const [loading, setLoading] = useState(!initialArticle);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!id) return;
    getNewsById(id)
      .then(a => {
        setArticle(a);
        setLoading(false);
        if (!a) {
          setError('غير موجود');
        } else {
          setLikesCount(a.likesCount || 0);
          if (currentUser) {
            setIsLiked(a.likes?.includes(currentUser.uid) || false);
          }
        }
      })
      .catch(() => { setError('تعذر تحميل الخبر'); setLoading(false); });
  }, [id, currentUser]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const handleLike = async () => {
    if (!currentUser || !id || isLiking) return;

    setIsLiking(true);
    try {
      const result = await toggleLikeNews(id, currentUser.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error liking news:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!article || !id) return;

    const url = window.location.href;
    const title = article.title;
    const text = article.content.substring(0, 100) + '...';

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط بنجاح!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }

    // Increment share count
    try {
      await incrementShareCount(id);
      if (article) {
        setArticle({ ...article, shares: (article.shares || 0) + 1 });
      }
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }

    setShowShareMenu(false);
  };

  // دالة لتحويل الروابط في النص إلى روابط قابلة للنقر
  const linkifyContent = (text: string) => {
    // تعبير منتظم للبحث عن الروابط
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline break-all font-medium transition-colors"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <Loader className="h-16 w-16 text-slate-600 dark:text-slate-400 animate-spin mb-6" />
            <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">جارٍ تحميل الخبر...</p>
          </div>
        ) : error || !article ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-red-50 dark:bg-red-900/30 border-r-4 border-red-500 rounded-2xl p-8 text-center animate-fade-in">
              <p className="text-red-800 dark:text-red-200 text-xl font-semibold mb-4">{error || 'الخبر غير موجود'}</p>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
                <span>العودة إلى الأخبار</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex items-center gap-2 text-sm">
                  <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    الرئيسية
                  </Link>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <Link href="/news" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    الأخبار
                  </Link>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-md">
                    {article.title}
                  </span>
                </nav>
              </div>
            </div>

            <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Article Header */}
              <div className="mb-8 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                  {article.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {new Date(article.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {article.authorEmail || 'المحرر'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {article.shares || 0} مشاهدة
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              {article.coverImageUrl && (
                <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 group max-h-96">
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200 dark:border-slate-700 animate-fade-in relative z-20" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    disabled={!currentUser || isLiking}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${isLiked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      } ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                    title={!currentUser ? 'يجب تسجيل الدخول للإعجاب' : 'إعجاب'}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  {/* Share Button */}
                  <div className="relative share-menu-container">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      title="مشاركة"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>مشاركة</span>
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-10 animate-fade-in">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Facebook className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <XIcon className="h-4 w-4 text-black dark:text-white" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">X</span>
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <WhatsAppIcon className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare('telegram')}
                          className="w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <TelegramIcon className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Telegram</span>
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Linkedin className="h-5 w-5 text-blue-700" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn</span>
                        </button>
                        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <LinkIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">نسخ الرابط</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Button */}
                <Link
                  href="/news"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span>العودة</span>
                </Link>
              </div>

              {/* Article Content */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 text-lg">
                    {linkifyContent(article.content)}
                  </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">الوسوم:</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Share Footer */}
              <div className="mt-12 bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  أعجبك هذا الخبر؟
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  شاركه مع أصدقائك ليستفيدوا منه أيضاً
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <Facebook className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-4 bg-black hover:bg-slate-900 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => handleShare('telegram')}
                    className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <TelegramIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <Linkedin className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </article>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default NewsDetailPage;


