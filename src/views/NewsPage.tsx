"use client";
import React, { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { listPublishedNews } from '../services/news.service';
import type { NewsArticle } from '../types/index';
import Link from 'next/link';
import { Newspaper, Clock, ArrowLeft, Loader, TrendingUp, Sparkles, Calendar } from 'lucide-react';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    listPublishedNews()
      .then(items => { if (mounted) { setNews(items); setLoading(false); } })
      .catch(() => { if (mounted) { setError('تعذر تحميل الأخبار'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  const featuredNews = news.length > 0 ? news[0] : null;
  const regularNews = news.slice(1);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
          <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[size:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-700/50 to-transparent"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 animate-fade-in">
                <Newspaper className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl font-extrabold text-white mb-4 animate-fade-in">
                أخبار الذكاء الاصطناعي
              </h1>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
                آخر الأخبار والتحديثات في عالم أدوات الذكاء الاصطناعي
              </p>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center justify-center gap-3">
                    <TrendingUp className="h-6 w-6 text-blue-300" />
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{news.length}</div>
                      <div className="text-sm text-slate-300">مقالة</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="h-6 w-6 text-indigo-300" />
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">جديد</div>
                      <div className="text-sm text-slate-300">محتوى حصري</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center justify-center gap-3">
                    <Calendar className="h-6 w-6 text-emerald-300" />
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">يومي</div>
                      <div className="text-sm text-slate-300">تحديثات</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <Loader className="h-12 w-12 text-slate-600 dark:text-slate-400 animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">جارٍ تحميل الأخبار...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/30 border-r-4 border-red-500 rounded-xl p-6 animate-fade-in">
              <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
            </div>
          ) : news.length === 0 ? (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-12 text-center animate-fade-in">
              <Newspaper className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">لا توجد أخبار حالياً.</p>
            </div>
          ) : (
            <>
              {/* Featured News */}
              {featuredNews && (
                <div className="mb-12 animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">الخبر المميز</h2>
                  </div>
                  <Link href={`/news/${featuredNews.id}`} className="group block">
                    <article className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featuredNews.coverImageUrl && (
                          <div className="relative h-80 md:h-auto overflow-hidden">
                            <img
                              src={featuredNews.coverImageUrl}
                              alt={featuredNews.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          </div>
                        )}
                        <div className="p-8 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                              مميز
                            </span>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(featuredNews.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                            {featuredNews.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 line-clamp-3">
                            {featuredNews.content}
                          </p>
                          <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold group-hover:gap-3 transition-all">
                            <span>اقرأ المزيد</span>
                            <ArrowLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )}

              {/* Regular News Grid */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  أحدث الأخبار
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularNews.map((item, index) => (
                    <article
                      key={item.id}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {item.coverImageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.coverImageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-3">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                          {item.content}
                        </p>
                        <Link
                          href={`/news/${item.id}`}
                          className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold hover:gap-3 transition-all group/link"
                        >
                          <span>اقرأ المزيد</span>
                          <ArrowLeft className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default NewsPage;


