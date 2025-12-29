import React from 'react';
import { Tool } from '../../types/index';
import ToolCard from './ToolCard';

interface ToolsGridProps {
  tools: Tool[];
  title?: string;
}

const ToolsGrid: React.FC<ToolsGridProps> = ({ tools, title }) => {    if (tools.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">لا توجد أدوات متاحة</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">جرّب تعديل الفلاتر أو إعادة كتابة عبارة البحث.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};

export default ToolsGrid;