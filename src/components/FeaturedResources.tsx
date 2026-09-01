import React, { useRef, useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Check, 
  Share2, 
  Sparkles,
  Trash2,
  AlertTriangle,
  X,
  ShieldCheck
} from 'lucide-react';
import { Resource, UserProfile, isAuthorizedToDeleteResource } from '../types';
import { BookCoverIllustration } from './BookCoverIllustration';
import { downloadWorksheetDocument, downloadLessonPlanDocument } from '../utils/downloadHelper';

interface FeaturedResourcesProps {
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onToggleMyLibrary?: (id: string, e: React.MouseEvent) => void;
  onOpenShareModal?: (resource: Resource, e: React.MouseEvent) => void;
  onOpenUploadModal?: () => void;
  onOpenCreateLessonPlanModal?: () => void;
  onOpenCreateWorksheetModal?: () => void;
  onViewAll?: () => void;
  currentUser?: UserProfile | null;
  onDeleteResource?: (resource: Resource) => void;
}

export const FeaturedResources: React.FC<FeaturedResourcesProps> = ({
  resources,
  onOpenResource,
  onToggleBookmark,
  onToggleMyLibrary,
  onOpenShareModal,
  onOpenUploadModal,
  onOpenCreateLessonPlanModal,
  onOpenCreateWorksheetModal,
  onViewAll,
  currentUser,
  onDeleteResource,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);

  const canDelete = isAuthorizedToDeleteResource(currentUser);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDownloadWorksheet = (e: React.MouseEvent, res: Resource) => {
    e.stopPropagation();
    downloadWorksheetDocument(res, true);
    setDownloadToast(`Downloaded Worksheet for ${res.title}`);
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleDownloadLessonPlan = (e: React.MouseEvent, res: Resource) => {
    e.stopPropagation();
    downloadLessonPlanDocument(res);
    setDownloadToast(`Downloaded Lesson Plan for ${res.title}`);
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleTriggerDelete = (e: React.MouseEvent, res: Resource) => {
    e.stopPropagation();
    setDeletingResource(res);
  };

  const handleConfirmDelete = () => {
    if (deletingResource && onDeleteResource) {
      onDeleteResource(deletingResource);
      setDeletingResource(null);
    }
  };

  return (
    <div className="mt-8 select-none relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="absolute top-0 right-0 z-30 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
            Featured Curriculum Books
          </h2>
          {onOpenCreateLessonPlanModal && (
            <button
              id="featured-create-lesson-plan-btn"
              onClick={onOpenCreateLessonPlanModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors border border-amber-300/60"
            >
              <Plus size={13} />
              <span>Create Lesson Plan</span>
            </button>
          )}
          {onOpenCreateWorksheetModal && (
            <button
              id="featured-create-worksheet-btn"
              onClick={onOpenCreateWorksheetModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold transition-colors border border-purple-300/60"
            >
              <Plus size={13} />
              <span>Create Worksheet</span>
            </button>
          )}
          {onOpenUploadModal && (
            <button
              id="featured-add-book-btn"
              onClick={onOpenUploadModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-200/60"
            >
              <Plus size={13} />
              <span>Add Book</span>
            </button>
          )}
        </div>
        <button
          id="featured-view-all-btn"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group"
        >
          <span>View all</span>
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* Resource Cards Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Scroll Arrow */}
        <button
          id="featured-carousel-prev-btn"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 text-slate-700 hover:text-blue-600 hover:scale-110 active:scale-95 items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Scroll Arrow */}
        <button
          id="featured-carousel-next-btn"
          onClick={() => scroll('right')}
          className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 text-slate-700 hover:text-blue-600 hover:scale-110 active:scale-95 flex items-center justify-center transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>

        {/* Cards Grid / Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar scroll-smooth"
        >
          {resources.map((resource) => {
            const isFlipbook = resource.format === 'flipbook';

            return (
              <div
                key={resource.id}
                id={`featured-card-${resource.id}`}
                onClick={() => onOpenResource(resource)}
                className="w-[210px] sm:w-[230px] shrink-0 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                {/* Book Cover with Top Badge */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                  <BookCoverIllustration resource={resource} />

                  {/* Format Badge (FLIPBOOK / PDF) top-left */}
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <span
                      className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-md ${
                        isFlipbook
                          ? 'bg-[#3b66ff] text-white'
                          : 'bg-[#e11d48] text-white'
                      }`}
                    >
                      {resource.format}
                    </span>
                  </div>

                  {/* My Library status tag on cover */}
                  {resource.isMyLibrary && (
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="bg-emerald-600/90 text-white text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 backdrop-blur-xs">
                        <Check size={11} className="stroke-[3]" />
                        <span>In Library</span>
                      </span>
                    </div>
                  )}

                  {/* Hover Quick Read Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 backdrop-blur-[1.5px]">
                    <span className="px-3 py-1.5 rounded-full bg-white text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye size={13} className="text-blue-600" />
                      <span>{isFlipbook ? 'Open Flipbook' : 'Open PDF'}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body (Title & Subtitle) */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                      {resource.subtitle}
                    </p>
                  </div>

                  {/* Quick Actions: Add to My Library & Downloads */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    {/* Add to My Library Button */}
                    {onToggleMyLibrary && (
                      <button
                        id={`card-lib-btn-${resource.id}`}
                        onClick={(e) => onToggleMyLibrary(resource.id, e)}
                        className={`w-full py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                          resource.isMyLibrary
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                        }`}
                        title={resource.isMyLibrary ? 'Remove from My Library' : 'Add to My Personal Bookshelf'}
                      >
                        {resource.isMyLibrary ? (
                          <>
                            <Check size={13} className="stroke-[3]" />
                            <span>In My Library</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Add to My Library</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        id={`card-dl-ws-${resource.id}`}
                        onClick={(e) => handleDownloadWorksheet(e, resource)}
                        className="py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors border border-blue-200/50"
                        title="Download Practice Worksheet"
                      >
                        <FileSpreadsheet size={11} />
                        <span>Worksheet</span>
                      </button>
                      <button
                        id={`card-dl-lp-${resource.id}`}
                        onClick={(e) => handleDownloadLessonPlan(e, resource)}
                        className="py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors border border-indigo-200/50"
                        title="Download 5E Lesson Plan"
                      >
                        <Layers size={11} />
                        <span>Lesson Plan</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isFlipbook ? (
                          <>
                            <BookOpen size={13} className="text-blue-600" />
                            <span className="text-blue-600 text-[10.5px]">Flipbook</span>
                          </>
                        ) : (
                          <>
                            <FileText size={13} className="text-rose-500" />
                            <span className="text-rose-500 text-[10.5px]">PDF</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Delete Book action for Admin and STEAM Manager */}
                        {canDelete && (
                          <button
                            id={`featured-delete-btn-${resource.id}`}
                            onClick={(e) => handleTriggerDelete(e, resource)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Authorized: Delete Book & Resource (Admin / STEAM Manager)"
                            aria-label="Delete resource"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

                        {onOpenShareModal && (
                          <button
                            id={`share-btn-${resource.id}`}
                            onClick={(e) => onOpenShareModal(resource, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Share with class or colleagues"
                            aria-label="Share resource"
                          >
                            <Share2 size={13} />
                          </button>
                        )}
                        <button
                          id={`bookmark-btn-${resource.id}`}
                          onClick={(e) => onToggleBookmark(resource.id, e)}
                          className={`p-1 rounded-lg hover:bg-slate-100 transition-colors ${
                            resource.isBookmarked
                              ? 'text-blue-600'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={resource.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                          aria-label="Bookmark resource"
                        >
                          <Bookmark
                            size={14}
                            className={resource.isBookmarked ? 'fill-blue-600' : ''}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal for Authorized Admins / STEAM Managers */}
      {deletingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                  <ShieldCheck size={14} />
                  <span>Authorized Action • {currentUser?.role || 'Administrator'}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                  Delete Book & Resource?
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">
                {deletingResource.title}
              </p>
              <p className="text-slate-500 font-medium">
                Grade {deletingResource.grade} • {deletingResource.subject} • {deletingResource.format.toUpperCase()}
              </p>
              <p className="text-rose-600 font-semibold pt-1">
                Warning: This will permanently remove this textbook/resource from the school curriculum library and sync the deletion across all devices via Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingResource(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-resource-btn"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
