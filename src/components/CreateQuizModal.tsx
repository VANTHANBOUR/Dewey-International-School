import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Printer,
  Save,
  CheckCircle2,
  Clock,
  HelpCircle,
  Eye,
  Edit3,
  Wand2,
  GraduationCap,
  Loader2,
  Paperclip,
  UploadCloud,
  FileText,
  File,
  Image as ImageIcon,
  FileCode,
  BrainCircuit,
  Trophy,
  AlertCircle,
  Bot
} from 'lucide-react';

import { GeminiChatbotCompanion } from './GeminiChatbotCompanion';
import {
  GradeLevel,
  SubjectCategory,
  Resource,
  WorksheetItem,
  WorksheetQuestion,
  UserProfile
} from '../types';
import {
  downloadWorksheetDocument,
  printWorksheetDocument,
  generateWorksheetHTML
} from '../utils/downloadHelper';

export interface AttachedMaterialFile {
  id: string;
  name: string;
  size: string;
  type: string;
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
}

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: Resource, openImmediately?: boolean) => void;
  currentUser?: UserProfile | null;
  initialGrade?: GradeLevel;
  initialSubject?: SubjectCategory;
}

const GRADES_LIST: GradeLevel[] = [
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

const SUBJECTS_LIST: SubjectCategory[] = [
  'Science',
  'Mathematics',
  'English',
  'Social Studies',
  'Technology',
  'Engineering',
  'Arts',
  'Physical Education'
];

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  currentUser,
  initialGrade = '9',
  initialSubject = 'Science'
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [subject, setSubject] = useState<SubjectCategory>(initialSubject);
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);
  const [difficulty, setDifficulty] = useState<'Standard' | 'Intermediate' | 'Advanced' | 'Olympiad'>('Standard');
  const [instructions, setInstructions] = useState(
    'Please read each question with absolute focus. Circle or write your answers with high precision. Ensure all steps of calculations are detailed for full credit.'
  );
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  // AI Prompt & Question Generator Controls State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [materialsText, setMaterialsText] = useState('');
  const [attachedMaterials, setAttachedMaterials] = useState<AttachedMaterialFile[]>([]);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiQuestionType, setAiQuestionType] = useState<'mixed' | 'short_answer' | 'multiple_choice' | 'fill_in_blank'>('multiple_choice');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual list of generated quiz questions
  const [questions, setQuestions] = useState<WorksheetQuestion[]>([
    {
      num: 1,
      prompt: 'Which of the following describes the core objective of a curriculum quiz?',
      type: 'multiple_choice',
      points: 5,
      hint: 'Think about formative assessments and diagnostic evaluation.',
      correctAnswer: 'B. Continuous checking for conceptual understanding and mastery guidance',
      options: [
        'A. Storing resources permanently without review',
        'B. Continuous checking for conceptual understanding and mastery guidance',
        'C. Skipping essential steps in textbook lessons',
        'D. Restricting student research opportunities'
      ]
    }
  ]);

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFileList(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFileList = (fileList: File[]) => {
    setIsUploadingMaterial(true);
    const newItems: AttachedMaterialFile[] = [];
    let completed = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();
      const isText =
        file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.html');

      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      if (isText) {
        reader.onload = (evt) => {
          newItems.push({
            id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: sizeStr,
            type: file.type || 'text/plain',
            textContent: evt.target?.result as string,
            mimeType: file.type || 'text/plain'
          });
          completed++;
          if (completed === fileList.length) {
            setAttachedMaterials(prev => [...prev, ...newItems]);
            setIsUploadingMaterial(false);
          }
        };
        reader.readAsText(file);
      } else {
        reader.onload = () => {
          const resultStr = reader.result as string;
          newItems.push({
            id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: sizeStr,
            type: file.type || 'application/octet-stream',
            base64Data: resultStr,
            mimeType: file.type || 'application/octet-stream'
          });
          completed++;
          if (completed === fileList.length) {
            setAttachedMaterials(prev => [...prev, ...newItems]);
            setIsUploadingMaterial(false);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveMaterial = (id: string) => {
    setAttachedMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    const newQ: WorksheetQuestion = {
      num: nextNum,
      prompt: `New Quiz Question Prompt for Question ${nextNum}...`,
      type: 'multiple_choice',
      points: 5,
      hint: '',
      correctAnswer: 'A. Option A',
      options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions
      .filter((_, idx) => idx !== index)
      .map((q, idx) => ({ ...q, num: idx + 1 }));
    setQuestions(updated);
  };

  const handleUpdateQuestion = (index: number, updatedFields: Partial<WorksheetQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updatedFields };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const currentOpts = [...(updated[qIndex].options || [])];
    currentOpts[optIndex] = value;
    updated[qIndex].options = currentOpts;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    const currentOpts = [...(updated[qIndex].options || [])];
    const letter = String.fromCharCode(65 + currentOpts.length);
    currentOpts.push(`${letter}. New Choice`);
    updated[qIndex].options = currentOpts;
    setQuestions(updated);
  };

  const handleAiGenerateQuestions = async () => {
    setIsAiGenerating(true);
    setAiSuccessMessage(null);

    const count = Math.max(1, Math.min(25, Number(aiQuestionCount) || 5));
    const promptText = aiPrompt.trim();
    const currentTitle = title.trim() || (promptText ? promptText.slice(0, 45) : `${difficulty} level ${subject} Quiz`);

    if (!title.trim()) {
      setTitle(currentTitle);
      setSubtitle(`Grade ${grade} ${subject} Academic Checkpoint`);
    }

    try {
      const response = await fetch('/api/gemini/generate-worksheet-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          title: currentTitle,
          prompt: `GENERATE A HIGHLY DETAILED ACADEMIC QUIZ. Difficulty: ${difficulty}. ${promptText}`,
          materialsText: materialsText.trim(),
          attachedFiles: attachedMaterials,
          questionCount: count,
          questionType: aiQuestionType
        })
      });

      const result = await response.json();
      if (result && result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        setQuestions(result.questions);
        setAiSuccessMessage(`Successfully generated ${result.questions.length} premium ${difficulty} questions with AI!`);
      } else {
        generateFallbackQuestions(count, promptText, aiQuestionType, currentTitle);
      }
    } catch (err) {
      console.warn('Backend route call failed; triggering smart fallback generator:', err);
      generateFallbackQuestions(count, promptText, aiQuestionType, currentTitle);
    } finally {
      setIsAiGenerating(false);
      setTimeout(() => setAiSuccessMessage(null), 4500);
    }
  };

  const generateFallbackQuestions = (
    count: number,
    promptText: string,
    qTypeSelection: string,
    currentTitle: string
  ) => {
    const materialSnippet = materialsText.trim() ? materialsText.trim().slice(0, 50) : (attachedMaterials.length > 0 ? attachedMaterials[0].name : '');
    const topic = promptText || materialSnippet || currentTitle || `${subject} Core Mastery`;
    const typesAvailable: ('short_answer' | 'multiple_choice' | 'fill_in_blank')[] = [
      'multiple_choice',
      'fill_in_blank',
      'short_answer'
    ];

    const generated: WorksheetQuestion[] = [];
    for (let i = 1; i <= count; i++) {
      const targetType = qTypeSelection === 'mixed' 
        ? typesAvailable[(i - 1) % typesAvailable.length]
        : (qTypeSelection as 'short_answer' | 'multiple_choice' | 'fill_in_blank');

      if (targetType === 'multiple_choice') {
        generated.push({
          num: i,
          prompt: `Which of the following best analyzes the core mechanism of "${topic}" at ${difficulty} level?`,
          type: 'multiple_choice',
          points: 5,
          hint: `Recall fundamental principles of Grade ${grade} ${subject}.`,
          correctAnswer: `B. Systematic observation and structured investigation of ${topic}`,
          options: [
            `A. Random external variation without controls`,
            `B. Systematic observation and structured investigation of ${topic}`,
            `C. Unsubstantiated preliminary assumptions`,
            `D. Static isolation of environmental variables`
          ]
        });
      } else if (targetType === 'fill_in_blank') {
        generated.push({
          num: i,
          prompt: `Fill in the blank: The primary variable governing ${topic} in Grade ${grade} assessment is the _______ variable.`,
          type: 'fill_in_blank',
          points: 5,
          hint: `It keeps conditions constant for fair comparison.`,
          correctAnswer: 'controlled'
        });
      } else {
        generated.push({
          num: i,
          prompt: `Explain in detail the academic significance of "${topic}" at a ${difficulty} level.`,
          type: 'short_answer',
          points: 10,
          hint: `Support your explanation with clear scientific or mathematical terminology.`,
          correctAnswer: `Detailed explanation connecting theoretical concepts of ${topic} to practical application.`
        });
      }
    }

    setQuestions(generated);
    setAiSuccessMessage(`Generated ${generated.length} fallback questions matching your parameters.`);
  };

  const handleTemplateSelection = (count: number, type: 'multiple_choice' | 'mixed') => {
    setAiQuestionCount(count);
    setAiQuestionType(type);
    setAiPrompt(`Generate a ${count}-question ${type === 'multiple_choice' ? 'multiple choice' : 'comprehensive mixed'} quiz on "${subject} unit review and critical formulas". Ensure difficulty is ${difficulty}.`);
  };

  const constructResourceObject = (): Resource => {
    const quizTitle = title.trim() || `${difficulty} ${subject} Quiz`;
    const quizSubtitle = subtitle.trim() || `Grade ${grade} ${subject} • ${difficulty} Checkpoint`;

    const worksheetItem: WorksheetItem = {
      id: `quiz-${Date.now()}`,
      title: quizTitle,
      subtitle: quizSubtitle,
      grade,
      subject,
      estimatedMinutes,
      totalPoints,
      instructions,
      questions,
      answerKey: questions.map(q => ({
        questionNum: q.num,
        answer: q.correctAnswer || 'Refer to teacher rubric.',
        explanation: q.hint ? `Hint provided: ${q.hint}` : undefined
      }))
    };

    const newResource: Resource = {
      id: `res-custom-quiz-${Date.now()}`,
      title: quizTitle,
      subtitle: quizSubtitle,
      grade,
      subject,
      format: 'pdf',
      category: 'Quiz', // Categorized explicitly as a Quiz!
      coverTheme: {
        bg: 'from-indigo-950 via-purple-950 to-slate-900',
        text: 'text-indigo-100',
        accent: 'bg-indigo-500',
        badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
        badgeText: 'text-indigo-300'
      },
      author: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Dewey Faculty Educator',
      publishedYear: new Date().getFullYear(),
      rating: 5.0,
      viewsCount: 1,
      totalPages: 2,
      fileSize: '1.2 MB',
      description: `Premium ${difficulty}-level student quiz containing ${questions.length} questions worth ${totalPoints} total points. Estimated completion time: ${estimatedMinutes} minutes.`,
      isPersonalOnly: false,
      chapters: [
        { title: 'Quiz Questions', page: 1 },
        { title: 'Answer Key & Grading Rubric', page: 2 }
      ],
      samplePages: [
        {
          pageNumber: 1,
          title: quizTitle,
          subtitle: quizSubtitle,
          content: [
            `Instructions: ${instructions}`,
            `Estimated Time: ${estimatedMinutes} mins • Total Points: ${totalPoints} • Difficulty: ${difficulty}`,
            ...questions.map(q => `${q.num}. ${q.prompt} (${q.points} pts)`)
          ]
        }
      ],
      worksheet: worksheetItem
    };

    return newResource;
  };

  const handleSaveAndPublish = () => {
    if (!title.trim()) {
      alert('Please specify a title for this Quiz.');
      return;
    }
    const newQuizRes = constructResourceObject();
    onAddResource(newQuizRes, true);
    onClose();
  };

  const previewHTML = generateWorksheetHTML(constructResourceObject(), includeAnswerKey);

  const handlePrintQuiz = () => {
    printWorksheetDocument(constructResourceObject(), includeAnswerKey);
  };

  const handleDownloadQuiz = () => {
    downloadWorksheetDocument(constructResourceObject(), includeAnswerKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 overflow-hidden select-none animate-in fade-in duration-200">
      <div className={`relative w-full transition-all duration-300 h-[92vh] sm:h-[88vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 ${
        isChatOpen ? 'max-w-7xl' : 'max-w-5xl'
      }`}>
        
        {/* Modal Premium Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-950 px-6 py-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <BrainCircuit size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Generate Interactive Student Quiz</span>
                </h2>
                <span className="bg-amber-400/25 text-amber-300 border border-amber-300/30 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1 shrink-0">
                  <Trophy size={10} />
                  <span>DIS Standards</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-medium">
                Create standards-aligned assessments, exams, and pop checks using advanced Gemini reasoning models.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 transform hover:scale-105 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'edit'
                  ? 'bg-slate-800 text-indigo-300 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Edit3 size={15} />
              <span>Quiz Architect</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-indigo-300 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Eye size={15} />
              <span>Print Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Chat Companion Toggle */}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isChatOpen
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-slate-800 text-indigo-300 hover:text-white hover:bg-slate-700 border border-indigo-500/20'
              }`}
              title={isChatOpen ? "Close AI Chat Companion" : "Open AI Chat Companion"}
            >
              <Bot size={13} className={isChatOpen ? "animate-bounce" : ""} />
              <span>{isChatOpen ? "Close Assistant" : "AI Assistant Companion"}</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
              <AlertCircle size={14} className="text-indigo-400" />
              <span>Dual-Copy Rule: Saving generates print-ready assessment instantly.</span>
            </div>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="flex-1 flex overflow-hidden relative bg-slate-900/60">
          {/* Left Side: Scrollable main quiz builder */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {activeTab === 'edit' ? (
            <>
              {/* Premium AI Generator Panel */}
              <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 rounded-3xl p-5 border border-indigo-500/30 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-white">
                          AI Quiz Copilot
                        </h3>
                        <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider animate-pulse">
                          Active Reasoner
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200/80 mt-0.5">
                        Define high-level instructions or attach reference chapters for Gemini to build flawless, rigorous questions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prebuilt Templates Quick Selection */}
                <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-2">Quick Quiz Templates:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTemplateSelection(5, 'multiple_choice')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      5-Question Pop Quiz (MCQ)
                    </button>
                    <button
                      onClick={() => handleTemplateSelection(10, 'mixed')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      10-Question Standard Check
                    </button>
                    <button
                      onClick={() => handleTemplateSelection(15, 'mixed')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      15-Question Comprehensive
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* AI Prompt Text Box */}
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1 flex items-center justify-between">
                      <span>Quiz Target Topic, Concepts, or Formulas *</span>
                      <span className="text-[10px] font-normal text-indigo-300/80">Instruction for AI</span>
                    </label>
                    <textarea
                      id="quiz-prompt-instruction"
                      rows={2}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Generate high-rigor multiple choice quiz questions on cell respiration, Krebs cycle, and electron transport chain with conceptual application scenarios..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-indigo-50 placeholder-indigo-300/30 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    />
                  </div>

                  {/* Drag & Drop Source Materials Section */}
                  <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <Paperclip size={14} className="text-indigo-400" />
                        <span>Source Textbook Chapters or Notes for Smart Grounding</span>
                      </label>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-medium">
                        {attachedMaterials.length} file(s) attached
                      </span>
                    </div>

                    <p className="text-[11px] text-indigo-200/60">
                      If files are attached, Gemini will base questions directly on the formulas, key definitions, and concepts extracted from them.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.md,.json,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        id="btn-upload-quiz-material"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingMaterial}
                        className="px-3.5 py-2 bg-indigo-900/50 hover:bg-indigo-800/60 border border-dashed border-indigo-500/50 rounded-xl text-xs text-indigo-100 font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        {isUploadingMaterial ? (
                          <Loader2 size={14} className="animate-spin text-indigo-300" />
                        ) : (
                          <UploadCloud size={15} className="text-indigo-300" />
                        )}
                        <span>{isUploadingMaterial ? 'Reading Files...' : 'Upload References (PDF, TXT, Docs, Images)'}</span>
                      </button>
                    </div>

                    {attachedMaterials.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {attachedMaterials.map((mat) => (
                          <div
                            key={mat.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-indigo-950 border border-indigo-500/40 rounded-lg text-xs text-indigo-100 font-semibold"
                          >
                            {mat.type.startsWith('image/') ? (
                              <ImageIcon size={14} className="text-amber-300" />
                            ) : mat.name.endsWith('.pdf') ? (
                              <FileText size={14} className="text-rose-300" />
                            ) : (
                              <FileCode size={14} className="text-emerald-300" />
                            )}
                            <span className="truncate max-w-[150px]">{mat.name}</span>
                            <span className="text-[10px] text-indigo-300/70 font-normal">({mat.size})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(mat.id)}
                              className="text-indigo-400 hover:text-rose-400 p-0.5 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <textarea
                        rows={2}
                        value={materialsText}
                        onChange={(e) => setMaterialsText(e.target.value)}
                        placeholder="Or paste textbook paragraphs, core lesson article, or vocabulary terms list directly here..."
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-xl text-xs text-indigo-100 placeholder-indigo-300/30 font-normal focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Question Count & Type Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1">
                        Number of Questions *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={aiQuestionCount}
                        onChange={(e) => setAiQuestionCount(Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-indigo-50 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1">
                        Primary Format *
                      </label>
                      <select
                        value={aiQuestionType}
                        onChange={(e) => setAiQuestionType(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-indigo-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="multiple_choice" className="bg-slate-900 text-indigo-100">Multiple Choice (Standard)</option>
                        <option value="mixed" className="bg-slate-900 text-indigo-100">Mixed Formats (Varied Questions)</option>
                        <option value="fill_in_blank" className="bg-slate-900 text-indigo-100">Fill in the Blank</option>
                        <option value="short_answer" className="bg-slate-900 text-indigo-100">Short Answer / Essay</option>
                      </select>
                    </div>
                  </div>

                  {/* Generation Action Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    {aiSuccessMessage ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold">
                        <CheckCircle2 size={16} />
                        <span>{aiSuccessMessage}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-indigo-300/60 font-medium">
                        Generating automatically clears previous questions and builds custom assessments.
                      </span>
                    )}

                    <button
                      id="btn-quiz-ai-generate"
                      onClick={handleAiGenerateQuestions}
                      disabled={isAiGenerating}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 transform active:scale-95 border border-indigo-400/30"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-indigo-200" />
                          <span>Generating Quiz with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          <span>Generate Quiz Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz General Metadata Section */}
              <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-400" />
                  Quiz Information & Grading Scheme
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Unit 3 Biology: Photosynthesis Mastery Pop Check"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Topic / Syllabus Context
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Cambridge Science Framework Chapter 4 Checkpoint"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Target Grade Level *
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as GradeLevel)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {GRADES_LIST.map((g) => (
                        <option key={g} value={g} className="bg-slate-900">
                          {g === 'Foundation' ? 'Foundation' : g === 'Preparatory' ? 'Preparatory' : `Grade ${g}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Subject Area *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {SUBJECTS_LIST.map((sub) => (
                        <option key={sub} value={sub} className="bg-slate-900">
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Quiz Duration Limit (Minutes)
                    </label>
                    <select
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={10} className="bg-slate-900">10 Minutes (Pop Check)</option>
                      <option value={15} className="bg-slate-900">15 Minutes (Standard Quiz)</option>
                      <option value={20} className="bg-slate-900">20 Minutes (Mid-Unit Quiz)</option>
                      <option value={30} className="bg-slate-900">30 Minutes (Deep Assessment)</option>
                      <option value={45} className="bg-slate-900">45 Minutes (Full Unit Exam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Cognitive Rigor Level *
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Standard" className="bg-slate-900">Standard (Recall & Basic Application)</option>
                      <option value="Intermediate" className="bg-slate-900">Intermediate (Concept Integration)</option>
                      <option value="Advanced" className="bg-slate-900">Advanced (Synthesis & Data Analysis)</option>
                      <option value="Olympiad" className="bg-slate-900">Olympiad / Scholar Rigor (Highly Competitive)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between text-indigo-200">
                      <div>
                        <span className="text-xs font-bold block">Aggregated Quiz Score Metrics:</span>
                        <span className="text-[11px] text-slate-400">Calculated automatically across all built items below.</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-indigo-400 block">{totalPoints} Points</span>
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold">{questions.length} Items</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Student Rubric Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Questions Architect List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <FileText size={16} className="text-indigo-400" />
                    Quiz Questions Builder ({questions.length})
                  </h3>

                  <button
                    onClick={handleAddQuestion}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>Add Question Item</span>
                  </button>
                </div>

                {questions.map((q, index) => (
                  <div key={index} className="bg-slate-850 rounded-3xl p-5 border border-slate-700 shadow-xs space-y-3 relative group text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black flex items-center justify-center">
                        Q{q.num}
                      </span>

                      <div className="flex items-center gap-2">
                        <select
                          value={q.type}
                          onChange={(e) => handleUpdateQuestion(index, { type: e.target.value as any })}
                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 focus:outline-none"
                        >
                          <option value="multiple_choice" className="bg-slate-900">Multiple Choice</option>
                          <option value="short_answer" className="bg-slate-900">Short Answer</option>
                          <option value="fill_in_blank" className="bg-slate-900">Fill in Blank</option>
                        </select>

                        <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                          <span className="text-[11px] font-bold text-slate-400">Points:</span>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => handleUpdateQuestion(index, { points: Number(e.target.value) })}
                            className="w-12 text-xs font-bold text-slate-100 text-center bg-transparent focus:outline-none"
                          />
                        </div>

                        {questions.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuestion(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/20"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Question Prompt</label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(index, { prompt: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Multiple choice options */}
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500/40">
                        <label className="block text-[11px] font-bold text-slate-400">Options Choices</label>
                        {(q.options || []).map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(index, optIdx, e.target.value)}
                            className="w-full px-3 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ))}
                        <button
                          onClick={() => handleAddOption(index)}
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
                        >
                          <Plus size={12} /> Add Quiz Choice
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-400 mb-1">Correct Choice / Verified Solution</label>
                        <input
                          type="text"
                          value={q.correctAnswer || ''}
                          onChange={(e) => handleUpdateQuestion(index, { correctAnswer: e.target.value })}
                          placeholder="e.g. B. Systematic observation..."
                          className="w-full px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-400 mb-1">Pedagogical Hint or Guide (Optional)</label>
                        <input
                          type="text"
                          value={q.hint || ''}
                          onChange={(e) => handleUpdateQuestion(index, { hint: e.target.value })}
                          placeholder="Provide supportive cues for self-checks..."
                          className="w-full px-3 py-1.5 bg-amber-950/30 border border-amber-500/20 rounded-lg text-xs font-medium text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Print Preview Tab */
            <div className="bg-slate-900 rounded-3xl border border-slate-700 p-4 shadow-xl min-h-[500px] overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-400">Syllabus-Aligned Quiz Layout (PDF preview)</span>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Complete Answer Sheet</span>
                </label>
              </div>

              <iframe
                srcDoc={previewHTML}
                title="Quiz Print Preview"
                className="w-full h-[550px] border border-slate-800 rounded-xl bg-white"
              />
            </div>
          )}
          </div>

          {/* Right Side: Collapsible Gemini Assistant Panel */}
          {isChatOpen && (
            <div className="w-full md:w-[380px] shrink-0 border-l border-slate-800 h-full overflow-hidden absolute md:relative inset-y-0 right-0 z-30 flex flex-col bg-slate-900 shadow-2xl md:shadow-none animate-in slide-in-from-right duration-200">
              <GeminiChatbotCompanion
                roleType="quiz"
                subject={subject}
                grade={grade}
                currentTitle={title}
                onSuggestionApply={(text) => {
                  setAiPrompt(prev => prev ? `${prev}\n\n${text}` : text);
                }}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <CheckCircle2 size={16} className="text-emerald-500 animate-pulse" />
            <span>Dual-Copy Active: Saves PDF & registers digital format globally.</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintQuiz}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <Printer size={15} />
              <span>Print Quiz</span>
            </button>

            <button
              onClick={handleDownloadQuiz}
              className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>

            <button
              id="btn-quiz-save-publish"
              onClick={handleSaveAndPublish}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Save size={15} />
              <span>Save & Publish Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
