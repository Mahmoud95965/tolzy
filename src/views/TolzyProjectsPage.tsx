import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { ExternalLink, Sparkles, BookOpen, Bot } from 'lucide-react';

interface TolzyProject {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  status: 'live' | 'coming-soon';
}

const TolzyProjectsPage: React.FC = () => {
  const projects: TolzyProject[] = [
    {
      id: 'tolzy-tools',
      name: 'Tolzy Tools',
      description: 'المنصة الرئيسية - دليل شامل لأكثر من 400 أداة ذكاء اصطناعي مجانية ومدفوعة (ChatGPT, Gemini, Claude, Midjourney)',
      url: '/tools',
      icon: <Sparkles className="w-12 h-12" />,
      color: 'purple',
      status: 'live'
    },
    {
      id: 'tolzy-learn',
      name: 'Tolzy Learn',
      description: 'منتج إضافي - منصة تعليمية تفاعلية بالذكاء الاصطناعي مع دورات مجانية في البرمجة والذكاء الاصطناعي',
      url: '/tolzy-learn',
      icon: <BookOpen className="w-12 h-12" />,
      color: 'green',
      status: 'live'
    },
    {
      id: 'tolzy-stack',
      name: 'Tolzy Stack',
      description: 'منتج إضافي - مكتبة متخصصة لاستكشاف مشاريع GitHub مفتوحة المصدر والتعلم من أفضل المطورين',
      url: '/tolzy-stack',
      icon: <Sparkles className="w-12 h-12" />,
      color: 'indigo',
      status: 'live'
    },
    {
      id: 'tolzy-ai',
      name: 'Tolzy AI',
      description: 'مختبر الذكاء الاصطناعي - استكشف وجرب أحدث نماذج الذكاء الاصطناعي (Gemini Pro) والأدوات التجريبية',
      url: '/tolzy-ai',
      icon: <Bot className="w-12 h-12" />,
      color: 'blue',
      status: 'live'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30' }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <PageLayout>
      <SEO
        title="منتجات Tolzy - المنصة الرئيسية والمنتجات الإضافية"
        description="اكتشف منتجات Tolzy: المنصة الرئيسية (دليل 400+ أداة ذكاء اصطناعي)، Tolzy Learn (كورسات برمجة مجانية)، و Tolzy Stack (مشاريع GitHub مفتوحة المصدر). جميع المنتجات متاحة الآن من إنتاج Tolzy!"
        keywords="tolzy products, منتجات tolzy, tolzy tools, tolzy learn, tolzy stack, أدوات الذكاء الاصطناعي, كورسات برمجة مجانية, مشاريع مفتوحة المصدر, منصات تعليمية عربية, أدوات المطورين"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  مشاريع Tolzy
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                اكتشف عالم <span className="text-indigo-600 dark:text-indigo-400">Tolzy</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                مجموعة متكاملة من المنصات والأدوات للمطورين والمتعلمين
              </p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const colorClasses = getColorClasses(project.color);
              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Icon & Status */}
                  <div className={`${colorClasses.bg} p-8 flex items-center justify-between`}>
                    <div className={colorClasses.text}>
                      {project.icon}
                    </div>
                    {project.status === 'live' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        متاح الآن
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        قريباً
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {project.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Action Button */}
                    {project.status === 'live' ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.hover} font-semibold rounded-lg transition-all duration-200`}
                      >
                        <span>زيارة المنصة</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                      >
                        <span>قريباً</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center text-white">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              هل لديك فكرة لمشروع جديد؟
            </h2>
            <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
              شاركنا أفكارك وساعدنا في بناء المستقبل معاً
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors duration-200"
            >
              <span>تواصل معنا</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TolzyProjectsPage;
