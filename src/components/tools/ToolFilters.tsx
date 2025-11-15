import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FilterOptions, ToolCategory, ToolPricing } from '../../types';
import { Filter, Search, X } from 'lucide-react';

// Categories and pricing options
const categories: ToolCategory[] = [
  '3D', 'Automation', 'Business', 'Collaboration', 'Communication', 'Creativity',
  'Data Science', 'Design', 'Education', 'Electronics', 'Freelancing', 'Gamification',
  'Games', 'Language Learning', 'Library', 'Lifestyle', 'Math', 'Memory',
  'Online Learning', 'Other', 'Productivity', 'Programming', 'Project Management',
  'Reading', 'Research', 'Science', 'Studying', 'Teaching', 'Technology',
  'Test Prep', 'Video', 'Writing'
];

const pricingOptions: ToolPricing[] = ['Free', 'Freemium', 'Paid', 'Subscription'];

interface ToolFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  showMobileFilters: boolean;
  setShowMobileFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({ 
  filters, 
  setFilters, 
  showMobileFilters, 
  setShowMobileFilters 
}) => {
  const { t } = useTranslation();
  
  const handleCategoryChange = (category: ToolCategory | 'All') => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handlePricingChange = (pricing: ToolPricing | 'All') => {
    setFilters(prev => ({ ...prev, pricing }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      pricing: 'All',
      searchQuery: ''
    });
  };

  const categoryCount = filters.category !== 'All' ? 1 : 0;
  const pricingCount = filters.pricing !== 'All' ? 1 : 0;
  const searchCount = filters.searchQuery ? 1 : 0;
  const totalFilters = categoryCount + pricingCount + searchCount;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      setShowMobileFilters(false);
    }
  };

  return (
    <div className="relative">
      {/* Mobile filter dialog */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-40 z-40 lg:hidden" 
              aria-hidden="true"
              onClick={() => setShowMobileFilters(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="fixed left-0 top-0 ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-800 py-4 pb-12 shadow-xl z-40 lg:hidden"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">تصفية</h2>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-gray-800 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile filters */}
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">التصنيف</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="category-all-mobile"
                        name="category-mobile"
                        type="radio"
                        checked={filters.category === 'All'}
                        onChange={() => handleCategoryChange('All')}
                        className="h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700"
                      />
                      <label
                        htmlFor="category-all-mobile"
                        className="mr-3 min-w-0 flex-1 text-gray-500 dark:text-gray-400"
                      >
                        جميع التصنيفات
                      </label>
                    </div>
                    
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`category-${category}-mobile`}
                          name="category-mobile"
                          type="radio"
                          checked={filters.category === category}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700"
                        />
                        <label
                          htmlFor={`category-${category}-mobile`}
                          className="mr-3 min-w-0 flex-1 text-gray-500 dark:text-gray-400"
                        >
                          {t(`categories.${category}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">السعر</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="pricing-all-mobile"
                        name="pricing-mobile"
                        type="radio"
                        checked={filters.pricing === 'All'}
                        onChange={() => handlePricingChange('All')}
                        className="h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700"
                      />
                      <label
                        htmlFor="pricing-all-mobile"
                        className="mr-3 min-w-0 flex-1 text-gray-500 dark:text-gray-400"
                      >
                        جميع الأسعار
                      </label>
                    </div>
                    
                    {pricingOptions.map((option) => (
                      <div key={option} className="flex items-center">
                        <input
                          id={`pricing-${option}-mobile`}
                          name="pricing-mobile"
                          type="radio"
                          checked={filters.pricing === option}
                          onChange={() => handlePricingChange(option)}
                          className="h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700"
                        />
                        <label
                          htmlFor={`pricing-${option}-mobile`}
                          className="mr-3 min-w-0 flex-1 text-gray-500 dark:text-gray-400"
                        >
                          {option === 'Free' ? 'مجاني' :
                           option === 'Freemium' ? 'مجاني مع مميزات مدفوعة' :
                           option === 'Paid' ? 'مدفوع' :
                           'اشتراك'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800">
        <div>
          {/* Mobile filter button */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 pt-4 lg:hidden">
            <div className="relative flex w-full">
              <input
                type="text"
                placeholder="البحث عن الأدوات..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-md border-0 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            
            <button
              type="button"
              className="mr-4 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="ml-1 h-5 w-5" />
              تصفية
              {totalFilters > 0 && (
                <span className="mr-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs">
                  {totalFilters}
                </span>
              )}
            </button>
          </div>

          {/* Desktop filters */}
          <div className="hidden lg:block">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between py-4">
                <div className="relative w-96">
                  <input
                    type="text"
                    placeholder="البحث عن الأدوات..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    className="w-full rounded-md border-0 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                
                <div className="flex items-center space-x-6 mr-4">
                  <div>
                    <label htmlFor="category-desktop" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                      التصنيف:
                    </label>
                    <select
                      id="category-desktop"
                      value={filters.category}
                      onChange={(e) => handleCategoryChange(e.target.value as ToolCategory | 'All')}
                      className="rounded-md border-0 py-1.5 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
                    >
                      <option value="All">جميع التصنيفات</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {t(`categories.${category}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="pricing-desktop" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                      السعر:
                    </label>
                    <select
                      id="pricing-desktop"
                      value={filters.pricing}
                      onChange={(e) => handlePricingChange(e.target.value as ToolPricing | 'All')}
                      className="rounded-md border-0 py-1.5 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
                    >
                      <option value="All">جميع الأسعار</option>
                      {pricingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === 'Free' ? 'مجاني' :
                           option === 'Freemium' ? 'مجاني مع مميزات مدفوعة' :
                           option === 'Paid' ? 'مدفوع' :
                           'اشتراك'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {totalFilters > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      إعادة ضبط التصفية
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;