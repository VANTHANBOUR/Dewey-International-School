import React from 'react';
import { BookOpen, Folder, FileText, Sparkles, LogIn, Plus, Library, BrainCircuit } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeHeaderProps {
  totalCount?: number;
  flipbookCount?: number;
  pdfCount?: number;
  otherCount?: number;
  myLibraryCount?: number;
  onFilterFormat?: (format: 'all' | 'flipbook' | 'pdf' | 'other') => void;
  activeFormat?: 'all' | 'flipbook' | 'pdf' | 'other';
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
  onOpenUploadModal?: () => void;
  onOpenCreateLessonPlanModal?: () => void;
  onOpenCreateWorksheetModal?: () => void;
  onOpenCreateQuizModal?: () => void;
  onViewMyLibrary?: () => void;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  totalCount = 1248,
  flipbookCount = 328,
  pdfCount = 920,
  otherCount = 47,
  myLibraryCount = 0,
  onFilterFormat,
  activeFormat = 'all',
  currentUser,
  onOpenAuthModal,
  onOpenUploadModal,
  onOpenCreateLessonPlanModal,
  onOpenCreateWorksheetModal,
  onOpenCreateQuizModal,
  onViewMyLibrary,
}) => {
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : null;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 select-none">
      {/* Greeting text & Quick Action */}
      <div className="space-y-4">
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

        {/* Quick Actions Panel */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Add Book Button (Now positioned explicitly above Lesson Plan, Worksheet, and Quiz) */}
          {onOpenUploadModal && (
            <div className="flex items-center justify-start">
              <button
                id="header-add-book-btn"
                onClick={onOpenUploadModal}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                <span>Add Book</span>
              </button>
            </div>
          )}

          {/* Row 2: Secondary Generator Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start">
            {/* Create Lesson Plan Button */}
            {onOpenCreateLessonPlanModal && (
              <button
                id="header-create-lesson-plan-btn"
                onClick={onOpenCreateLessonPlanModal}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 border border-amber-300/30"
              >
                <Plus size={16} />
                <span>Create Lesson Plan</span>
              </button>
            )}

            {/* Create Worksheet Button */}
            {onOpenCreateWorksheetModal && (
              <button
                id="header-create-worksheet-btn"
                onClick={onOpenCreateWorksheetModal}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 border border-purple-300/30"
              >
                <Plus size={16} />
                <span>Create Worksheet</span>
              </button>
            )}

            {/* Generate Quiz Button */}
            {onOpenCreateQuizModal && (
              <button
                id="header-generate-quiz-btn"
                onClick={onOpenCreateQuizModal}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 border border-indigo-300/30"
              >
                <Plus size={16} />
                <span>Generate Quiz</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
          <span>Access Found–12 curriculum resources, interactive flipbooks & worksheets</span>
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

      {/* 4 Summary Stat Badges matching the image and user requirement */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0 w-full lg:w-auto">
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

        {/* Stat 2: Flipbooks (Indigo) */}
        <button
          id="stat-card-flipbooks"
          onClick={() => onFilterFormat?.(activeFormat === 'flipbook' ? 'all' : 'flipbook')}
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border transition-all duration-200 text-left shadow-xs hover:shadow-md ${
            activeFormat === 'flipbook' ? 'border-indigo-300 ring-2 ring-indigo-500/20' : 'border-slate-100/90'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Folder size={20} className="stroke-[2.2] fill-indigo-500/20" />
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

        {/* Stat 4: Other Quizzes & Worksheets (Purple/Violet) */}
        <button
          id="stat-card-other"
          onClick={() => onFilterFormat?.(activeFormat === 'other' ? 'all' : 'other')}
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border transition-all duration-200 text-left shadow-xs hover:shadow-md ${
            activeFormat === 'other' ? 'border-purple-300 ring-2 ring-purple-500/20' : 'border-slate-100/90'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BrainCircuit size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-[#0f172a] leading-tight">
              {otherCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              Quizzes & Exams
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
