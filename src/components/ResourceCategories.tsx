import React from 'react';
import {
  FlaskConical,
  Calculator,
  BookOpen,
  Globe,
  Monitor,
  Cog,
  Palette,
  Activity,
  ArrowRight
} from 'lucide-react';
import { CategoryInfo, SubjectCategory } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';

interface ResourceCategoriesProps {
  onSelectCategory?: (category: SubjectCategory) => void;
  onViewAll?: () => void;
}

export const ResourceCategories: React.FC<ResourceCategoriesProps> = ({
  onSelectCategory,
  onViewAll,
}) => {
  // Map icon strings to Lucide icon components
  const renderCategoryIcon = (iconName: string, color: string) => {
    const props = { size: 22, style: { color }, className: 'stroke-[2.2]' };
    switch (iconName) {
      case 'FlaskConical':
        return <FlaskConical {...props} />;
      case 'Calculator':
        return <Calculator {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Globe':
        return <Globe {...props} />;
      case 'Monitor':
        return <Monitor {...props} />;
      case 'Cog':
        return <Cog {...props} />;
      case 'Palette':
        return <Palette {...props} />;
      case 'Activity':
        return <Activity {...props} />;
      default:
        return <BookOpen {...props} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
          Resource Categories
        </h2>
        <button
          id="categories-view-all-btn"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group"
        >
          <span>View all</span>
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* 2-column or 4-column Grid matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORIES_DATA.map((cat) => {
          return (
            <button
              key={cat.id}
              id={`category-card-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory?.(cat.id)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-[#fafbfe] hover:bg-white hover:border-slate-300/80 hover:shadow-md transition-all duration-200 text-left group"
            >
              {/* Category Icon Container */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                {renderCategoryIcon(cat.iconName, cat.color)}
              </div>

              {/* Title & Count */}
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                  {cat.name}
                </h4>
                <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                  {cat.count} Resources
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
