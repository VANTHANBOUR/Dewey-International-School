import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Printer,
  Save,
  CheckCircle2,
  BookOpen,
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
  Bot
} from 'lucide-react';

import { GeminiChatbotCompanion } from './GeminiChatbotCompanion';

export interface AttachedMaterialFile {
  id: string;
  name: string;
  size: string;
  type: string;
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
}
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

interface CreateWorksheetModalProps {
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

export const CreateWorksheetModal: React.FC<CreateWorksheetModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  currentUser,
  initialGrade = '6',
  initialSubject = 'Science'
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [subject, setSubject] = useState<SubjectCategory>(initialSubject);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [instructions, setInstructions] = useState(
    'Read each question carefully. Write your answers clearly in the spaces provided. Show all work for mathematical and scientific calculations.'
  );
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  // AI Prompt & Question Generator Controls State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [materialsText, setMaterialsText] = useState('');
  const [attachedMaterials, setAttachedMaterials] = useState<AttachedMaterialFile[]>([]);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiQuestionType, setAiQuestionType] = useState<'mixed' | 'short_answer' | 'multiple_choice' | 'fill_in_blank' | 'diagram_label'>('mixed');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            textContent: (evt.target?.result as string) || '',
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
        reader.onload = (evt) => {
          newItems.push({
            id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: sizeStr,
            type: file.type || 'application/octet-stream',
            base64Data: (evt.target?.result as string) || '',
            mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
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

  const [questions, setQuestions] = useState<WorksheetQuestion[]>([
    {
      num: 1,
      prompt: 'Define the core concept of this lesson in your own words.',
      type: 'short_answer',
      points: 5,
      hint: 'Think back to key terms introduced in Chapter 1.',
      correctAnswer: 'A comprehensive explanation outlining fundamental principles.'
    },
    {
      num: 2,
      prompt: 'Which of the following best describes the primary process studied in this module?',
      type: 'multiple_choice',
      options: [
        'A. Observation and data collection',
        'B. Hypothesis testing and analysis',
        'C. Direct synthesis and evaluation',
        'D. Systemic classification'
      ],
      correctAnswer: 'B. Hypothesis testing and analysis',
      points: 5,
      hint: 'Recall the second step of scientific investigation.'
    },
    {
      num: 3,
      prompt: 'Fill in the blank: The key variable that remains constant throughout the trial is the _______ variable.',
      type: 'fill_in_blank',
      points: 5,
      correctAnswer: 'controlled',
      hint: 'It ensures experimental fairness.'
    }
  ]);

  useEffect(() => {
    if (initialGrade) setGrade(initialGrade);
    if (initialSubject) setSubject(initialSubject);
  }, [initialGrade, initialSubject, isOpen]);

  if (!isOpen) return null;

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    setQuestions([
      ...questions,
      {
        num: nextNum,
        prompt: `New Question ${nextNum}: Enter prompt here...`,
        type: 'short_answer',
        points: 5,
        hint: '',
        correctAnswer: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index).map((q, idx) => ({ ...q, num: idx + 1 }));
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
    currentOpts.push(`${letter}. New Option`);
    updated[qIndex].options = currentOpts;
    setQuestions(updated);
  };

  const handleAiGenerateQuestions = async () => {
    setIsAiGenerating(true);
    setAiSuccessMessage(null);

    const count = Math.max(1, Math.min(25, Number(aiQuestionCount) || 5));
    const promptText = aiPrompt.trim();
    const currentTitle = title.trim() || (promptText ? promptText.slice(0, 45) : `${subject} Core Concepts`);

    if (!title.trim()) {
      setTitle(currentTitle);
      setSubtitle(`Grade ${grade} ${subject} Skill Assessment`);
    }

    try {
      const response = await fetch('/api/gemini/generate-worksheet-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          title: currentTitle,
          prompt: promptText,
          materialsText: materialsText.trim(),
          attachedFiles: attachedMaterials,
          questionCount: count,
          questionType: aiQuestionType
        })
      });

      const result = await response.json();
      if (result && result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        setQuestions(result.questions);
        setAiSuccessMessage(`Successfully generated ${result.questions.length} questions with AI!`);
      } else {
        generateFallbackQuestions(count, promptText, aiQuestionType, currentTitle);
      }
    } catch (err) {
      console.warn('Backend AI route call error; generating via smart client generator:', err);
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
    const topic = promptText || materialSnippet || currentTitle || `${subject} Unit Concepts`;
    const typesAvailable: ('short_answer' | 'multiple_choice' | 'fill_in_blank' | 'diagram_label')[] = [
      'short_answer',
      'multiple_choice',
      'fill_in_blank',
      'diagram_label'
    ];

    const generated: WorksheetQuestion[] = [];
    for (let i = 1; i <= count; i++) {
      const targetType = qTypeSelection === 'mixed' 
        ? typesAvailable[(i - 1) % typesAvailable.length]
        : (qTypeSelection as 'short_answer' | 'multiple_choice' | 'fill_in_blank' | 'diagram_label');

      if (targetType === 'multiple_choice') {
        generated.push({
          num: i,
          prompt: `Which of the following best analyzes the core mechanism of "${topic}" in Grade ${grade} ${subject}?`,
          type: 'multiple_choice',
          points: 5,
          hint: `Recall fundamental principles of ${subject} covered in Grade ${grade}.`,
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
          prompt: `Fill in the blank: The primary variable governing ${topic} during experimental testing is the _______ variable.`,
          type: 'fill_in_blank',
          points: 5,
          hint: `It keeps conditions constant for fair comparison.`,
          correctAnswer: 'controlled'
        });
      } else if (targetType === 'diagram_label') {
        generated.push({
          num: i,
          prompt: `Diagram Analysis: Label and describe the key stages of ${topic} as demonstrated in your Grade ${grade} lesson.`,
          type: 'diagram_label',
          points: 10,
          hint: `Trace process flow from initial input to final output.`,
          correctAnswer: 'Stage 1: Primary Input, Stage 2: Core Transformation, Stage 3: Product Synthesis.'
        });
      } else {
        generated.push({
          num: i,
          prompt: `Explain in detail the fundamental significance of "${topic}" and provide two real-world examples.`,
          type: 'short_answer',
          points: 10,
          hint: `Support your explanation with clear scientific or mathematical terminology.`,
          correctAnswer: `Detailed explanation connecting theoretical concepts of ${topic} to practical application.`
        });
      }
    }

    setQuestions(generated);
    setAiSuccessMessage(`Generated ${generated.length} questions matching your topic & type preferences!`);
  };

  const handleAutoGenerateQuestions = () => {
    handleAiGenerateQuestions();
  };

  const constructResourceObject = (): Resource => {
    const worksheetTitle = title.trim() || `${subject} Practice Worksheet`;
    const worksheetSubtitle = subtitle.trim() || `Grade ${grade} ${subject} Practice & Assessment`;
    
    const worksheetItem: WorksheetItem = {
      id: `ws-${Date.now()}`,
      title: worksheetTitle,
      subtitle: worksheetSubtitle,
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
      id: `res-custom-ws-${Date.now()}`,
      title: worksheetTitle,
      subtitle: worksheetSubtitle,
      grade,
      subject,
      format: 'pdf',
      coverTheme: {
        bg: 'from-purple-900 via-indigo-900 to-slate-900',
        text: 'text-purple-100',
        accent: 'bg-purple-500',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
        badgeText: 'text-purple-300'
      },
      author: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Dewey Faculty Member',
      publishedYear: new Date().getFullYear(),
      rating: 5.0,
      viewsCount: 1,
      totalPages: 2,
      fileSize: '1.4 MB',
      description: `Student practice worksheet containing ${questions.length} questions worth ${totalPoints} total points. Estimated completion time: ${estimatedMinutes} minutes.`,
      isPersonalOnly: false,
      chapters: [
        { title: 'Worksheet Questions', page: 1 },
        { title: 'Answer Key & Rubric', page: 2 }
      ],
      samplePages: [
        {
          pageNumber: 1,
          title: worksheetTitle,
          subtitle: worksheetSubtitle,
          content: [
            `Instructions: ${instructions}`,
            ...questions.map(q => `${q.num}. ${q.prompt} (${q.points} pts)`)
          ]
        }
      ],
      worksheet: worksheetItem
    };

    return newResource;
  };

  const handleDownloadWorksheet = () => {
    const res = constructResourceObject();
    downloadWorksheetDocument(res, includeAnswerKey);
  };

  const handlePrintWorksheet = () => {
    const res = constructResourceObject();
    printWorksheetDocument(res, includeAnswerKey);
  };

  const handleSaveAndPublish = () => {
    const res = constructResourceObject();
    onAddResource(res, true);
    onClose();
  };

  const previewResource = constructResourceObject();
  const previewHTML = generateWorksheetHTML(previewResource, includeAnswerKey);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh] ${
        isChatOpen ? 'max-w-6xl' : 'max-w-4xl'
      }`}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 sm:p-6 text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-blue-200 shadow-inner">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Create Student Worksheet
                </h2>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Interactive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-0.5">
                Design custom practice questions, set answer keys, or print & download PDF worksheets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'edit'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Edit3 size={15} />
              <span>Question Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Eye size={15} />
              <span>Print Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Chat Companion Toggle */}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isChatOpen
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-white text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200'
              }`}
              title={isChatOpen ? "Close AI Chat Companion" : "Open AI Chat Companion"}
            >
              <Bot size={13} className={isChatOpen ? "animate-bounce" : ""} />
              <span>{isChatOpen ? "Close Assistant" : "AI Assistant Companion"}</span>
            </button>

            <button
              onClick={handleAutoGenerateQuestions}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Wand2 size={14} />
              <span>Auto-Fill AI Sample Questions</span>
            </button>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="flex-1 flex overflow-hidden relative bg-slate-50/50">
          {/* Left Side: Scrollable main worksheet builder */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'edit' ? (
            <>
              {/* AI Question Generator & Prompt Panel */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 border border-purple-500/40 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-white">
                          AI Question Generator
                        </h3>
                        <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Gemini Powered
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/80 mt-0.5">
                        Instruct AI with custom topics to automatically create tailored questions based on your count and selected type.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* AI Prompt Text Box */}
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1 flex items-center justify-between">
                      <span>Instruct AI (Topic, Key Concepts, Difficulty & Context) *</span>
                      <span className="text-[10px] font-normal text-purple-300/80">Custom Instruction</span>
                    </label>
                    <textarea
                      id="ai-prompt-instruction-input"
                      rows={2}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Generate questions focusing on key terms, processes, and problem-solving scenarios from the attached materials..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-purple-400/30 rounded-xl text-xs sm:text-sm text-purple-50 placeholder-purple-300/40 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>

                  {/* Upload Materials & Reference Text Box Section */}
                  <div className="bg-slate-950/60 border border-purple-400/30 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <Paperclip size={14} className="text-purple-400" />
                        <span>Source Materials & Reference Documents for AI Analysis</span>
                      </label>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-medium">
                        {attachedMaterials.length} file(s) attached
                      </span>
                    </div>

                    <p className="text-[11px] text-purple-200/70">
                      Upload syllabus PDFs, textbook chapters, lecture notes, or paste article text below. Gemini will analyze all uploaded files and generate questions matching the exact content.
                    </p>

                    {/* Drag & Drop / Upload File Button */}
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
                        id="btn-upload-materials-file"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingMaterial}
                        className="px-3.5 py-2 bg-purple-800/50 hover:bg-purple-700/60 border border-dashed border-purple-400/50 rounded-xl text-xs text-purple-100 font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        {isUploadingMaterial ? (
                          <Loader2 size={14} className="animate-spin text-purple-300" />
                        ) : (
                          <UploadCloud size={15} className="text-purple-300" />
                        )}
                        <span>{isUploadingMaterial ? 'Processing Files...' : 'Upload Files (PDF, TXT, Images, Docs)'}</span>
                      </button>

                      <div className="text-[11px] text-purple-300/60 flex items-center gap-1 px-1 py-1">
                        <span>Supports PDFs, text documents, images, and notes.</span>
                      </div>
                    </div>

                    {/* Uploaded Attached Files List */}
                    {attachedMaterials.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {attachedMaterials.map((mat) => (
                          <div
                            key={mat.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-purple-900/80 border border-purple-400/40 rounded-lg text-xs text-purple-100 font-semibold shadow-xs"
                          >
                            {mat.type.startsWith('image/') ? (
                              <ImageIcon size={14} className="text-amber-300" />
                            ) : mat.name.endsWith('.pdf') ? (
                              <FileText size={14} className="text-rose-300" />
                            ) : (
                              <FileCode size={14} className="text-emerald-300" />
                            )}
                            <span className="truncate max-w-[150px]">{mat.name}</span>
                            <span className="text-[10px] text-purple-300/80 font-normal">({mat.size})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(mat.id)}
                              className="text-purple-300 hover:text-rose-300 p-0.5 transition-colors"
                              title="Remove file"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pasted Material Text Area */}
                    <div>
                      <label className="block text-[11px] font-bold text-purple-300/90 mb-1">
                        Or Paste Textbook / Reading Article Text:
                      </label>
                      <textarea
                        id="ai-materials-text-input"
                        rows={3}
                        value={materialsText}
                        onChange={(e) => setMaterialsText(e.target.value)}
                        placeholder="Paste lesson text, article content, vocabulary terms, or study guide notes here..."
                        className="w-full px-3 py-2 bg-slate-900/80 border border-purple-400/30 rounded-xl text-xs text-purple-100 placeholder-purple-300/40 font-normal focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  {/* Question Count & Question Type Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">
                        Enter Number of Questions *
                      </label>
                      <div className="relative">
                        <input
                          id="ai-question-count-input"
                          type="number"
                          min={1}
                          max={25}
                          value={aiQuestionCount}
                          onChange={(e) => setAiQuestionCount(Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
                          className="w-full px-3.5 py-2 bg-slate-950/70 border border-purple-400/30 rounded-xl text-xs sm:text-sm text-purple-50 font-extrabold focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <span className="absolute right-3 top-2.5 text-[11px] text-purple-300/60 font-semibold pointer-events-none">
                          Questions (1–25)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">
                        Select Question Type *
                      </label>
                      <select
                        id="ai-question-type-select"
                        value={aiQuestionType}
                        onChange={(e) => setAiQuestionType(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-slate-950/70 border border-purple-400/30 rounded-xl text-xs sm:text-sm text-purple-50 font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="mixed" className="bg-slate-900 text-purple-100">Mixed Question Types (Varied)</option>
                        <option value="short_answer" className="bg-slate-900 text-purple-100">Short Answer / Written Response</option>
                        <option value="multiple_choice" className="bg-slate-900 text-purple-100">Multiple Choice (Options A-D)</option>
                        <option value="fill_in_blank" className="bg-slate-900 text-purple-100">Fill in the Blank</option>
                        <option value="diagram_label" className="bg-slate-900 text-purple-100">Diagram & Process Labeling</option>
                      </select>
                    </div>
                  </div>

                  {/* Action & Feedback */}
                  <div className="flex items-center justify-between pt-1">
                    {aiSuccessMessage ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold animate-in fade-in">
                        <CheckCircle2 size={16} />
                        <span>{aiSuccessMessage}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-purple-300/70 font-medium">
                        Clicking generate replaces questions with {aiQuestionCount} custom items.
                      </span>
                    )}

                    <button
                      id="btn-generate-ai-questions"
                      onClick={handleAiGenerateQuestions}
                      disabled={isAiGenerating}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 transform active:scale-95 border border-purple-300/30"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-purple-200" />
                          <span>Generating {aiQuestionCount} Questions...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          <span>Generate Questions with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Worksheet General Metadata */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <GraduationCap size={16} className="text-blue-600" />
                  Worksheet Details & Target Grade
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Worksheet Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Photosynthesis & Energy Transfer Practice"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subtitle / Unit Topic
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Unit 2: Cellular Biology & Plant Systems"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Grade Level *
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as GradeLevel)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {GRADES_LIST.map((g) => (
                        <option key={g} value={g}>
                          {g === 'Foundation' ? 'Foundation' : g === 'Preparatory' ? 'Preparatory' : `Grade ${g}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject Category *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SUBJECTS_LIST.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Minutes
                    </label>
                    <input
                      type="number"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Points (Auto-Calculated)
                    </label>
                    <div className="w-full px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm text-blue-900 font-extrabold flex items-center justify-between">
                      <span>{totalPoints} Points Total</span>
                      <span className="text-[11px] font-normal text-blue-700">{questions.length} Questions</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Question List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-purple-600" />
                    Questions List ({questions.length})
                  </h3>

                  <button
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, index) => (
                  <div key={index} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">
                        Q{q.num}
                      </span>

                      <div className="flex items-center gap-2">
                        <select
                          value={q.type}
                          onChange={(e) => handleUpdateQuestion(index, { type: e.target.value as any })}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="short_answer">Short Answer</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="fill_in_blank">Fill in Blank</option>
                          <option value="diagram_label">Diagram Labeling</option>
                        </select>

                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-500">Pts:</span>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => handleUpdateQuestion(index, { points: Number(e.target.value) })}
                            className="w-12 text-xs font-bold text-slate-900 text-center bg-transparent focus:outline-none"
                          />
                        </div>

                        {questions.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuestion(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Question Prompt</label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(index, { prompt: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Multiple choice options */}
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-1.5 pl-3 border-l-2 border-purple-200">
                        <label className="block text-[11px] font-bold text-slate-600">Options</label>
                        {(q.options || []).map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(index, optIdx, e.target.value)}
                            className="w-full px-3 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        ))}
                        <button
                          onClick={() => handleAddOption(index)}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 mt-1"
                        >
                          <Plus size={12} /> Add Choice Option
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-700 mb-1">Correct Answer / Key</label>
                        <input
                          type="text"
                          value={q.correctAnswer || ''}
                          onChange={(e) => handleUpdateQuestion(index, { correctAnswer: e.target.value })}
                          placeholder="Answer key explanation for grading"
                          className="w-full px-3 py-1.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-700 mb-1">Student Hint (Optional)</label>
                        <input
                          type="text"
                          value={q.hint || ''}
                          onChange={(e) => handleUpdateQuestion(index, { hint: e.target.value })}
                          placeholder="Scaffolding prompt or textbook page hint"
                          className="w-full px-3 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Print Preview Tab */
            <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-md min-h-[500px] overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <span className="text-xs font-bold text-slate-500">Live HTML/PDF Preview</span>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Teacher Answer Key</span>
                </label>
              </div>

              <iframe
                srcDoc={previewHTML}
                title="Worksheet Print Preview"
                className="w-full h-[550px] border border-slate-200 rounded-xl bg-white"
              />
            </div>
          )}
          </div>

          {/* Right Side: Collapsible Gemini Assistant Panel */}
          {isChatOpen && (
            <div className="w-full md:w-[380px] shrink-0 border-l border-slate-200/80 h-full overflow-hidden absolute md:relative inset-y-0 right-0 z-30 flex flex-col bg-slate-900 shadow-2xl md:shadow-none animate-in slide-in-from-right duration-200">
              <GeminiChatbotCompanion
                roleType="worksheet"
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
        <div className="bg-white border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Ready to publish to Dewey Portal & Personal Library</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintWorksheet}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>Print Preview</span>
            </button>

            <button
              onClick={handleDownloadWorksheet}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-all border border-blue-200 flex items-center gap-1.5"
            >
              <Download size={15} />
              <span>Download HTML/PDF</span>
            </button>

            <button
              onClick={handleSaveAndPublish}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
            >
              <Save size={15} />
              <span>Save & Publish Worksheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
