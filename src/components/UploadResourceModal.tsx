import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  FileText,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  HelpCircle,
  FileUp,
  FileCheck,
  GraduationCap,
  Users,
  Globe,
  Lock
} from 'lucide-react';
import { Resource, GradeLevel, SubjectCategory, ResourceFormat, UserProfile } from '../types';
import { GRADE_COLORS } from '../data/mockData';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: Resource, openImmediately?: boolean) => void;
  onNavigateToLibrary?: () => void;
  currentUser?: UserProfile | null;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  onNavigateToLibrary,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [grade, setGrade] = useState<GradeLevel>(currentUser?.gradeAssigned || '6');
  const [subject, setSubject] = useState<SubjectCategory>('Science');
  const [format, setFormat] = useState<ResourceFormat>('flipbook');
  const [totalPages, setTotalPages] = useState(140);
  const [description, setDescription] = useState('');
  const [publishTarget, setPublishTarget] = useState<'my_library' | 'school' | 'grade'>('my_library');
  
  // Drag & drop file states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [includeWorksheet, setIncludeWorksheet] = useState(true);
  const [includeLessonPlan, setIncludeLessonPlan] = useState(true);
  const [createdResource, setCreatedResource] = useState<Resource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setFormat('pdf');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setFormat('pdf');
      }
    }
  };

  const handleCreateResource = (shouldOpen: boolean) => {
    if (!title.trim()) return;

    const fileSizeMb = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) : (Math.random() * 12 + 6).toFixed(1);
    const fileUrl = uploadedFile ? URL.createObjectURL(uploadedFile) : undefined;

    const newResource: Resource = {
      id: `res-custom-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || `Unit 1: Grade ${grade} ${subject} Curriculum`,
      grade,
      subject,
      format,
      fileUrl,
      fileName: uploadedFile?.name,
      fileType: uploadedFile?.type || (format === 'pdf' ? 'application/pdf' : 'application/epub+zip'),
      totalPages: Number(totalPages) || 120,
      fileSize: `${fileSizeMb} MB`,
      author: currentUser?.name || 'Dewey Faculty Educator',
      uploadedByUserId: currentUser?.id,
      uploadedByUserName: currentUser?.name,
      isMyLibrary: true,
      isPersonalOnly: publishTarget === 'my_library',
      sharedWithGrades: publishTarget === 'school' ? 'all' : (publishTarget === 'grade' ? [grade] : undefined),
      publishedYear: 2025,
      rating: 5.0,
      viewsCount: 1,
      description: description.trim() || `Official ${subject} curriculum module and student learning materials tailored for Grade ${grade}.`,
      isFeatured: publishTarget === 'school',
      isBookmarked: false,
      isFavorite: false,
      coverTheme: {
        bg: format === 'flipbook' ? 'from-blue-900 via-indigo-900 to-slate-950' : 'from-rose-900 via-red-950 to-slate-950',
        text: 'text-white',
        accent: format === 'flipbook' ? '#3b82f6' : '#f43f5e',
        badgeBg: format === 'flipbook' ? 'bg-blue-600' : 'bg-rose-600',
        badgeText: 'text-white'
      },
      chapters: [
        { title: 'Chapter 1: Course Standards & Unit Overview', page: 1 },
        { title: 'Chapter 2: Guided Instruction & Core Concepts', page: 18 },
        { title: 'Chapter 3: Interactive Practice & Case Studies', page: 45 },
        { title: 'Chapter 4: Formative Review & Assessment', page: 72 }
      ],
      samplePages: [
        {
          pageNumber: 1,
          title: title.trim(),
          subtitle: subtitle.trim() || `Grade ${grade} ${subject} • Instructional Unit 1`,
          content: [
            description.trim() || `Welcome to ${title.trim()}, a specialized curriculum resource engineered for Dewey International School educators and students.`,
            `This comprehensive instructional module integrates standard-aligned pedagogy with interactive investigations in ${subject}.`,
            'Students are encouraged to annotate key definitions, collaborate on analytical problems, and complete the embedded concept evaluations.'
          ],
          keyTerms: [
            { term: 'Core Standard', definition: `The benchmark proficiency required for Grade ${grade} in ${subject}.` },
            { term: 'Inquiry Cycle', definition: 'The four-phase cycle: Engage, Investigate, Formulate, and Evaluate.' }
          ],
          exercise: {
            question: `What is the primary instructional purpose of this ${subject} unit?`,
            options: [
              'Develop deep conceptual mastery, analytical reasoning, and practical application.',
              'Passive memorization of terms without practical application.',
              'Surface-level review with no assessment criteria.',
              'None of the above.'
            ],
            correctIndex: 0,
            explanation: 'Dewey curriculum standards prioritize active analytical inquiry and real-world competency mastery.'
          }
        },
        {
          pageNumber: 2,
          title: `Key Concepts & Core Principles in ${subject}`,
          subtitle: `Chapter 2: Guided Exploration & Investigation`,
          content: [
            `Every major domain in Grade ${grade} ${subject} builds upon foundational principles established in earlier coursework.`,
            'Through structured inquiries, students formulate hypotheses, analyze evidence, and articulate findings clearly.',
            'Review the essential terminology and complete the concept check below before advancing to the practice laboratory.'
          ],
          keyTerms: [
            { term: 'Analytical Synthesis', definition: 'Combining multiple sources of data into a coherent scientific or mathematical argument.' },
            { term: 'Peer Verification', definition: 'Reviewing problem-solving procedures with classmates for rigor and clarity.' }
          ],
          exercise: {
            question: 'When presenting findings in this unit, what standard must be followed?',
            options: [
              'Cite evidence and justify mathematical or scientific reasoning step-by-step.',
              'Provide only final answers without supporting steps.',
              'Skip verification checks entirely.',
              'Rely solely on intuitive assumptions.'
            ],
            correctIndex: 0,
            explanation: 'Rigorous academic work requires transparent step-by-step justification and evidence citation.'
          }
        },
        {
          pageNumber: 3,
          title: `Applied Practice & Classroom Exploration`,
          subtitle: `Chapter 3: Collaborative Investigations & Problems`,
          content: [
            `In this section, learners apply theoretical models from ${title} to authentic case studies.`,
            'Work through each problem methodically, recording intermediate calculations, diagrams, and observations.',
            'Refer to the attached Practice Worksheet for additional tiered challenge problems and answer rubrics.'
          ],
          keyTerms: [
            { term: 'Differentiated Task', definition: 'Scaffolded exercises adapted to support and extend student learning.' },
            { term: 'Formative Check', definition: 'Targeted assessment verifying readiness for summative exams.' }
          ],
          exercise: {
            question: 'How can students best utilize the accompanying worksheet materials?',
            options: [
              'Complete exercises progressively to reinforce newly acquired skills.',
              'Skip exercises and only read the final summary.',
              'Look at answer keys before attempting the questions.',
              'Disregard instructor feedback.'
            ],
            correctIndex: 0,
            explanation: 'Active practice immediately following new concepts yields the highest retention rate.'
          }
        },
        {
          pageNumber: 4,
          title: `Unit Summary & Review Rubric`,
          subtitle: `Chapter 4: Mastery Criteria & Next Steps`,
          content: [
            `Congratulations on completing this instructional module for Grade ${grade} ${subject}.`,
            'Educators may download the complete 5E Lesson Plan for detailed pacing guides, differentiation strategies, and standards mapping.',
            'Learners who achieve 80% or higher on the formative checks are prepared for advanced independent projects.'
          ],
          keyTerms: [
            { term: 'Mastery Level', definition: 'Demonstrated competence exceeding standard grade-level expectations.' },
            { term: 'Summative Goal', definition: 'The overarching portfolio project or unit evaluation.' }
          ],
          exercise: {
            question: 'Where can teachers find full pacing guides and lesson objectives for this book?',
            options: [
              'In the attached Educator Lesson Plan drawer within this reader.',
              'In external unverified forums.',
              'No lesson plans are provided.',
              'Only in printed archives.'
            ],
            correctIndex: 0,
            explanation: 'Every curriculum book includes a full downloadable 5E Lesson Plan directly accessible in the reader toolbar.'
          }
        }
      ]
    };

    setCreatedResource(newResource);
    onAddResource(newResource, shouldOpen);
    setIsSuccess(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateResource(false);
  };

  const handleOpenNow = () => {
    if (createdResource) {
      onAddResource(createdResource, true);
      onClose();
      // Reset state
      setIsSuccess(false);
      setTitle('');
      setSubtitle('');
      setDescription('');
      setUploadedFile(null);
      setCreatedResource(null);
    }
  };

  const handleGoToLibrary = () => {
    onClose();
    if (onNavigateToLibrary) {
      onNavigateToLibrary();
    }
    setIsSuccess(false);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setUploadedFile(null);
    setCreatedResource(null);
  };

  const gradesList: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjectsList: SubjectCategory[] = [
    'Science',
    'Mathematics',
    'English',
    'Social Studies',
    'Technology',
    'Engineering',
    'Arts',
    'Physical Education'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Upload Curriculum Resource</h3>
              <p className="text-xs text-slate-400">Publish textbooks, PDF syllabus, worksheets, and lesson plans</p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-5 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in-50 duration-200">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="font-black text-2xl text-slate-900">Resource Successfully Published!</h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-1.5">
                <strong className="text-slate-900">{createdResource?.title}</strong> is now live with full digital reader support, interactive practice exercises, and curriculum materials.
              </p>
            </div>

            {/* Quick summary box */}
            {createdResource && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-md mx-auto text-left flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">Grade {createdResource.grade} • {createdResource.subject}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{createdResource.format.toUpperCase()} • {createdResource.totalPages} Pages • {createdResource.chapters.length} Chapters</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] uppercase tracking-wider">
                  Ready to Read
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <button
                id="open-uploaded-book-now-btn"
                onClick={handleOpenNow}
                className="w-full sm:w-auto flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen size={18} />
                <span>Open Book in Reader</span>
              </button>

              <button
                id="view-uploaded-in-library-btn"
                onClick={handleGoToLibrary}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-300/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Go to Library</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
            {/* Drag & Drop File Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Digital Curriculum File (PDF / Flipbook EPUB)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                    : uploadedFile
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.epub,.docx,.zip"
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3 text-emerald-700">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FileCheck size={22} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-slate-900">{uploadedFile.name}</div>
                      <div className="text-xs text-slate-500">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <FileUp size={20} />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700">
                      Drag and drop your file here, or <span className="text-blue-600 underline">browse files</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Supports PDF, EPUB, DOCX, ZIP packages up to 100MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Resource Title *
                </label>
                <input
                  id="upload-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grade 6 Environmental Biology"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unit / Subtitle
                </label>
                <input
                  id="upload-subtitle-input"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Ecosystem Energy Cycles"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Grade, Subject, Format */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Target Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Grade</label>
                <select
                  id="upload-grade-select"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {gradesList.map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject Area</label>
                <select
                  id="upload-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Portal Format</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormat('flipbook')}
                    className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      format === 'flipbook'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen size={14} />
                    <span>Flipbook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('pdf')}
                    className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      format === 'pdf'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileText size={14} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attached Pedagogical Packages (Worksheets & Lesson Plans) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-blue-600" />
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Associated Teaching Materials
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Auto-formatted for instant download</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Worksheet Toggle */}
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  includeWorksheet ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-500/20' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeWorksheet}
                    onChange={(e) => setIncludeWorksheet(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-blue-600" />
                      <span>Student Practice Worksheet</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Generates printable A4 practice worksheet with scoring rubric & answer key.
                    </p>
                  </div>
                </label>

                {/* Lesson Plan Toggle */}
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  includeLessonPlan ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-500/20' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeLessonPlan}
                    onChange={(e) => setIncludeLessonPlan(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-600" />
                      <span>Educator 5E Lesson Plan</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Generates standards-aligned instructional timeline, objectives & scaffolding.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Publishing & Sharing Scope */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Library & Sharing Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  id="target-my-library-btn"
                  onClick={() => setPublishTarget('my_library')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    publishTarget === 'my_library'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Lock size={14} className={publishTarget === 'my_library' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>My Personal Library</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Save to your private bookshelf only.
                  </p>
                </button>

                <button
                  type="button"
                  id="target-school-btn"
                  onClick={() => setPublishTarget('school')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    publishTarget === 'school'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Globe size={14} className={publishTarget === 'school' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>School Master Library</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Publish to all Dewey students & faculty (Grades K-12).
                  </p>
                </button>

                <button
                  type="button"
                  id="target-grade-btn"
                  onClick={() => setPublishTarget('grade')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    publishTarget === 'grade'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Users size={14} className={publishTarget === 'grade' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>Grade {grade} Class Only</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Share with teachers & students of Grade {grade}.
                  </p>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Curriculum Summary & Learning Objectives</label>
              <textarea
                id="upload-description-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief pedagogical summary of learning outcomes, lab requirements, or classroom standards..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium">
                Dewey Academic Standards Compliant
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-upload-resource-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Publish & Generate Materials</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
