import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tool } from '../../types/tool';
import { Star, ExternalLink, Award, Bookmark } from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { updateToolSave } from '../../services/tool-actions.service';
import { useAuth } from '../../context/AuthContext';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(tool.savedBy?.length || 0);

  useEffect(() => {
    if (user && tool.savedBy) {
      setIsSaved(tool.savedBy.includes(user.uid));
    }
  }, [user, tool.savedBy]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('يجب تسجيل الدخول لحفظ الأداة');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await updateToolSave(tool.id, user.uid);
      setIsSaved(result.isSaved);
      setSavedCount(prev => result.isSaved ? prev + 1 : prev - 1);
    } catch (error: any) {
      console.error('Error saving tool:', error);
      alert(error.message || 'فشل حفظ الأداة');
    } finally {
      setIsLoading(false);
    }
  };
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${ 
          i < Math.floor(rating) 
            ? 'text-orange-400 fill-orange-400' 
            : 'text-gray-300 dark:text-gray-600'
        }`} 
      />
    ));
  };

  const pricingInfo = {
    Free: { label: 'مجاني' },
    Freemium: { label: 'Freemium' },
    Paid: { label: 'مدفوع' },
    Subscription: { label: 'اشتراك' },
  };

  const currentPricing = pricingInfo[tool.pricing] || pricingInfo.Freemium;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-indigo-300 dark:hover:border-indigo-600">
      {/* Featured Badge */}
      {tool.isFeatured && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg z-10">
          <Award className="w-4 h-4" />
        </div>
      )}

      {/* Tool Image/Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          <ToolImage 
            imageUrl={tool.imageUrl}
            name={tool.name}
            size="md"
            className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {tool.name}
            </h3>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className={`flex-shrink-0 transition-all duration-300 hover:scale-125 ${
                isSaved 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isSaved ? 'إلغاء حفظ الأداة' : 'حفظ الأداة'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(tool.rating)}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({tool.reviewCount || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Pricing and Stats */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          {currentPricing.label}
        </span>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <span className="text-lg font-semibold">{savedCount}</span>
          <Bookmark className="w-4 h-4" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {tool.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tool.tags?.slice(0, 3).map((tag: string, index: number) => (
          <span
            key={index}
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {tool.isFeatured && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Award className="w-4 h-4" />
            <span>Editor's Pick</span>
          </div>
        )}
        
        <Link
          to={`/tools/${tool.id}`}
          className="mr-auto inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>زيارة</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ToolCard;