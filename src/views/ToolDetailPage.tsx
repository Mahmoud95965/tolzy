"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { updateToolVote, updateToolSave } from '../services/tool-actions.service';
import PageLayout from '../components/layout/PageLayout';
import ToolsGrid from '../components/tools/ToolsGrid';
import ShareToolModal from '../components/tools/ShareToolModal';
import ToolImage from '../components/common/ToolImage';
import { Tool } from '../types/tool';
import {
  Star,
  ExternalLink,
  Share2,
  BookmarkPlus,
  BookmarkMinus,
  ThumbsUp,
  ThumbsDown,
  Loader,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ToolDetailPageProps {
  initialTool?: Tool | null;
}

const ToolDetailPageNew: React.FC<ToolDetailPageProps> = ({ initialTool }) => {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { tools, isLoading: toolsLoading } = useTools();

  // Initialize with server data if available
  const [tool, setTool] = useState<Tool | null>(initialTool || null);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'not-helpful' | null>(null);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  // If we have initialTool, we are not loading initially
  const [loading, setLoading] = useState(!initialTool);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateRelatedTools = useCallback((currentTool: Tool) => {
    // If tools context is empty (SSR or first load), we might not have related tools yet.
    // That's fine, they can pop in later.
    if (!tools || tools.length === 0) return;

    const related = tools
      .filter(t =>
        t.id !== currentTool.id &&
        (t.category === currentTool.category ||
          t.tags.some(tag => currentTool.tags.includes(tag)))
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    setRelatedTools(related);
  }, [tools]);

  const updateUserVote = useCallback((toolData: Tool) => {
    if (user && toolData.votes) {
      if (toolData.votes.helpful?.includes(user.uid)) {
        setUserVote('helpful');
      } else if (toolData.votes.notHelpful?.includes(user.uid)) {
        setUserVote('not-helpful');
      } else {
        setUserVote(null);
      }
    }
  }, [user]);

  // Ref to track if we've initialized from server/context
  const initializedRef = React.useRef(false);

  // 1. Initial Setup Effect (for server-side initialTool)
  useEffect(() => {
    if (initialTool) {
      setTool(initialTool);
      initializedRef.current = true;
    }
  }, [initialTool]);

  // 2. Hydration from Context Effect
  useEffect(() => {
    if (!id || initializedRef.current || tool) return;

    if (tools.length > 0) {
      const normalizedId = id.toString().padStart(3, '0');
      const toolFromContext = tools.find(t => t.id === normalizedId);
      if (toolFromContext) {
        setTool(toolFromContext);
        setLoading(false);
        // We found it in context, no need to subscribe individually if we trust context
        // However, context might be stale. But for now, let's prioritize reducing reads.
      }
    }
  }, [id, tools, tool]);

  // Track attempted fetches to prevent loops
  const attemptRef = React.useRef<{ [key: string]: number }>({});

  // 3. Subscription Effect (Stable - depends ONLY on ID)
  useEffect(() => {
    if (!id) {
      if (!initialTool) {
        setError('الأداة غير موجودة');
        setLoading(false);
      }
      return;
    }

    // Skip if we already have the tool and it matches the ID (optimization)
    const normalizedId = id.toString().padStart(3, '0');
    if (tool && tool.id === normalizedId) {
      return;
    }

    // Circuit breaker for loops
    const attemptCount = attemptRef.current[normalizedId] || 0;
    if (attemptCount > 3) {
      console.warn(`Too many fetch attempts for tool ${normalizedId}, stopping.`);
      setError('حدث خطأ أثناء تحميل الأداة (تجاوز الحد المسموح)');
      setLoading(false);
      return;
    }
    attemptRef.current[normalizedId] = attemptCount + 1;

    const toolRef = doc(db, 'tools', normalizedId);

    const unsubscribe = onSnapshot(
      toolRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const toolData = { ...snapshot.data(), id: snapshot.id } as Tool;
          setTool(toolData);
          setError(null);
        } else {
          setTool(null);
          // Only show error if we strictly needed this to exist (not relying on context)
          // But here, if it's missing from DB, it's an error.
          setError('الأداة غير موجودة');
        }
        setLoading(false);
      },
      (err: any) => {
        console.error('Error fetching tool:', err);
        if (err.code === 'resource-exhausted') {
          // Stop trying immediately on 429
          setError('الخدمة مشغولة حالياً، يرجى المحاولة لاحقاً');
        } else {
          setError('حدث خطأ أثناء تحميل الأداة');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, initialTool, tool]); // Added tool to dep to skip if set


  // 4. Derived Updates Effect (Related Tools & User Vote)
  useEffect(() => {
    if (tool) {
      updateRelatedTools(tool);
      updateUserVote(tool);
    }
  }, [tool, updateRelatedTools, updateUserVote]);

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      setVoteMessage('يجب تسجيل الدخول للتصويت');
      return;
    }

    if (!tool?.id) return;

    setIsVoting(true);
    setVoteMessage(null);

    try {
      const result = await updateToolVote(tool.id, user.uid, isHelpful);
      if (result.success) {
        setVoteMessage('شكراً على ملاحظاتك!');
      }
    } catch (error) {
      setVoteMessage('حدث خطأ أثناء التصويت');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    if (!tool?.id) return;

    setIsSaving(true);

    try {
      const isSaved = tool.savedBy?.includes(user.uid) || false;
      await updateToolSave(tool.id, user.uid, !isSaved);
    } catch (error) {
      console.error('Error saving tool:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating)
          ? 'text-amber-400 fill-amber-400'
          : 'text-gray-300 dark:text-gray-600'
          }`}
      />
    ));
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      </PageLayout>
    );
  }

  if (error || !tool) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الأداة غير موجودة</h1>
          <Link
            href="/tools"
            className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
          >
            تصفح جميع الأدوات
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 animate-fade-in">
          <ol className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الرئيسية</Link></li>
            <li>/</li>
            <li><Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الأدوات</Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">{tool.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-6">
                {/* Tool Logo */}
                <div className="flex-shrink-0">
                  <ToolImage
                    imageUrl={tool.imageUrl}
                    name={tool.name}
                    categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                    subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
                    size="lg"
                    className="transition-transform duration-300 hover:scale-110"
                  />
                </div>

                {/* Tool Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {tool.name}
                      </h1>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          {renderStars(tool.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                            {tool.rating.toFixed(1)} ({tool.reviewCount || 0})
                          </span>
                        </div>
                        {Array.isArray(tool.category) ? tool.category.map((cat, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                            {cat}
                          </span>
                        )) : (
                          <span className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                            {tool.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
            </div>

            {/* What is ToolName? */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in opacity-0 animation-delay-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ما هو {tool.name}؟
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {tool.longDescription || tool.description}
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in opacity-0 animation-delay-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                المميزات الرئيسية
              </h2>
              <div className="space-y-3">
                {tool.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros */}
            {tool.pros && tool.pros.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in opacity-0 animation-delay-300 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  المميزات
                </h2>
                <ul className="space-y-3">
                  {tool.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {tool.cons && tool.cons.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in opacity-0 animation-delay-400 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  العيوب
                </h2>
                <ul className="space-y-3">
                  {tool.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in opacity-0 animation-delay-500 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-indigo-500" />
                التسعير
              </h2>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 text-lg font-semibold rounded-lg ${tool.pricing === 'Free' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' :
                  tool.pricing === 'Freemium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' :
                    tool.pricing === 'Paid' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}>
                  {tool.pricing === 'Free' ? 'مجاني' :
                    tool.pricing === 'Freemium' ? 'مجاني مع مميزات مدفوعة' :
                      tool.pricing === 'Paid' ? 'مدفوع' :
                        'اشتراك'}
                </span>
              </div>
            </div>

            {/* Was this helpful? */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in opacity-0 animation-delay-600 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                هل كانت هذه المعلومات مفيدة؟
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${userVote === 'helpful'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  نعم ({tool.votes?.helpful?.length || 0})
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${userVote === 'not-helpful'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  لا ({tool.votes?.notHelpful?.length || 0})
                </button>
              </div>
              {voteMessage && (
                <p className="mt-3 text-sm text-center text-green-600 dark:text-green-400">
                  {voteMessage}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Action Buttons */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-fade-in shadow-sm">
                <div className="space-y-3">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <ExternalLink className="w-5 h-5" />
                    زيارة الموقع
                  </a>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${tool.savedBy?.includes(user?.uid || '')
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {tool.savedBy?.includes(user?.uid || '') ? (
                      <>
                        <BookmarkMinus className="w-5 h-5" />
                        إزالة من المحفوظات
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-5 h-5" />
                        حفظ الأداة
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    <Share2 className="w-5 h-5" />
                    مشاركة
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-fade-in opacity-0 animation-delay-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  إحصائيات
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-5 h-5" />
                      <span>المحفوظات</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tool.savedBy?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-5 h-5" />
                      <span>التقييمات</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(tool.votes?.helpful?.length || 0) + (tool.votes?.notHelpful?.length || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tool.tags && tool.tags.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-fade-in opacity-0 animation-delay-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    الوسوم
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-16 animate-fade-in opacity-0 animation-delay-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              أدوات مشابهة
            </h2>
            <ToolsGrid tools={relatedTools} />
          </div>
        )}
      </div>

      {isShareModalOpen && tool && (
        <ShareToolModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          tool={tool}
        />
      )}
    </PageLayout>
  );
};

export default ToolDetailPageNew;
