import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { Calendar, Sparkles, Zap, Package, Bug, Wrench, CheckCircle2 } from 'lucide-react';

interface Update {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  items: {
    category: 'feature' | 'improvement' | 'bugfix' | 'other';
    text: string;
  }[];
}

const UpdatesPage: React.FC = () => {

  const updates: Update[] = [
    {
      version: '2.0.0',
      date: '2025-01-07',
      type: 'major',
      items: [
        { category: 'feature', text: 'تصميم جديد كلياً للصفحة الرئيسية مع واجهة مستخدم محسّنة' },
        { category: 'feature', text: 'إضافة قسم الأدوات الشائعة مع نظام التبويبات' },
        { category: 'feature', text: 'Carousel تفاعلي لعرض الأدوات المميزة' },
        { category: 'improvement', text: 'تحسين تصميم بطاقات الأدوات مع تأثيرات hover جديدة' },
        { category: 'improvement', text: 'تحسين قسم الفئات بتصميم أنيق وألوان بسيطة' },
        { category: 'feature', text: 'إضافة دعم كامل للغة العربية والإنجليزية' },
      ]
    },
    {
      version: '1.5.0',
      date: '2024-12-15',
      type: 'minor',
      items: [
        { category: 'feature', text: 'إضافة نظام التقييمات للأدوات' },
        { category: 'feature', text: 'إضافة خاصية حفظ الأدوات المفضلة' },
        { category: 'improvement', text: 'تحسين سرعة تحميل الصفحات' },
        { category: 'bugfix', text: 'إصلاح مشكلة البحث في الوضع الليلي' },
      ]
    },
    {
      version: '1.4.2',
      date: '2024-11-28',
      type: 'patch',
      items: [
        { category: 'bugfix', text: 'إصلاح مشكلة عرض الصور في بعض الأدوات' },
        { category: 'bugfix', text: 'إصلاح مشكلة التنقل بين الصفحات' },
        { category: 'improvement', text: 'تحسين أداء البحث' },
      ]
    },
    {
      version: '1.4.0',
      date: '2024-11-10',
      type: 'minor',
      items: [
        { category: 'feature', text: 'إضافة أكثر من 50 أداة جديدة' },
        { category: 'feature', text: 'إضافة فلاتر متقدمة للبحث' },
        { category: 'improvement', text: 'تحسين تصميم صفحة تفاصيل الأداة' },
        { category: 'feature', text: 'إضافة نظام الإشعارات' },
      ]
    },
    {
      version: '1.3.0',
      date: '2024-10-20',
      type: 'minor',
      items: [
        { category: 'feature', text: 'إطلاق الوضع الليلي (Dark Mode)' },
        { category: 'feature', text: 'إضافة صفحة الأسئلة الشائعة' },
        { category: 'improvement', text: 'تحسين تجربة المستخدم على الهواتف' },
      ]
    },
    {
      version: '1.0.0',
      date: '2024-09-01',
      type: 'major',
      items: [
        { category: 'feature', text: 'إطلاق النسخة الأولى من Tolzy' },
        { category: 'feature', text: 'إضافة أكثر من 100 أداة ذكاء اصطناعي' },
        { category: 'feature', text: 'نظام التصنيفات والفئات' },
        { category: 'feature', text: 'محرك البحث الذكي' },
      ]
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature':
        return <Sparkles className="w-4 h-4" />;
      case 'improvement':
        return <Zap className="w-4 h-4" />;
      case 'bugfix':
        return <Bug className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'improvement':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'bugfix':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'feature':
        return 'ميزة جديدة';
      case 'improvement':
        return 'تحسين';
      case 'bugfix':
        return 'إصلاح';
      default:
        return 'أخرى';
    }
  };

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'minor':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'patch':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <PageLayout>
      <SEO 
        title="التحديثات - Tolzy"
        description="تابع آخر التحديثات والتحسينات على منصة Tolzy لأدوات الذكاء الاصطناعي"
        url="/updates"
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-6 shadow-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                سجل التحديثات
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              آخر التحديثات
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              تابع جميع التحسينات والميزات الجديدة التي نضيفها لتحسين تجربتك
            </p>
          </div>
        </div>
      </section>

      {/* Updates Timeline */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 opacity-20" />

            {/* Updates List */}
            <div className="space-y-12">
              {updates.map((update, index) => (
                <div key={index} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute right-[1.875rem] top-8 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 ring-4 ring-white dark:ring-gray-900 shadow-lg" />

                  {/* Update Card */}
                  <div className="mr-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-md ${getVersionBadgeColor(update.type)}`}>
                            <Package className="w-4 h-4" />
                            v{update.version}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(update.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <ul className="space-y-3">
                        {update.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3 group">
                            <div className={`flex-shrink-0 p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                              {getCategoryIcon(item.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                                  {getCategoryLabel(item.category)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {item.text}
                              </p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-lg">
              <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                المزيد قادم قريباً
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                نعمل باستمرار على تحسين Tolzy وإضافة ميزات جديدة. تابع هذه الصفحة للبقاء على اطلاع بآخر التحديثات.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default UpdatesPage;
