import React from 'react';
import { Bookmark, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { Resource } from '../../types';
import { BookCoverIllustration } from '../BookCoverIllustration';

interface BookmarksViewProps {
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  resources,
  onOpenResource,
  onToggleBookmark,
}) => {
  const bookmarked = resources.filter((r) => r.isBookmarked);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bookmark size={24} className="stroke-[2.2] fill-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Saved Bookmarks</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Quick access to your pinned flipbooks, chapters, and curriculum manuals.
            </p>
          </div>
        </div>
      </div>

      {bookmarked.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Bookmark size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No bookmarked resources yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Click the bookmark ribbon icon on any textbook card to pin it here for quick lesson planning.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {bookmarked.map((res) => (
            <div
              key={res.id}
              onClick={() => onOpenResource(res)}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <BookCoverIllustration resource={res} />
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-md text-white ${
                  res.format === 'flipbook' ? 'bg-[#3b66ff]' : 'bg-[#e11d48]'
                }`}>
                  {res.format}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{res.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    Open <ArrowRight size={13} />
                  </span>
                  <button
                    onClick={(e) => onToggleBookmark(res.id, e)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
