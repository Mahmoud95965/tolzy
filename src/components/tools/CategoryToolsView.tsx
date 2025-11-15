import React from 'react';
import { useTools } from '../../hooks/useTools';
import { ToolCategory } from '../../types';
import type { Tool } from '../../types/tool';
import ToolCard from './ToolCard';

interface CategoryToolsViewProps {
  category: ToolCategory;
}

interface SubcategoryGroup {
  name: string;
  nameAr: string;
  tools: Tool[];
}

const CategoryToolsView: React.FC<CategoryToolsViewProps> = ({ category }) => {
  const { tools } = useTools();

  // تصفية الأدوات حسب الفئة الرئيسية
  const categoryTools = tools.filter((tool: Tool) => {
    if (Array.isArray(tool.category)) {
      return tool.category.includes(category);
    }
    return tool.category === category;
  });

  // تجميع الأدوات حسب الفئات الفرعية
  const groupToolsBySubcategory = (): SubcategoryGroup[] => {
    const subcategoryMap = new Map<string, Tool[]>();

    categoryTools.forEach((tool: Tool) => {
      if (tool.subcategory) {
        const subcategories = Array.isArray(tool.subcategory) 
          ? tool.subcategory 
          : [tool.subcategory];

        subcategories.forEach((sub: string) => {
          if (!subcategoryMap.has(sub)) {
            subcategoryMap.set(sub, []);
          }
          subcategoryMap.get(sub)!.push(tool);
        });
      } else {
        // الأدوات بدون فئة فرعية
        const otherKey = 'Other';
        if (!subcategoryMap.has(otherKey)) {
          subcategoryMap.set(otherKey, []);
        }
        subcategoryMap.get(otherKey)!.push(tool);
      }
    });

    // تحويل Map إلى مصفوفة مع ترجمة الأسماء
    const subcategoryGroups: SubcategoryGroup[] = [];
    subcategoryMap.forEach((tools, subcategoryName) => {
      subcategoryGroups.push({
        name: subcategoryName,
        nameAr: getSubcategoryNameAr(subcategoryName),
        tools: tools
      });
    });

    // ترتيب حسب عدد الأدوات (الأكثر أولاً)
    return subcategoryGroups.sort((a, b) => b.tools.length - a.tools.length);
  };

  // ترجمة أسماء الفئات الفرعية إلى العربية
  const getSubcategoryNameAr = (subcategory: string): string => {
    const translations: { [key: string]: string } = {
      // Video
      'Video Editing': 'تحرير الفيديو',
      'Video Generation': 'توليد الفيديو',
      'Video Enhancement': 'تحسين الفيديو',
      'Text to Video': 'نص إلى فيديو',
      'Video Analytics': 'تحليلات الفيديو',
      
      // Writing
      'Content Writing': 'كتابة المحتوى',
      'Copywriting': 'كتابة إعلانية',
      'Paraphrasing': 'إعادة الصياغة',
      'Grammar Check': 'التدقيق اللغوي',
      'Translation': 'الترجمة',
      'SEO': 'تحسين محركات البحث',
      
      // Design
      'Image Generation': 'توليد الصور',
      'Image Editing': 'تحرير الصور',
      'Logo Design': 'تصميم الشعارات',
      'UI/UX Design': 'تصميم واجهات المستخدم',
      'Graphic Design': 'التصميم الجرافيكي',
      
      // Productivity
      'Task Management': 'إدارة المهام',
      'Note Taking': 'تدوين الملاحظات',
      'Calendar': 'التقويم',
      'Email': 'البريد الإلكتروني',
      'Automation': 'الأتمتة',
      'Project Management': 'إدارة المشاريع',
      
      // Programming
      'Code Generation': 'توليد الكود',
      'Code Review': 'مراجعة الكود',
      'Debugging': 'تصحيح الأخطاء',
      'Documentation': 'التوثيق',
      'Testing': 'الاختبار',
      
      // Business
      'Marketing': 'التسويق',
      'Sales': 'المبيعات',
      'Customer Service': 'خدمة العملاء',
      'Analytics': 'التحليلات',
      
      // Education
      'Learning': 'التعلم',
      'Teaching': 'التدريس',
      'Assessment': 'التقييم',
      'Course Creation': 'إنشاء الدورات',
      'Study Tools': 'أدوات الدراسة',
      
      // Research
      'Literature Review': 'مراجعة الأدبيات',
      'Data Analysis': 'تحليل البيانات',
      'Citation Management': 'إدارة الاقتباسات',
      'Academic Writing': 'الكتابة الأكاديمية',
      
      // Creativity
      'Music Generation': 'توليد الموسيقى',
      'Audio Generation': 'توليد الصوت',
      'Voice Cloning': 'استنساخ الصوت',
      
      // 3D
      '3D Modeling': 'النمذجة ثلاثية الأبعاد',
      'NeRF': 'NeRF',
      
      // Other
      'Other': 'أخرى',
      'Productivity': 'الإنتاجية',
      'Business': 'الأعمال'
    };

    return translations[subcategory] || subcategory;
  };

  // الحصول على اسم الفئة بالعربية
  const getCategoryNameAr = (category: ToolCategory): string => {
    const categoryNames: { [key in ToolCategory]?: string } = {
      'Video': 'الفيديو',
      'Writing': 'الكتابة',
      'Design': 'التصميم',
      'Productivity': 'الإنتاجية',
      'Programming': 'البرمجة',
      'Business': 'الأعمال',
      'Education': 'التعليم',
      'Research': 'البحث',
      'Creativity': 'الإبداع',
      '3D': 'ثلاثي الأبعاد',
      'Automation': 'الأتمتة',
      'Other': 'أخرى'
    };

    return categoryNames[category] || category;
  };

  const subcategoryGroups = groupToolsBySubcategory();

  if (categoryTools.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            لا توجد أدوات في هذه الفئة حالياً
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            نعمل على إضافة المزيد من الأدوات قريباً
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with fade-in animation */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-down">
            أدوات {getCategoryNameAr(category)} بالذكاء الاصطناعي - تعزيز إنتاجيتك بالابتكار الذكي
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto animate-slide-up opacity-0 animation-delay-100">
            اكتشف القوة التحويلية لأدوات {getCategoryNameAr(category)} بالذكاء الاصطناعي. أكثر من مجرد أدوات، فهي تعمل كمحفزات للتغيير، 
            تحول المهام الروتينية إلى فرص استثنائية للإنتاجية. سواء كنت تقوم بتحسين سير العمل أو تعزيز التعاون، 
            فإن الذكاء الاصطناعي هو شريكك الأساسي في إعادة تعريف العمل. ابدأ رحلتك نحو الكفاءة المحسنة مع الذكاء الاصطناعي بجانبك.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-fade-in opacity-0 animation-delay-200">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 transition-all duration-300 hover:scale-110">{categoryTools.length}</span>
            <span>{categoryTools.length === 1 ? 'أداة' : 'أدوات'}</span>
            <span>•</span>
            <span>{subcategoryGroups.length} {subcategoryGroups.length === 1 ? 'فئة فرعية' : 'فئات فرعية'}</span>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-fade-in opacity-0 animation-delay-300 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl animate-bounce-slow">📑</span>
            محتويات الصفحة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subcategoryGroups.map((group, index) => (
              <a
                key={index}
                href={`#${group.name.replace(/\s+/g, '-').toLowerCase()}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group transform hover:scale-105 hover:shadow-md"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium transition-colors duration-200">
                  {group.nameAr}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200">
                  {group.tools.length}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Why you can trust us */}
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-fade-in opacity-0 animation-delay-400 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl text-green-500 animate-pulse-slow">✓</span>
            لماذا يمكنك الوثوق بنا
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              نحن ملتزمون بتقديم معلومات دقيقة وموثوقة حول أدوات الذكاء الاصطناعي. يتم مراجعة جميع الأدوات المدرجة بعناية 
              من قبل فريقنا المتخصص، ونقوم بتحديث المعلومات بانتظام لضمان حصولك على أحدث البيانات. نحن لا نقبل أي مدفوعات 
              مقابل إدراج الأدوات، مما يضمن حيادية توصياتنا واستقلاليتها.
            </p>
          </div>
        </div>

        {/* Subcategory Sections */}
        {subcategoryGroups.map((group, index) => (
          <div
            key={index}
            id={group.name.replace(/\s+/g, '-').toLowerCase()}
            className="mb-16 scroll-mt-24 animate-fade-in opacity-0"
            style={{ animationDelay: `${500 + index * 100}ms` }}
          >
            {/* Subcategory Header */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    {group.nameAr}
                  </h2>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 hover:scale-110 hover:shadow-md">
                    {group.tools.length} {group.tools.length === 1 ? 'أداة' : 'أدوات'}
                  </span>
                </div>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {getSubcategoryDescription(group.name)}
              </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.tools.map((tool, toolIndex) => (
                <div
                  key={tool.id}
                  className="animate-fade-in opacity-0"
                  style={{ animationDelay: `${600 + index * 100 + toolIndex * 50}ms` }}
                >
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// وصف لكل فئة فرعية
const getSubcategoryDescription = (subcategory: string): string => {
  const descriptions: { [key: string]: string } = {
    'Video Editing': 'أدوات متقدمة لتحرير وتعديل مقاطع الفيديو باستخدام الذكاء الاصطناعي',
    'Video Generation': 'إنشاء مقاطع فيديو من النصوص والصور باستخدام تقنيات الذكاء الاصطناعي',
    'Text to Video': 'تحويل النصوص إلى مقاطع فيديو احترافية تلقائياً',
    'Content Writing': 'أدوات لكتابة المحتوى والمقالات والمدونات بجودة عالية',
    'Grammar Check': 'تدقيق لغوي وإملائي متقدم لتحسين جودة الكتابة',
    'Paraphrasing': 'إعادة صياغة النصوص بطرق مختلفة مع الحفاظ على المعنى',
    'Image Generation': 'توليد صور فنية واحترافية من الأوصاف النصية',
    'Image Editing': 'تحرير وتعديل الصور باستخدام تقنيات الذكاء الاصطناعي',
    'Graphic Design': 'أدوات تصميم جرافيكي متكاملة للمحترفين والمبتدئين',
    'Task Management': 'إدارة المهام والمشاريع بكفاءة عالية',
    'Project Management': 'أدوات شاملة لإدارة المشاريع والفرق',
    'Automation': 'أتمتة المهام الروتينية لتوفير الوقت والجهد',
    'Code Generation': 'توليد الأكواد البرمجية تلقائياً من الأوصاف',
    'Debugging': 'اكتشاف وإصلاح الأخطاء البرمجية بذكاء',
    'Documentation': 'إنشاء وثائق تقنية شاملة للمشاريع البرمجية',
    'Sales': 'أدوات لتحسين عمليات البيع وإدارة العملاء',
    'Marketing': 'حلول تسويقية ذكية لتنمية الأعمال',
    'Customer Service': 'تحسين خدمة العملاء من خلال الذكاء الاصطناعي',
    'Learning': 'أدوات تعليمية تفاعلية للطلاب والمتعلمين',
    'Teaching': 'مساعدة المعلمين في إعداد وتقديم الدروس',
    'Study Tools': 'أدوات مساعدة للدراسة والمراجعة الفعالة',
    'Literature Review': 'مراجعة وتحليل الأبحاث والأوراق العلمية',
    'Data Analysis': 'تحليل البيانات واستخراج الرؤى القيمة',
    'Academic Writing': 'مساعدة في الكتابة الأكاديمية والبحثية',
    'SEO': 'تحسين المحتوى لمحركات البحث',
    'Other': 'أدوات متنوعة ومفيدة في مجالات مختلفة'
  };

  return descriptions[subcategory] || `أدوات ${subcategory} المتقدمة بالذكاء الاصطناعي`;
};

export default CategoryToolsView;
