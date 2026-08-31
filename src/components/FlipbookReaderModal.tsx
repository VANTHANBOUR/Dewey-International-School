import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Download,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  List,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Share2,
  Printer,
  ZoomIn,
  ZoomOut,
  FileSpreadsheet,
  Layers,
  FileDown,
  Clock,
  Award,
  GraduationCap,
  FileText,
  ExternalLink,
  Eye,
  Trash2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Resource, UserProfile, isAuthorizedToDeleteResource } from '../types';
import { DisLogo } from './DisLogo';
import {
  downloadWorksheetDocument,
  downloadLessonPlanDocument,
  getResourceWorksheet,
  getResourceLessonPlan
} from '../utils/downloadHelper';

interface FlipbookReaderModalProps {
  resource: Resource | null;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  currentUser?: UserProfile | null;
  onDeleteResource?: (resource: Resource) => void;
}

export const FlipbookReaderModal: React.FC<FlipbookReaderModalProps> = ({
  resource,
  onClose,
  onToggleBookmark,
  currentUser,
  onDeleteResource,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showWorksheetDrawer, setShowWorksheetDrawer] = useState(false);
  const [showLessonPlanDrawer, setShowLessonPlanDrawer] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flipbook' | 'document'>('flipbook');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canDeleteAdmin = isAuthorizedToDeleteResource(currentUser);

  // Reset reader state whenever a new resource is opened
  useEffect(() => {
    if (resource) {
      setCurrentPageIndex(0);
      setSelectedAnswer(null);
      setShowAnswerFeedback(false);
      setShowToc(false);
      setIsReadingAloud(false);
      setShowNotesDrawer(false);
      setShowWorksheetDrawer(false);
      setShowLessonPlanDrawer(false);
      // If the resource has an uploaded PDF file, default to document or flipbook based on format
      setViewMode(resource.fileUrl && resource.format === 'pdf' ? 'document' : 'flipbook');
    }
  }, [resource?.id]);

  const pages = resource?.samplePages || [];
  const currentPage = pages[currentPageIndex] || {
    pageNumber: 1,
    title: resource?.title || '',
    subtitle: resource?.subtitle || '',
    content: [
      resource?.description || '',
      'This digital curriculum textbook is published for Dewey International School educators and students.'
    ]
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswerFeedback(false);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowAnswerFeedback(false);
    }
  };

  // Keyboard navigation for page turning
  useEffect(() => {
    if (!resource) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resource, currentPageIndex, pages.length]);

  // Clean up speech synthesis on close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!resource) return null;

  const worksheet = getResourceWorksheet(resource);
  const lessonPlan = getResourceLessonPlan(resource);

  const toggleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    } else {
      const textToRead = `${currentPage.title}. ${currentPage.subtitle || ''}. ${currentPage.content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsReadingAloud(false);
      utterance.onerror = () => setIsReadingAloud(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAloud(true);
    }
  };

  const handleDownloadWorksheet = () => {
    downloadWorksheetDocument(resource, includeAnswerKey);
    setDownloadToast(`Downloaded student worksheet: ${worksheet.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handleDownloadLessonPlan = () => {
    downloadLessonPlanDocument(resource);
    setDownloadToast(`Downloaded educator lesson plan: ${lessonPlan.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl bg-[#0f172a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 transition-all ${
        isFullscreen ? 'h-full max-w-full rounded-none' : 'max-h-[92vh] h-[850px]'
      }`}>
        {/* Top Control Bar */}
        <div className="bg-[#1e293b] px-4 py-3 border-b border-slate-700 flex items-center justify-between gap-3 text-slate-200 select-none">
          {/* Resource Title & Grade Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                resource.format === 'flipbook' ? 'bg-[#3b66ff] text-white' : 'bg-[#e11d48] text-white'
              }`}
            >
              {resource.format}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{resource.title}</h3>
              <p className="text-[11px] text-slate-400 truncate">Grade {resource.grade} • {resource.subject} • Page {currentPageIndex + 1} of {Math.max(pages.length, resource.totalPages)}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Toggle (Flipbook vs PDF Document) */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                id="reader-mode-flipbook-btn"
                onClick={() => setViewMode('flipbook')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'flipbook'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive Flipbook Reader"
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline">Flipbook</span>
              </button>

              <button
                id="reader-mode-document-btn"
                onClick={() => setViewMode('document')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'document'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Document & Original PDF View"
              >
                <FileText size={14} />
                <span className="hidden sm:inline">Document</span>
              </button>
            </div>

            {/* If uploaded original file exists, allow opening directly in new tab or download */}
            {resource.fileUrl && (
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-800 border border-slate-700"
                title="Open uploaded file directly in browser tab"
              >
                <ExternalLink size={15} />
                <span className="hidden md:inline">Open File</span>
              </a>
            )}

            {/* Quick Worksheet Button */}
            <button
              id="reader-worksheet-toggle-btn"
              onClick={() => {
                setShowWorksheetDrawer(!showWorksheetDrawer);
                setShowLessonPlanDrawer(false);
                setShowNotesDrawer(false);
                setShowToc(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showWorksheetDrawer
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
              title="View & Download Student Practice Worksheet"
            >
              <FileSpreadsheet size={15} className={showWorksheetDrawer ? 'text-white' : 'text-blue-400'} />
              <span className="hidden sm:inline">Worksheet</span>
            </button>

            {/* Quick Lesson Plan Button */}
            <button
              id="reader-lesson-plan-toggle-btn"
              onClick={() => {
                setShowLessonPlanDrawer(!showLessonPlanDrawer);
                setShowWorksheetDrawer(false);
                setShowNotesDrawer(false);
                setShowToc(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showLessonPlanDrawer
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
              title="View & Download Educator 5E Lesson Plan"
            >
              <Layers size={15} className={showLessonPlanDrawer ? 'text-white' : 'text-indigo-400'} />
              <span className="hidden sm:inline">Lesson Plan</span>
            </button>

            {/* Table of Contents Toggle */}
            <button
              id="reader-toc-toggle-btn"
              onClick={() => {
                setShowToc(!showToc);
                setShowWorksheetDrawer(false);
                setShowLessonPlanDrawer(false);
              }}
              className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors ${
                showToc ? 'bg-blue-600 text-white' : ''
              }`}
              title="Table of Contents"
            >
              <List size={18} />
            </button>

            {/* Read Aloud Audio */}
            <button
              id="reader-audio-btn"
              onClick={toggleReadAloud}
              className={`p-2 rounded-xl transition-colors ${
                isReadingAloud ? 'bg-amber-500 text-white animate-pulse' : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
              }`}
              title={isReadingAloud ? 'Stop Audio Read-Aloud' : 'Read Aloud Page'}
            >
              {isReadingAloud ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Zoom controls */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                id="reader-zoom-out-btn"
                onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                className="p-1.5 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[10px] font-mono font-bold px-1 text-slate-300">{zoomLevel}%</span>
              <button
                id="reader-zoom-in-btn"
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="p-1.5 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Delete button for Admin and STEAM Manager */}
            {canDeleteAdmin && (
              <button
                id="reader-delete-resource-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600/80 transition-colors"
                title="Authorized: Delete Book from Portal (Admin / STEAM Manager)"
              >
                <Trash2 size={18} />
              </button>
            )}

            {/* Bookmark button */}
            <button
              id="reader-bookmark-btn"
              onClick={() => onToggleBookmark(resource.id)}
              className={`p-2 rounded-xl transition-colors ${
                resource.isBookmarked ? 'text-blue-400 bg-blue-950/60' : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
              }`}
              title="Bookmark Resource"
            >
              <Bookmark size={18} className={resource.isBookmarked ? 'fill-blue-400' : ''} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="reader-fullscreen-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Close Button */}
            <button
              id="reader-close-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-rose-600/80 transition-colors ml-1"
              title="Close Reader (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Download Toast Notification */}
        {downloadToast && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{downloadToast}</span>
            </div>
            <button onClick={() => setDownloadToast(null)} className="text-emerald-100 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Reader Center Container */}
        <div className="flex-1 relative flex overflow-hidden bg-[#0a0f1d]">
          {/* Table of Contents Drawer */}
          {showToc && (
            <div className="w-64 bg-[#111827] border-r border-slate-800 p-4 overflow-y-auto animate-in slide-in-from-left duration-200 z-30 shrink-0">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Curriculum Chapters
              </h4>
              <div className="space-y-1.5">
                {resource.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const targetIdx = Math.min(idx, pages.length - 1);
                      setCurrentPageIndex(targetIdx);
                      setShowToc(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-medium transition-colors ${
                      currentPageIndex === idx
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{ch.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Page {ch.page}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Book / Document Stage */}
          {viewMode === 'document' ? (
            <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden relative bg-[#060a12]">
              {resource.fileUrl ? (
                <div className="flex-1 flex flex-col bg-[#1e293b] rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-rose-400" />
                      <span className="font-semibold text-white truncate">{resource.fileName || `${resource.title}.pdf`}</span>
                      <span className="text-[10px] text-slate-400">({resource.fileSize})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.fileUrl}
                        download={resource.fileName || `${resource.title}.pdf`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-600"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <ExternalLink size={13} />
                        <span>Open in New Tab</span>
                      </a>
                    </div>
                  </div>
                  <iframe
                    src={resource.fileUrl}
                    title={resource.title}
                    className="flex-1 w-full h-full bg-white border-none"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 min-h-[500px] flex flex-col justify-between">
                    <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Dewey Digital Syllabus</span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">{resource.title}</h2>
                        <p className="text-xs text-slate-500">{resource.subtitle}</p>
                      </div>
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 font-black rounded-lg text-xs">
                        Grade {resource.grade}
                      </span>
                    </div>

                    <div className="py-6 space-y-4 text-slate-700 text-sm leading-relaxed">
                      <p className="font-semibold text-slate-900">{resource.description}</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Curriculum Outline</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {resource.chapters.map((ch, idx) => (
                            <div key={idx} className="flex justify-between bg-white p-2 rounded-lg border border-slate-200">
                              <span className="font-medium text-slate-800">{ch.title}</span>
                              <span className="text-slate-400 font-mono">p. {ch.page}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Estimated Pages: {resource.totalPages}</span>
                      <button
                        onClick={() => setViewMode('flipbook')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen size={15} />
                        <span>Switch to Interactive Flipbook</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto relative">
              {/* Previous Page Floating Button */}
              <button
                id="reader-prev-page-btn"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-2xl flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95"
                aria-label="Previous page"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Next Page Floating Button */}
              <button
                id="reader-next-page-btn"
                onClick={goToNextPage}
                disabled={currentPageIndex >= pages.length - 1}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-2xl flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95"
                aria-label="Next page"
              >
                <ChevronRight size={22} />
              </button>

              {/* Book Paper Page with realistic shadow & flip styling */}
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="w-full max-w-3xl bg-[#fcfbf9] text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-amber-100/60 relative flex flex-col justify-between min-h-[540px] transition-transform duration-200 select-text"
              >
                {/* Paper header watermarked branding */}
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-3 text-xs text-amber-900/70 font-semibold">
                  <div className="flex items-center gap-2">
                    <DisLogo variant="compact" height={18} />
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-[#00823b]">Dewey International School</span>
                    <span>•</span>
                    <span>{resource.subject} Curriculum</span>
                  </div>
                  <span>Grade {resource.grade} Standard</span>
                </div>

                {/* Page Body */}
                <div className="my-6 space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                      {currentPage.title}
                    </h2>
                    {currentPage.subtitle && (
                      <h3 className="text-sm sm:text-base font-semibold text-blue-700 mt-1">
                        {currentPage.subtitle}
                      </h3>
                    )}
                  </div>

                  {/* Text Content Paragraphs */}
                  <div className="space-y-2.5 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
                    {currentPage.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {/* Key Terminology box if available */}
                  {currentPage.keyTerms && currentPage.keyTerms.length > 0 && (
                    <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl p-3.5 mt-4">
                      <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-600" />
                        <span>Key Curriculum Vocabulary</span>
                      </h5>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {currentPage.keyTerms.map((term, tIdx) => (
                          <div key={tIdx}>
                            <strong className="text-slate-900">{term.term}:</strong> {term.definition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Check for Understanding Exercise */}
                  {currentPage.exercise && (
                    <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 mt-5">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={16} className="text-blue-600" />
                        <h5 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                          Quick Concept Check
                        </h5>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
                        {currentPage.exercise.question}
                      </p>

                      <div className="space-y-2">
                        {currentPage.exercise.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswer === oIdx;
                          const isCorrect = oIdx === currentPage.exercise?.correctIndex;

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                setSelectedAnswer(oIdx);
                                setShowAnswerFeedback(true);
                              }}
                              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                                showAnswerFeedback
                                  ? isCorrect
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                                    : isSelected
                                    ? 'bg-rose-100 border-rose-500 text-rose-950 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600'
                                  : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {showAnswerFeedback && isCorrect && (
                                <CheckCircle2 size={15} className="text-emerald-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showAnswerFeedback && (
                        <div className="mt-2.5 text-xs text-blue-900 bg-white/80 p-2 rounded-lg border border-blue-200">
                          <strong>Explanation:</strong> {currentPage.exercise.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between text-xs text-slate-500">
                  <span className="italic font-serif">Dewey Academic Press © 2025</span>
                  <span className="font-bold text-slate-800 font-mono bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                    Page {currentPage.pageNumber} of {pages.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Worksheet Preview & Download Drawer */}
          {showWorksheetDrawer && (
            <div className="w-80 sm:w-96 bg-[#111827] border-l border-slate-800 p-4 flex flex-col justify-between animate-in slide-in-from-right duration-200 z-30 shrink-0 text-slate-300 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Practice Worksheet
                      </h4>
                      <p className="text-[10px] text-slate-400">Grade {worksheet.grade} • {worksheet.totalPoints} Total Pts</p>
                    </div>
                  </div>
                  <button onClick={() => setShowWorksheetDrawer(false)} className="text-slate-400 hover:text-white p-1">
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                  <div className="font-bold text-slate-200">{worksheet.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{worksheet.instructions}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Est. Time: {worksheet.estimatedMinutes} Mins</span>
                    <span>{worksheet.questions.length} Questions</span>
                  </div>
                </div>

                {/* Questions Snippet List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Worksheet Questions Preview:
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {worksheet.questions.map((q) => (
                      <div key={q.num} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2.5 text-[11.5px]">
                        <div className="font-bold text-white flex justify-between">
                          <span>Q{q.num}: {q.prompt}</span>
                          <span className="text-blue-400 ml-1 shrink-0 font-mono text-[10px]">{q.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Answer Key Toggle */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Include Teacher Answer Key</div>
                    <div className="text-[10px] text-slate-400">Appends solution guide & grading rubric</div>
                  </div>
                </label>
              </div>

              {/* Download actions */}
              <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
                <button
                  id="download-worksheet-btn"
                  onClick={handleDownloadWorksheet}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Download Worksheet (HTML/PDF)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Directly</span>
                </button>
              </div>
            </div>
          )}

          {/* Lesson Plan Preview & Download Drawer */}
          {showLessonPlanDrawer && (
            <div className="w-80 sm:w-96 bg-[#111827] border-l border-slate-800 p-4 flex flex-col justify-between animate-in slide-in-from-right duration-200 z-30 shrink-0 text-slate-300 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Educator 5E Lesson Plan
                      </h4>
                      <p className="text-[10px] text-slate-400">Grade {lessonPlan.grade} • {lessonPlan.duration}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowLessonPlanDrawer(false)} className="text-slate-400 hover:text-white p-1">
                    <X size={16} />
                  </button>
                </div>

                {/* Objectives */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Award size={14} />
                    <span>Learning Objectives</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                    {lessonPlan.learningObjectives.map((obj, oIdx) => (
                      <li key={oIdx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* 5E Timeline */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>5E Timeline Breakdown ({lessonPlan.duration})</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {lessonPlan.timeline.map((t, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2 text-[11px]">
                        <div className="font-bold text-white flex justify-between">
                          <span>{t.phase}</span>
                          <span className="text-indigo-400 font-mono">{t.durationMin}m</span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-1">{t.teacherRole}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scaffolding note */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-2.5 text-[10.5px] text-slate-400">
                  <strong className="text-slate-200">Differentiation Included:</strong> ESL scaffolds, visual vocabulary, and extension inquiry challenges.
                </div>
              </div>

              {/* Download actions */}
              <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
                <button
                  id="download-lesson-plan-btn"
                  onClick={handleDownloadLessonPlan}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Download Complete Lesson Plan</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Plan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Page Navigation Bar */}
        <div className="bg-[#1e293b] px-4 py-2.5 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300 select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPageIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-semibold transition-colors"
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPageIndex >= pages.length - 1}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold transition-colors"
            >
              Next Page
            </button>
          </div>

          <div className="text-slate-400 text-xs font-mono">
            Page {currentPageIndex + 1} of {pages.length}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Use ← / → keys to flip pages</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                  <ShieldCheck size={14} />
                  <span>Authorized Role • {currentUser?.role || 'Administrator'}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                  Delete Book & Resource?
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">
                {resource.title}
              </p>
              <p className="text-slate-500 font-medium">
                Grade {resource.grade} • {resource.subject} • {resource.totalPages} pages
              </p>
              <p className="text-rose-600 font-semibold pt-1">
                Warning: This textbook will be deleted from the Dewey database, closing the reader and removing it from all user bookshelves.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-reader-resource-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDeleteResource && resource) {
                    onDeleteResource(resource);
                  }
                  onClose();
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
