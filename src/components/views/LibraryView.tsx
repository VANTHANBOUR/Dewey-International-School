import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Filter,
  Bookmark,
  Plus,
  Download,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Share2,
  Check,
  Library,
  User,
  Sparkles,
  Globe,
  Trash2,
  BookPlus,
  X,
  ArrowRight,
  GraduationCap,
  FolderHeart,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Resource, GradeLevel, ResourceFormat, SubjectCategory, UserProfile, ActiveNavTab, isAuthorizedToDeleteResource } from '../../types';
import { BookCoverIllustration } from '../BookCoverIllustration';
import { downloadWorksheetDocument, downloadLessonPlanDocument } from '../../utils/downloadHelper';

interface LibraryViewProps {
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onToggleMyLibrary?: (id: string, e: React.MouseEvent) => void;
  onOpenShareModal?: (resource: Resource, e: React.MouseEvent) => void;
  onOpenUploadModal: () => void;
  currentUser?: UserProfile | null;
  onNavigateToTab?: (tab: ActiveNavTab) => void;
  onDeleteResource?: (resource: Resource) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  resources,
  onOpenResource,
  onToggleBookmark,
  onToggleMyLibrary,
  onOpenShareModal,
  onOpenUploadModal,
  currentUser,
  onNavigateToTab,
  onDeleteResource,
}) => {
  const [filterFormat, setFilterFormat] = useState<'all' | ResourceFormat | 'my_uploads'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  
  const canDeleteAdmin = isAuthorizedToDeleteResource(currentUser);

  // Catalog Explorer Modal to discover & add books to My Library
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogGrade, setCatalogGrade] = useState<string>('all');

  // Strict User Library Scope: Show ONLY books, documents, and PDF books added to My Library (or uploaded by the user)
  const myLibraryResources = useMemo(() => {
    return resources.filter((r) => r.isMyLibrary || (currentUser && r.uploadedByUserId === currentUser.id));
  }, [resources, currentUser]);

  // Filtered within user's personal library
  const filteredLibrary = useMemo(() => {
    return myLibraryResources.filter((r) => {
      // Format / Source filter
      if (filterFormat === 'my_uploads') {
        if (r.uploadedByUserId !== currentUser?.id) return false;
      } else if (filterFormat !== 'all') {
        if (r.format !== filterFormat) return false;
      }

      // Subject filter
      if (filterSubject !== 'all' && r.subject !== filterSubject) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [myLibraryResources, filterFormat, filterSubject, searchQuery, currentUser]);

  // Counts for library tabs
  const totalInLibrary = myLibraryResources.length;
  const pdfCountInLibrary = myLibraryResources.filter(r => r.format === 'pdf').length;
  const flipbookCountInLibrary = myLibraryResources.filter(r => r.format === 'flipbook').length;
  const uploadsCountInLibrary = myLibraryResources.filter(r => r.uploadedByUserId === currentUser?.id).length;

  // Available subjects in the user's library
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    myLibraryResources.forEach(r => {
      if (r.subject) set.add(r.subject);
    });
    return Array.from(set).sort();
  }, [myLibraryResources]);

  // Catalog items filtered for the Catalog modal
  const catalogFiltered = useMemo(() => {
    return resources.filter((r) => {
      if (catalogGrade !== 'all' && r.grade !== catalogGrade) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [resources, catalogGrade, catalogSearch]);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Header with Title & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-2">
            <FolderHeart size={14} className="text-blue-600" />
            <span>Personal Reading Collection</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <BookOpen className="text-blue-600" size={26} />
            <span>My Library</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
              {totalInLibrary} {totalInLibrary === 1 ? 'Book' : 'Books & Docs'} Saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Displaying your saved textbooks, documents, and PDF curriculum materials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Browse Catalog to Add Books */}
          <button
            id="library-browse-catalog-btn"
            onClick={() => setIsCatalogModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98"
          >
            <BookPlus size={16} />
            <span>Add Books from Catalog</span>
          </button>

          {/* Upload Custom Book */}
          <button
            id="library-add-resource-btn"
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors border border-slate-200"
          >
            <Plus size={16} />
            <span>Upload Document / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input within My Library */}
        <div className="relative flex-1 max-w-md">
          <input
            id="search-my-library-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within your saved library..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              id="library-filter-all-btn"
              onClick={() => setFilterFormat('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterFormat === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalInLibrary})
            </button>
            <button
              id="library-filter-pdf-btn"
              onClick={() => setFilterFormat('pdf')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterFormat === 'pdf'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF Books ({pdfCountInLibrary})
            </button>
            <button
              id="library-filter-flipbook-btn"
              onClick={() => setFilterFormat('flipbook')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterFormat === 'flipbook'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flipbooks ({flipbookCountInLibrary})
            </button>
            {uploadsCountInLibrary > 0 && (
              <button
                id="library-filter-uploads-btn"
                onClick={() => setFilterFormat('my_uploads')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterFormat === 'my_uploads'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Uploads ({uploadsCountInLibrary})
              </button>
            )}
          </div>

          {/* Subject Filter Dropdown if available */}
          {availableSubjects.length > 0 && (
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredLibrary.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Library size={32} />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">
              {totalInLibrary === 0
                ? 'Your Personal Library is Empty'
                : 'No matching books found in your library'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {totalInLibrary === 0
                ? 'You have not added any textbooks, documents, or PDF books to your personal library yet. Explore the school curriculum catalog to add books to your shelf.'
                : 'Try adjusting your search keywords or switching format filters.'}
            </p>
          </div>

          {totalInLibrary === 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="empty-browse-catalog-btn"
                onClick={() => setIsCatalogModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
              >
                <BookPlus size={16} />
                <span>Browse School Catalog & Add Books</span>
              </button>

              {onNavigateToTab && (
                <button
                  id="empty-goto-dashboard-btn"
                  onClick={() => onNavigateToTab('dashboard')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors border border-slate-200 flex items-center gap-2"
                >
                  <Globe size={16} />
                  <span>Go to Home Dashboard</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterFormat('all');
                setFilterSubject('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Grid of Books & PDF Documents in My Library */}
      {filteredLibrary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredLibrary.map((res) => (
            <div
              key={res.id}
              onClick={() => onOpenResource(res)}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <BookCoverIllustration resource={res} />
                
                {/* Format Badge */}
                <span
                  className={`absolute top-2.5 left-2.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-md text-white ${
                    res.format === 'flipbook' ? 'bg-[#3b66ff]' : 'bg-[#e11d48]'
                  }`}
                >
                  {res.format}
                </span>

                {/* In Library status tag */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className="bg-emerald-600 text-white text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                    <Check size={11} className="stroke-[3]" />
                    <span>In Library</span>
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{res.subtitle}</p>
                  <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                    <span>Grade {res.grade} • {res.subject}</span>
                    <span>{res.totalPages} Pages</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5">
                    {/* Remove from Library Toggle */}
                    {onToggleMyLibrary && (
                      <button
                        onClick={(e) => onToggleMyLibrary(res.id, e)}
                        className="flex-1 py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 group/btn"
                        title="Remove from My Library"
                      >
                        <Check size={13} className="stroke-[3] group-hover/btn:hidden" />
                        <Trash2 size={13} className="hidden group-hover/btn:inline" />
                        <span className="group-hover/btn:hidden">In My Library</span>
                        <span className="hidden group-hover/btn:inline">Remove from Library</span>
                      </button>
                    )}

                    {/* Permanent Delete Button for Admin & STEAM Manager (or uploader) */}
                    {(canDeleteAdmin || (currentUser && res.uploadedByUserId === currentUser.id)) && (
                      <button
                        id={`lib-delete-btn-${res.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingResource(res);
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors"
                        title="Authorized: Delete Book & Resource from Portal"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={(e) => handleDownloadWorksheet(e, res)}
                      className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors border border-blue-200/60"
                      title="Download Practice Worksheet"
                    >
                      <FileSpreadsheet size={12} />
                      <span>Worksheet</span>
                    </button>
                    <button
                      onClick={(e) => handleDownloadLessonPlan(e, res)}
                      className="py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors border border-indigo-200/60"
                      title="Download 5E Lesson Plan"
                    >
                      <Layers size={12} />
                      <span>Lesson Plan</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-blue-600 group-hover:underline">Open Textbook</span>
                    
                    <div className="flex items-center gap-1">
                      {onOpenShareModal && (
                        <button
                          onClick={(e) => onOpenShareModal(res, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Share with class or colleagues"
                          aria-label="Share resource"
                        >
                          <Share2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => onToggleBookmark(res.id, e)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 ${
                          res.isBookmarked ? 'text-blue-600' : 'text-slate-400'
                        }`}
                        title={res.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                      >
                        <Bookmark size={15} className={res.isBookmarked ? 'fill-blue-600' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog Explorer Modal (Browse & Add to My Library) */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close catalog picker"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-xs font-bold mb-1.5">
                <Globe size={12} />
                <span>Dewey Master Curriculum Catalog</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Add Books & Documents to My Library
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                Browse Found–12 textbooks, laboratory manuals, and worksheets. Click "Add to Library" to save them to your personal bookshelf.
              </p>
            </div>

            {/* Modal Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search catalog by title, subject, grade..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Grade Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                <span className="text-slate-400 font-bold text-[11px] whitespace-nowrap">Grade:</span>
                <button
                  onClick={() => setCatalogGrade('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                    catalogGrade === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                {(['Foundation', 'Preparatory', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as GradeLevel[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setCatalogGrade(g)}
                    className={`px-2 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                      catalogGrade === g ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'Foundation' ? 'Found' : g === 'Preparatory' ? 'Prep' : `G${g}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Catalog List */}
            <div className="p-4 sm:p-6 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-3">
              {catalogFiltered.length > 0 ? (
                catalogFiltered.map((res) => {
                  const isInLibrary = res.isMyLibrary;

                  return (
                    <div
                      key={res.id}
                      className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative shadow-xs">
                          <BookCoverIllustration resource={res} />
                          <span
                            className={`absolute bottom-0 inset-x-0 text-[8px] font-black uppercase text-center text-white py-0.5 ${
                              res.format === 'flipbook' ? 'bg-blue-600' : 'bg-rose-600'
                            }`}
                          >
                            {res.format}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                            {res.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                            {res.subtitle}
                          </p>
                          <div className="text-[11px] text-slate-400 font-semibold mt-1">
                            Grade {res.grade} • {res.subject} • {res.totalPages} pages
                          </div>
                        </div>
                      </div>

                      {/* Add/Remove Action & Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {onToggleMyLibrary && (
                          <button
                            id={`catalog-toggle-btn-${res.id}`}
                            onClick={(e) => onToggleMyLibrary(res.id, e)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                              isInLibrary
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                            }`}
                          >
                            {isInLibrary ? (
                              <>
                                <Check size={14} className="stroke-[3]" />
                                <span>Saved in Library</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                <span>Add to My Library</span>
                              </>
                            )}
                          </button>
                        )}

                        {(canDeleteAdmin || (currentUser && res.uploadedByUserId === currentUser.id)) && (
                          <button
                            id={`catalog-delete-btn-${res.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingResource(res);
                            }}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors"
                            title="Authorized: Delete Book from Portal (Admin / STEAM Manager)"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-600">No matching books found in catalog.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                {myLibraryResources.length} books currently in your personal library
              </span>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Authorized Admins / STEAM Managers */}
      {deletingResource && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
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
                Warning: This will permanently delete this textbook from the Dewey curriculum repository and Firestore database.
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
                id="confirm-delete-library-resource-btn"
                onClick={() => {
                  if (onDeleteResource && deletingResource) {
                    onDeleteResource(deletingResource);
                    setDeletingResource(null);
                  }
                }}
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
