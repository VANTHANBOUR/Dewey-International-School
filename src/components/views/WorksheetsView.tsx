import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Download,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Printer,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Resource, GradeLevel, SubjectCategory } from '../../types';
import {
  downloadWorksheetDocument,
  downloadLessonPlanDocument,
  getResourceWorksheet,
  getResourceLessonPlan
} from '../../utils/downloadHelper';
import { GRADE_COLORS } from '../../data/mockData';

interface WorksheetsViewProps {
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onOpenUploadModal: () => void;
}

export const WorksheetsView: React.FC<WorksheetsViewProps> = ({
  resources,
  onOpenResource,
  onOpenUploadModal,
}) => {
  const [activeType, setActiveType] = useState<'all' | 'worksheets' | 'lesson_plans'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (selectedGrade !== 'all' && r.grade !== selectedGrade) return false;
      if (selectedSubject !== 'all' && r.subject !== selectedSubject) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [resources, selectedGrade, selectedSubject, searchQuery]);

  const handleDownloadWS = (res: Resource, includeKey: boolean = true) => {
    downloadWorksheetDocument(res, includeKey);
    const ws = getResourceWorksheet(res);
    setDownloadToast(`Downloaded Worksheet: ${ws.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handleDownloadLP = (res: Resource) => {
    downloadLessonPlanDocument(res);
    const lp = getResourceLessonPlan(res);
    setDownloadToast(`Downloaded Lesson Plan: ${lp.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const gradesList: (GradeLevel | 'all')[] = ['all', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjectsList = ['all', 'Science', 'Mathematics', 'English', 'Social Studies', 'Technology', 'Engineering', 'Arts', 'Physical Education'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-bold">{downloadToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <GraduationCap size={15} />
            <span>Dewey Academic Resources Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Worksheets & Lesson Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal mt-2 leading-relaxed">
            Download print-ready student practice worksheets with answer keys and complete 5E instructional lesson plans aligned to Dewey International School curriculum standards.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Sparkles size={15} />
              <span>Upload New Teaching Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worksheets, topics, or lesson plans..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Type Selector (All / Worksheets / Lesson Plans) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Teaching Items
            </button>
            <button
              onClick={() => setActiveType('worksheets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeType === 'worksheets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet size={13} />
              <span>Worksheets</span>
            </button>
            <button
              onClick={() => setActiveType('lesson_plans')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeType === 'lesson_plans' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Lesson Plans</span>
            </button>
          </div>
        </div>

        {/* Grade and Subject Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Grade:</span>
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {gradesList.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedGrade === g
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'all' ? 'All Grades' : `Gr ${g}`}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Subjects' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => {
          const ws = getResourceWorksheet(res);
          const lp = getResourceLessonPlan(res);

          return (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    Grade {res.grade} • {res.subject}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {res.format.toUpperCase()}
                  </span>
                </div>

                {/* Resource Title */}
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {res.subtitle}
                </p>

                {/* Package Features List */}
                <div className="mt-4 space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700">
                  {/* Worksheet Info */}
                  <div className="flex items-start gap-2">
                    <FileSpreadsheet size={15} className="text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Student Practice Worksheet</div>
                      <div className="text-[11px] text-slate-500">
                        {ws.questions.length} Questions • {ws.totalPoints} Pts • Answer Key Included
                      </div>
                    </div>
                  </div>

                  {/* Lesson Plan Info */}
                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
                    <Layers size={15} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Educator 5E Lesson Plan</div>
                      <div className="text-[11px] text-slate-500">
                        {lp.duration} • Standards Aligned • Differentiated
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                {/* Download Worksheet Button */}
                {(activeType === 'all' || activeType === 'worksheets') && (
                  <button
                    id={`download-ws-${res.id}`}
                    onClick={() => handleDownloadWS(res, true)}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all flex items-center justify-between border border-blue-200/60 hover:border-blue-600 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={14} className="group-hover:text-white text-blue-600" />
                      <span>Download Worksheet</span>
                    </div>
                    <Download size={14} />
                  </button>
                )}

                {/* Download Lesson Plan Button */}
                {(activeType === 'all' || activeType === 'lesson_plans') && (
                  <button
                    id={`download-lp-${res.id}`}
                    onClick={() => handleDownloadLP(res)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center justify-between border border-indigo-200/60 hover:border-indigo-600 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="group-hover:text-white text-indigo-600" />
                      <span>Download Lesson Plan</span>
                    </div>
                    <Download size={14} />
                  </button>
                )}

                {/* Open Digital Reader */}
                <button
                  onClick={() => onOpenResource(res)}
                  className="w-full py-1.5 text-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <BookOpen size={13} />
                  <span>Open Flipbook / PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
