import React from 'react';
import { Link } from 'react-router-dom';
import { useTools } from '../../hooks/useTools';

interface CategoryData {
  title: string;
  titleAr: string;
  subcategories: {
    name: string;
    nameAr: string;
    count: number;
    link: string;
  }[];
  link: string;
  image: string;
  color: string;
}

const AllCategoriesView: React.FC = () => {
  const { tools } = useTools();
  
  // حساب عدد الأدوات الحقيقي لكل فئة
  const getCategoryCount = (category: string): number => {
    return tools.filter((tool: any) => {
      if (Array.isArray(tool.category)) {
        return tool.category.includes(category as any);
      }
      return tool.category === category;
    }).length;
  };
  
  const allCategories: CategoryData[] = [
    {
      title: 'AI Productivity Tools',
      titleAr: 'أدوات الإنتاجية بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Productivity.png',
      color: 'from-blue-50 to-blue-100',
      link: '/tools?category=Productivity',
      subcategories: [
        { name: 'Productivity', nameAr: 'الإنتاجية', count: getCategoryCount('Productivity'), link: '/tools?category=Productivity' },
        { name: 'Research', nameAr: 'البحث', count: getCategoryCount('Research'), link: '/tools?category=Research' },
      ]
    },
    {
      title: 'AI Video Tools',
      titleAr: 'أدوات الفيديو بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Video.png',
      color: 'from-red-50 to-red-100',
      link: '/tools?category=Video',
      subcategories: [
        { name: 'Video', nameAr: 'الفيديو', count: getCategoryCount('Video'), link: '/tools?category=Video' },
      ]
    },
    {
      title: 'AI Text Generators',
      titleAr: 'مولدات النصوص بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Text.png',
      color: 'from-orange-50 to-orange-100',
      link: '/tools?category=Writing',
      subcategories: [
        { name: 'Writing', nameAr: 'الكتابة', count: getCategoryCount('Writing'), link: '/tools?category=Writing' },
      ]
    },
    {
      title: 'AI Business Tools',
      titleAr: 'أدوات الأعمال بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Business.png',
      color: 'from-purple-50 to-purple-100',
      link: '/tools?category=Business',
      subcategories: [
        { name: 'Business', nameAr: 'الأعمال', count: getCategoryCount('Business'), link: '/tools?category=Business' },
        { name: 'Project Management', nameAr: 'إدارة المشاريع', count: getCategoryCount('Project Management'), link: '/tools?category=Project Management' },
        { name: 'Communication', nameAr: 'التواصل', count: getCategoryCount('Communication'), link: '/tools?category=Communication' }
      ]
    },
    {
      title: 'AI Image Tools',
      titleAr: 'أدوات الصور بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Image.png',
      color: 'from-green-50 to-green-100',
      link: '/tools?category=Design',
      subcategories: [
        { name: 'Design', nameAr: 'التصميم', count: getCategoryCount('Design'), link: '/tools?category=Design' },
      ]
    },
    {
      title: 'AI Art Generators',
      titleAr: 'مولدات الفن بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Art.png',
      color: 'from-pink-50 to-pink-100',
      link: '/tools?category=Creativity',
      subcategories: [
        { name: 'Creativity', nameAr: 'الإبداع', count: getCategoryCount('Creativity'), link: '/tools?category=Creativity' },
      ]
    },
    {
      title: 'AI Code Tools',
      titleAr: 'أدوات البرمجة بالذكاء الاصطناعي',
      image: '/image/Catagory-Tools/Programming.png',
      color: 'from-teal-50 to-teal-100',
      link: '/tools?category=Programming',
      subcategories: [
        { name: 'Programming', nameAr: 'البرمجة', count: getCategoryCount('Programming'), link: '/tools?category=Programming' },
      ]
    },
    {
      title: 'Education Tools',
      titleAr: 'أدوات التعليم',
      image: '/image/Catagory-Tools/Education.png',
      color: 'from-indigo-50 to-indigo-100',
      link: '/tools?category=Education',
      subcategories: [
        { name: 'Education', nameAr: 'التعليم', count: getCategoryCount('Education'), link: '/tools?category=Education' },
        { name: 'Studying', nameAr: 'الدراسة', count: getCategoryCount('Studying'), link: '/tools?category=Studying' },
        { name: 'Test Prep', nameAr: 'التحضير للاختبارات', count: getCategoryCount('Test Prep'), link: '/tools?category=Test Prep' },
      ]
    }
  ];
  
  // تصفية الفئات لعرض فقط التي تحتوي على أدوات
  const categories = allCategories
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories.filter(sub => sub.count > 0)
    }))
    .filter(cat => cat.subcategories.length > 0);

  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            جميع فئات أدوات الذكاء الاصطناعي
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            اعثر على الأدوات الأكثر شعبية والمميزة حسب الفئة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-6">
                <div className={`flex-shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-br ${category.color} p-4 flex items-center justify-center shadow-md overflow-hidden`}>
                  <img 
                    src={category.image} 
                    alt={category.titleAr}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={category.link}
                    className="group"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {category.titleAr}
                    </h3>
                  </Link>

                  <div className="space-y-2">
                    {category.subcategories.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        to={sub.link}
                        className="flex items-center justify-between text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                      >
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {sub.nameAr}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          ({sub.count})
                        </span>
                      </Link>
                    ))}
                  </div>

                  <Link
                    to={category.link}
                    className="inline-block mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    عرض جميع {category.titleAr} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesView;
