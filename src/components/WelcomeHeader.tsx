import React from 'react';
import { BookOpen, Folder, FileText, Sparkles, LogIn, Plus, Library } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeHeaderProps {
  totalCount?: number;
  flipbookCount?: number;
  pdfCount?: number;
  myLibraryCount?: number;
  onFilterFormat?: (format: 'all' | 'flipbook' | 'pdf') => void;
  activeFormat?: 'all' | 'flipbook' | 'pdf';
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
  onOpenUploadModal?: () => void;
  onOpenCreateLessonPlanModal?: () => void;
  onViewMyLibrary?: () => void;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  totalCount = 1248,
  flipbookCount = 328,
  pdfCount = 920,
  myLibraryCount = 0,
  onFilterFormat,
  activeFormat = 'all',
  currentUser,
  onOpenAuthModal,
  onOpenUploadModal,
  onOpenCreateLessonPlanModal,
  onViewMyLibrary,
}) => {
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : null;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 select-none">
      {/* Greeting text & Quick Action */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2">
            {currentUser ? (
              <>
                <span>Welcome back, {firstName}!</span>
                <span className="inline-block animate-bounce origin-bottom text-2xl">👋</span>
              </>
            ) : (
              <>
                <span>Dewey Digital Curriculum Portal</span>
                <Sparkles size={24} className="text-amber-500" />
              </>
            )}
          </h1>

          {/* Quick Actions on Dashboard */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Create Lesson Plan Button */}
            {onOpenCreateLessonPlanModal && (
              <button
                id="header-create-lesson-plan-btn"
                onClick={onOpenCreateLessonPlanModal}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 border border-amber-300/30"
              >
                <Plus size={16} />
                <span>Create Lesson Plan</span>
              </button>
            )}

            {/* Direct "Add Book" Quick Action on Dashboard */}
            {onOpenUploadModal && (
              <button
                id="header-add-book-btn"
                onClick={onOpenUploadModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                <span>Add Book</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
          <span>Access K-12 curriculum resources, interactive flipbooks & worksheets</span>
          {currentUser && myLibraryCount > 0 && onViewMyLibrary && (
            <>
              <span>•</span>
              <button
                onClick={onViewMyLibrary}
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1 text-xs"
              >
                <Library size={13} />
                <span>{myLibraryCount} {myLibraryCount === 1 ? 'book' : 'books'} in your library</span>
              </button>
            </>
          )}
          {!currentUser && onOpenAuthModal && (
            <>
              <span>•</span>
              <button
                id="welcome-signin-link-btn"
                onClick={() => onOpenAuthModal('signin')}
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            </>
          )}
        </p>
      </div>

      {/* 3 Summary Stat Badges matching the image */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
        {/* Stat 1: Total Resources (Blue) */}
        <button
          id="stat-card-total"
          onClick={() => onFilterFormat?.('all')}
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border transition-all duration-200 text-left shadow-xs hover:shadow-md ${
            activeFormat === 'all' ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-slate-100/90'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-[#0f172a] leading-tight">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              Total Resources
            </div>
          </div>
        </button>

        {/* Stat 2: Flipbooks (Yellow/Amber) */}
        <button
          id="stat-card-flipbooks"
          onClick={() => onFilterFormat?.(activeFormat === 'flipbook' ? 'all' : 'flipbook')}
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border transition-all duration-200 text-left shadow-xs hover:shadow-md ${
            activeFormat === 'flipbook' ? 'border-amber-300 ring-2 ring-amber-500/20' : 'border-slate-100/90'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Folder size={20} className="stroke-[2.2] fill-amber-500/20" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-[#0f172a] leading-tight">
              {flipbookCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              Flipbooks
            </div>
          </div>
        </button>

        {/* Stat 3: PDF Documents (Red/Rose) */}
        <button
          id="stat-card-pdfs"
          onClick={() => onFilterFormat?.(activeFormat === 'pdf' ? 'all' : 'pdf')}
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border transition-all duration-200 text-left shadow-xs hover:shadow-md ${
            activeFormat === 'pdf' ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-100/90'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <FileText size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-[#0f172a] leading-tight">
              {pdfCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              PDF Documents
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
