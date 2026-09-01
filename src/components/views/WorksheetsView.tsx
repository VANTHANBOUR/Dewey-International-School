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
  GraduationCap,
  PlusCircle,
  Calendar,
  CalendarDays,
  CalendarRange,
  Timer,
  Trash2,
  Eye,
  X,
  Wand2,
  BrainCircuit
} from 'lucide-react';
import { Resource, GradeLevel, SubjectCategory, LessonPlanItem, LessonPlanScope, UserProfile } from '../../types';
import {
  downloadWorksheetDocument,
  downloadLessonPlanDocument,
  printWorksheetDocument,
  printLessonPlanDocument,
  generateWorksheetHTML,
  generateLessonPlanHTML,
  getResourceWorksheet,
  getResourceLessonPlan
} from '../../utils/downloadHelper';
import { GRADE_COLORS } from '../../data/mockData';

interface WorksheetsViewProps {
  resources: Resource[];
  customLessonPlans?: LessonPlanItem[];
  onOpenResource: (resource: Resource) => void;
  onOpenUploadModal: () => void;
  onOpenCreateLessonPlanModal?: () => void;
  onOpenCreateWorksheetModal?: () => void;
  currentUser?: UserProfile | null;
  onDeleteLessonPlan?: (planId: string) => void;
}

export const WorksheetsView: React.FC<WorksheetsViewProps> = ({
  resources,
  customLessonPlans = [],
  onOpenResource,
  onOpenUploadModal,
  onOpenCreateLessonPlanModal,
  onOpenCreateWorksheetModal,
  currentUser,
  onDeleteLessonPlan,
}) => {
  const [activeType, setActiveType] = useState<'all' | 'worksheets' | 'lesson_plans' | 'custom_plans'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Print Preview Modal State
  const [previewItem, setPreviewItem] = useState<{
    type: 'lesson_plan' | 'worksheet';
    title: string;
    html: string;
    rawItem: Resource | LessonPlanItem;
  } | null>(null);

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

  const filteredCustomPlans = useMemo(() => {
    return customLessonPlans.filter((p) => {
      if (selectedGrade !== 'all' && p.grade !== selectedGrade) return false;
      if (selectedSubject !== 'all' && p.subject !== selectedSubject) return false;
      if (selectedScope !== 'all' && p.scope !== selectedScope) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [customLessonPlans, selectedGrade, selectedSubject, selectedScope, searchQuery]);

  const handleDownloadWS = (res: Resource, includeKey: boolean = true) => {
    downloadWorksheetDocument(res, includeKey);
    const ws = getResourceWorksheet(res);
    setDownloadToast(`Downloaded Worksheet: ${ws.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handleDownloadLP = (resOrPlan: Resource | LessonPlanItem) => {
    downloadLessonPlanDocument(resOrPlan);
    const title = (resOrPlan as LessonPlanItem).title || (resOrPlan as Resource).title;
    setDownloadToast(`Downloaded Lesson Plan: ${title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const gradesList: (GradeLevel | 'all')[] = [
    'all',
    'Foundation',
    'Preparatory',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
  ];
  const subjectsList = ['all', 'Science', 'Mathematics', 'English', 'Social Studies', 'Technology', 'Engineering', 'Arts', 'Physical Education'];

  const getScopeBadge = (scope?: LessonPlanScope) => {
    switch (scope) {
      case 'yearly':
        return { label: 'Yearly Plan', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: CalendarRange };
      case 'quarter':
        return { label: 'Quarter Plan', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: CalendarDays };
      case 'monthly':
        return { label: 'Monthly Plan', bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: Calendar };
      case 'weekly':
        return { label: 'Weekly Plan', bg: 'bg-violet-100 text-violet-900 border-violet-300', icon: Clock };
      case 'daily':
      default:
        return { label: 'Daily Plan', bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: Timer };
    }
  };

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
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <GraduationCap size={15} />
            <span>Dewey Academic Curriculum & Planning Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Worksheets & Lesson Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal mt-2 leading-relaxed">
            Generate and download print-ready student practice worksheets, full 5E lesson schedules, and multi-tier curriculum plans (Yearly, Quarter, Monthly, Weekly, and Daily) aligned with Dewey International School standards.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* Create Lesson Plan Button */}
            {onOpenCreateLessonPlanModal && (
              <button
                id="btn-create-lesson-plan-header"
                onClick={onOpenCreateLessonPlanModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 border border-amber-300/30 transform hover:-translate-y-0.5"
              >
                <PlusCircle size={16} />
                <span>Create Lesson Plan</span>
                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                  Yearly • Quarter • Monthly • Weekly • Daily
                </span>
              </button>
            )}

            {/* Create Worksheet Button */}
            {onOpenCreateWorksheetModal && (
              <button
                id="btn-create-worksheet-header"
                onClick={onOpenCreateWorksheetModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 border border-purple-300/30 transform hover:-translate-y-0.5"
              >
                <PlusCircle size={16} />
                <span>Create Worksheet</span>
                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                  Print-Ready Questions & Key
                </span>
              </button>
            )}

            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 border border-blue-400/30"
            >
              <Sparkles size={15} />
              <span>Upload Teaching Material</span>
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
              placeholder="Search worksheets, scopes, subjects, or lesson plans..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Create Lesson Plan Fast Button */}
            {onOpenCreateLessonPlanModal && (
              <button
                id="btn-create-lesson-plan-filterbar"
                onClick={onOpenCreateLessonPlanModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle size={14} />
                <span>Create Lesson Plan</span>
              </button>
            )}

            {/* Create Worksheet Fast Button */}
            {onOpenCreateWorksheetModal && (
              <button
                id="btn-create-worksheet-filterbar"
                onClick={onOpenCreateWorksheetModal}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle size={14} />
                <span>Create Worksheet</span>
              </button>
            )}

            {/* Type Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Items
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
              <button
                onClick={() => setActiveType('worksheets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeType === 'worksheets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet size={13} />
                <span>Worksheets</span>
              </button>
              {customLessonPlans.length > 0 && (
                <button
                  onClick={() => setActiveType('custom_plans')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeType === 'custom_plans' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarRange size={13} />
                  <span>Created Plans ({customLessonPlans.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grade and Subject Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
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
                {g === 'all' ? 'All Grades' : g === 'Foundation' ? 'Found' : g === 'Preparatory' ? 'Prep' : `Gr ${g}`}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
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

            {(activeType === 'lesson_plans' || activeType === 'custom_plans' || activeType === 'all') && (
              <>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Scope:</span>
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Scopes</option>
                  <option value="yearly">Yearly Plan</option>
                  <option value="quarter">Quarter Plan</option>
                  <option value="monthly">Monthly Plan</option>
                  <option value="weekly">Weekly Plan</option>
                  <option value="daily">Daily Plan</option>
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Banner for Lesson Plans */}
      {(activeType === 'all' || activeType === 'lesson_plans' || activeType === 'custom_plans') && onOpenCreateLessonPlanModal && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-4 sm:p-5 border border-purple-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                  AI Lesson Planning Assistant
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold">
                  Yearly • Quarter • Monthly • Weekly • Daily
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Generate standards-aligned lesson plans with custom teacher instructions, Bloom's objectives, and differentiated strategies in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCreateLessonPlanModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Wand2 size={15} />
            <span>Open AI Plan Generator</span>
          </button>
        </div>
      )}

      {/* Custom Created Lesson Plans Section (if any or when filtered) */}
      {(activeType === 'all' || activeType === 'custom_plans' || activeType === 'lesson_plans') && filteredCustomPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Teacher-Created Lesson Plans ({filteredCustomPlans.length})
              </h2>
            </div>
            {onOpenCreateLessonPlanModal && (
              <button
                onClick={onOpenCreateLessonPlanModal}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <PlusCircle size={14} />
                <span>New Lesson Plan</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCustomPlans.map((plan) => {
              const scopeBadge = getScopeBadge(plan.scope);
              const IconComp = scopeBadge.icon;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent pointer-events-none rounded-bl-full"></div>

                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${scopeBadge.bg}`}>
                        <IconComp size={12} />
                        <span>{scopeBadge.label}</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        Grade {plan.grade} • {plan.subject}
                      </span>
                    </div>

                    {/* Plan Title & Unit */}
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {plan.unit}
                    </p>

                    {/* Meta Box */}
                    <div className="mt-4 space-y-1.5 bg-amber-50/50 rounded-xl p-3 border border-amber-100 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">Duration / Slot:</span>
                        <span className="font-bold text-slate-900">{plan.duration}</span>
                      </div>
                      {plan.teacherName && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">Instructor:</span>
                          <span className="font-semibold text-slate-800">{plan.teacherName}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">
                          {plan.scope === 'weekly' && plan.weeklyDays ? 'Weekly Schedule:' : 'Schedule Phases:'}
                        </span>
                        <span className="font-bold text-amber-800">
                          {plan.scope === 'weekly' && plan.weeklyDays
                            ? `${plan.weeklyDays.length} Days • ${plan.weeklyDays.reduce((acc, d) => acc + d.lessons.length, 0)} Lessons`
                            : `${plan.timeline.length} Steps`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setPreviewItem({
                        type: 'lesson_plan',
                        title: plan.title,
                        html: generateLessonPlanHTML(plan),
                        rawItem: plan
                      })}
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Open Print Preview"
                    >
                      <Printer size={14} className="text-amber-700" />
                      <span>Print Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownloadLP(plan)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20"
                    >
                      <Download size={14} />
                      <span>Download HTML</span>
                    </button>
                    {onDeleteLessonPlan && (currentUser?.role === 'admin' || currentUser?.role === 'steam_manager' || plan.teacherId === currentUser?.id) && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete lesson plan "${plan.title}"? This will sync immediately across the domain.`)) {
                            onDeleteLessonPlan(plan.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200"
                        title="Delete Lesson Plan (Admin / STEAM Manager)"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Institutional Resource Materials */}
      {activeType !== 'custom_plans' && (
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
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewItem({
                          type: 'worksheet',
                          title: ws.title,
                          html: generateWorksheetHTML(res, true),
                          rawItem: res
                        })}
                        className="py-2 px-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border border-blue-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        title="Print Preview Worksheet"
                      >
                        <Printer size={13} />
                        <span>Preview</span>
                      </button>
                      <button
                        id={`download-ws-${res.id}`}
                        onClick={() => handleDownloadWS(res, true)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all flex items-center justify-between border border-blue-200/60 hover:border-blue-600 shadow-2xs group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet size={14} className="group-hover:text-white text-blue-600" />
                          <span>Worksheet HTML</span>
                        </div>
                        <Download size={14} />
                      </button>
                    </div>
                  )}

                  {/* Download Lesson Plan Button */}
                  {(activeType === 'all' || activeType === 'lesson_plans') && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewItem({
                          type: 'lesson_plan',
                          title: lp.title,
                          html: generateLessonPlanHTML(res),
                          rawItem: res
                        })}
                        className="py-2 px-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 border border-indigo-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        title="Print Preview Lesson Plan"
                      >
                        <Printer size={13} />
                        <span>Preview</span>
                      </button>
                      <button
                        id={`download-lp-${res.id}`}
                        onClick={() => handleDownloadLP(res)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center justify-between border border-indigo-200/60 hover:border-indigo-600 shadow-2xs group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="group-hover:text-white text-indigo-600" />
                          <span>Lesson Plan HTML</span>
                        </div>
                        <Download size={14} />
                      </button>
                    </div>
                  )}

                  {/* Open Digital Reader */}
                  <button
                    onClick={() => onOpenResource(res)}
                    className="w-full py-1.5 text-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookOpen size={13} />
                    <span>Open Flipbook / PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print Preview Modal Overlay */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl my-auto flex flex-col h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 shrink-0 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Printer size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                      {previewItem.type === 'lesson_plan' ? 'Lesson Plan Print Preview' : 'Worksheet Print Preview'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md sm:max-w-xl">
                    {previewItem.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (previewItem.type === 'lesson_plan') {
                      printLessonPlanDocument(previewItem.rawItem);
                    } else {
                      printWorksheetDocument(previewItem.rawItem as Resource, true);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/30 cursor-pointer"
                  title="Trigger Print Dialog"
                >
                  <Printer size={15} />
                  <span>Print Document</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (previewItem.type === 'lesson_plan') {
                      handleDownloadLP(previewItem.rawItem);
                    } else {
                      handleDownloadWS(previewItem.rawItem as Resource, true);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Preview Iframe Body */}
            <div className="flex-1 bg-slate-200/90 p-3 sm:p-6 overflow-y-auto flex justify-center">
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col min-h-full">
                <iframe
                  title="Document Print Preview"
                  srcDoc={previewItem.html}
                  className="w-full flex-1 border-0 min-h-[700px]"
                />
              </div>
            </div>

            {/* Preview Footer */}
            <div className="bg-slate-900 text-slate-400 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>DIS Standard Format • A4 Print Optimized</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

