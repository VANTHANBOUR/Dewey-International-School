import React from 'react';
import { ChevronRight, FileText, BookOpen } from 'lucide-react';
import { Resource } from '../types';
import { BookCoverIllustration } from './BookCoverIllustration';

interface RecentlyViewedProps {
  recentResources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onViewAll?: () => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  recentResources,
  onOpenResource,
  onViewAll,
}) => {
  const validItems = (recentResources || []).filter((item): item is Resource => !!item && !!item.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs select-none flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
          Recently Viewed
        </h2>
        <button
          id="recently-viewed-view-all-btn"
          onClick={onViewAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          View all
        </button>
      </div>

      {/* List of Recent Items matching the screenshot */}
      <div className="space-y-3.5">
        {validItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No recently viewed resources yet
          </div>
        ) : (
          validItems.map((item) => {
            const isFlipbook = item.format === 'flipbook';

            return (
              <div
                key={item.id}
                id={`recent-item-${item.id}`}
                onClick={() => onOpenResource(item)}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-slate-100"
              >
                {/* Thumbnail + Text info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Micro Thumbnail Cover */}
                  <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 shadow-xs border border-slate-200/60 relative">
                    <BookCoverIllustration resource={item} className="p-1 scale-90" />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Format Badge & Time / Chevron */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      isFlipbook
                        ? 'bg-blue-600 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.format}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                    <span>{item.lastReadTimeAgo || 'Recent'}</span>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
