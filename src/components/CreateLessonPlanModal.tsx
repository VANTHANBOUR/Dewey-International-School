import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  GraduationCap,
  FileText,
  CalendarDays,
  CalendarRange,
  Timer,
  ChevronRight,
  Eye,
  Edit3,
  Sliders,
  AlertCircle,
  RotateCcw,
  Eraser,
  Bot,
  Wand2,
  Loader2,
  BrainCircuit,
  Zap,
  Printer
} from 'lucide-react';
import { 
  GradeLevel, 
  SubjectCategory, 
  LessonPlanItem, 
  LessonPlanScope, 
  LessonPlanTimelineStep,
  WeeklyDaySchedule,
  WeeklyLessonEntry,
  UserProfile 
} from '../types';
import { downloadLessonPlanDocument, generateLessonPlanHTML, printLessonPlanDocument } from '../utils/downloadHelper';

interface CreateLessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (plan: LessonPlanItem) => void;
  currentUser: UserProfile | null;
  initialGrade?: GradeLevel;
  initialSubject?: SubjectCategory;
}

const SCOPE_OPTIONS: {
  id: LessonPlanScope;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    id: 'yearly',
    title: 'Yearly Plan',
    subtitle: 'Annual curriculum map & terms pacing',
    icon: CalendarRange,
    color: 'from-amber-600 to-orange-700',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: 'Annual Scope'
  },
  {
    id: 'quarter',
    title: 'Quarter Plan',
    subtitle: '9-week quarter/term unit roadmap',
    icon: CalendarDays,
    color: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'Quarter / Term'
  },
  {
    id: 'monthly',
    title: 'Monthly Plan',
    subtitle: '4-week thematic module schedule',
    icon: Calendar,
    color: 'from-blue-600 to-indigo-700',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    badgeText: 'Monthly Roadmap'
  },
  {
    id: 'weekly',
    title: 'Weekly Plan',
    subtitle: 'Monday–Friday day-by-day timetable',
    icon: Clock,
    color: 'from-violet-600 to-purple-800',
    badgeBg: 'bg-violet-100 text-violet-900 border-violet-300',
    badgeText: 'Weekly Timetable'
  },
  {
    id: 'daily',
    title: 'Daily Plan',
    subtitle: 'Single class period & 5E model schedule',
    icon: Timer,
    color: 'from-rose-600 to-pink-700',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    badgeText: 'Daily 5E Session'
  }
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

const GRADES_LIST: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const CreateLessonPlanModal: React.FC<CreateLessonPlanModalProps> = ({
  isOpen,
  onClose,
  onSavePlan,
  currentUser,
  initialGrade = '9',
  initialSubject = 'Science'
}) => {
  const [scope, setScope] = useState<LessonPlanScope>('daily');
  const [subject, setSubject] = useState<SubjectCategory>(initialSubject);
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // Time & Scheduling Details
  const [startTime, setStartTime] = useState('08:30 AM');
  const [endTime, setEndTime] = useState('09:30 AM');
  const [classPeriod, setClassPeriod] = useState('Period 1 (Room 204)');
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);

  const [weekNumber, setWeekNumber] = useState('Week 4');
  const [weekDateRange, setWeekDateRange] = useState('Oct 13 - Oct 17, 2025');
  const [weekCommencing, setWeekCommencing] = useState('25 August 2026');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [weeklyHours, setWeeklyHours] = useState('20 Lessons • 4 per Day');
  const [activeWeeklyDay, setActiveWeeklyDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Dedicated Weekly Plan Days (Monday - Friday with Lesson 1 to Lesson 4)
  const [weeklyDays, setWeeklyDays] = useState<WeeklyDaySchedule[]>([
    {
      day: 'Monday',
      lessons: [
        {
          lessonName: 'Lesson 1',
          experiencesAndOutcomes: 'Introduce foundational concepts and inquiry hook. Students formulate guiding hypotheses and connect to real-world phenomena.',
          benchmarksForAssessment: 'Diagnostic Think-Pair-Share check; accurate initial concept definitions in notes.',
          resourcesRequired: 'Dewey Digital Flipbook, Interactive Whiteboard, Cornell Notes Journal.',
          evaluation: '88% of learners demonstrated baseline comprehension of core terminology.'
        },
        {
          lessonName: 'Lesson 2',
          experiencesAndOutcomes: 'Direct instruction on key mechanisms, analytical formulas, and textbook reference diagrams.',
          benchmarksForAssessment: 'Formative quick-check quiz (3 items); correct notation application.',
          resourcesRequired: 'Textbook reference pages, interactive diagram slides.',
          evaluation: 'Identified need for additional review on variable relationships during tomorrow’s lab.'
        },
        {
          lessonName: 'Lesson 3',
          experiencesAndOutcomes: 'Guided workstation inquiry: students collaborate in partner pairs to model mechanisms and record observations.',
          benchmarksForAssessment: 'Workstation observation rubric; evidence-based reasoning in pairs.',
          resourcesRequired: 'Laboratory exploration kits, digital data collection tables.',
          evaluation: 'Active peer collaboration; all groups completed data capture on schedule.'
        },
        {
          lessonName: 'Lesson 4',
          experiencesAndOutcomes: 'Independent application practice: complete practice problems 1–4 on Student Mastery Worksheet.',
          benchmarksForAssessment: 'Worksheet accuracy check; self-assessment against scoring key.',
          resourcesRequired: 'Student Practice Worksheet (Set A), answer rubric.',
          evaluation: 'Target mastery achieved; homework assigned for reinforcement.'
        }
      ]
    },
    {
      day: 'Tuesday',
      lessons: [
        {
          lessonName: 'Lesson 1',
          experiencesAndOutcomes: 'Review Monday findings and investigate real-world application case studies in subject discipline.',
          benchmarksForAssessment: 'Opening retrieval warm-up response; oral explanation of mechanisms.',
          resourcesRequired: 'Digital case study slides, student study guides.',
          evaluation: 'Strong retrieval retention from Monday Lessons 1–2.'
        },
        {
          lessonName: 'Lesson 2',
          experiencesAndOutcomes: 'Collaborative problem-solving: analyze data sets, graph trends, and calculate variance.',
          benchmarksForAssessment: 'Proper chart formatting and gradient calculation accuracy.',
          resourcesRequired: 'Graph paper / iPad graphing tool, curated data sets.',
          evaluation: 'Scaffolded tier-2 support for students interpreting non-linear graphs.'
        },
        {
          lessonName: 'Lesson 3',
          experiencesAndOutcomes: 'Differentiated station rotations: targeted remediation clinic vs. advanced extension challenge.',
          benchmarksForAssessment: 'Station checkpoint tickets; mastery of target sub-skill.',
          resourcesRequired: 'Tiered worksheet cards, extension investigation prompt.',
          evaluation: 'Both groups successfully completed their assigned milestone.'
        },
        {
          lessonName: 'Lesson 4',
          experiencesAndOutcomes: 'Daily synthesis and formative exit reflection.',
          benchmarksForAssessment: 'Digital exit ticket submission with 80%+ accuracy.',
          resourcesRequired: 'Dewey student portal exit ticket module.',
          evaluation: 'Ready to proceed to experimental verification on Wednesday.'
        }
      ]
    },
    {
      day: 'Wednesday',
      lessons: [
        {
          lessonName: 'Lesson 1',
          experiencesAndOutcomes: 'Pre-lab briefing and safety protocols for structured inquiry experiment.',
          benchmarksForAssessment: 'Safety protocol checklist verification and lab hypothesis approval.',
          resourcesRequired: 'Safety guidelines, experiment briefing sheet.',
          evaluation: '100% compliance with laboratory safety regulations.'
        },
        {
          lessonName: 'Lesson 2',
          experiencesAndOutcomes: 'Hands-on laboratory experiment: students test variables and record quantitative data.',
          benchmarksForAssessment: 'Measurement precision check; systematic data logging.',
          resourcesRequired: 'Lab apparatus (Set B), digital sensor probes.',
          evaluation: 'High engagement; experimental results aligned with predicted values.'
        },
        {
          lessonName: 'Lesson 3',
          experiencesAndOutcomes: 'Post-lab data analysis and error margin discussion in small groups.',
          benchmarksForAssessment: 'Calculated percent error and valid justification of discrepancies.',
          resourcesRequired: 'Scientific calculator, post-lab synthesis guide.',
          evaluation: 'Students articulated sources of experimental variance clearly.'
        },
        {
          lessonName: 'Lesson 4',
          experiencesAndOutcomes: 'Mid-week review summary and draft lab report section.',
          benchmarksForAssessment: 'Peer review rubric on lab report methodology draft.',
          resourcesRequired: 'Lab report template, peer feedback rubric.',
          evaluation: 'Constructive peer feedback provided across all pairs.'
        }
      ]
    },
    {
      day: 'Thursday',
      lessons: [
        {
          lessonName: 'Lesson 1',
          experiencesAndOutcomes: 'Deep-dive inquiry into interdisciplinary connections and technological developments.',
          benchmarksForAssessment: 'Group discussion contributions and Socratic inquiry responses.',
          resourcesRequired: 'Digital reading excerpt, multimedia video case.',
          evaluation: 'Stimulating class dialogue linking concepts to modern technology.'
        },
        {
          lessonName: 'Lesson 2',
          experiencesAndOutcomes: 'Guided practice on complex multi-step analytical synthesis questions.',
          benchmarksForAssessment: 'Step-by-step problem breakdown on individual dry-erase boards.',
          resourcesRequired: 'Mini whiteboards, exam-style practice questions.',
          evaluation: 'Targeted support provided for multi-variable equations.'
        },
        {
          lessonName: 'Lesson 3',
          experiencesAndOutcomes: 'Collaborative peer tutoring and revision seminar for weekly mastery check.',
          benchmarksForAssessment: 'Comprehensive practice quiz self-scoring against standard.',
          resourcesRequired: 'Revision flashcards, practice exam booklet.',
          evaluation: 'Identified remaining focus areas prior to Friday assessment.'
        },
        {
          lessonName: 'Lesson 4',
          experiencesAndOutcomes: 'Review key vocabulary and finalize weekly study guide summaries.',
          benchmarksForAssessment: 'Complete vocabulary cross-check and study guide portfolio.',
          resourcesRequired: 'Dewey Digital Study Portal & Reference Glossary.',
          evaluation: 'Students prepared for weekly cumulative examination.'
        }
      ]
    },
    {
      day: 'Friday',
      lessons: [
        {
          lessonName: 'Lesson 1',
          experiencesAndOutcomes: 'Weekly Retrieval Warm-Up & Final Q&A Clarification Clinic.',
          benchmarksForAssessment: 'Rapid-fire verbal check; clarification of final edge cases.',
          resourcesRequired: 'Review summary slides, student questions queue.',
          evaluation: 'High student confidence going into assessment.'
        },
        {
          lessonName: 'Lesson 2',
          experiencesAndOutcomes: 'Weekly Cumulative Competency Assessment on Unit concepts.',
          benchmarksForAssessment: 'Formal summative assessment examination (Criterion: 80%+ mastery).',
          resourcesRequired: 'Printed examination papers / secure digital testing terminal.',
          evaluation: 'Assessment conducted securely under standardized exam conditions.'
        },
        {
          lessonName: 'Lesson 3',
          experiencesAndOutcomes: 'Immediate post-exam reflective analysis and self-correction review.',
          benchmarksForAssessment: 'Error analysis log documenting reason for any missed items.',
          resourcesRequired: 'Examination marking rubric, error reflection guide.',
          evaluation: 'Learners demonstrated growth through metacognitive error analysis.'
        },
        {
          lessonName: 'Lesson 4',
          experiencesAndOutcomes: 'Weekly synthesis wrap-up, capstone showcase, and preview of upcoming unit.',
          benchmarksForAssessment: 'Weekly learning portfolio submission and weekend reading preview.',
          resourcesRequired: 'Portfolio binder / Dewey Cloud Storage, next unit syllabus.',
          evaluation: 'Week successfully concluded with 92% overall class competency.'
        }
      ]
    }
  ]);

  const [weeklyNotesAndEvaluations, setWeeklyNotesAndEvaluations] = useState(
    'Overall Weekly Reflection:\n- Students showed exceptional engagement with interactive modeling and workstation investigations.\n- Pacing for Wednesday laboratory experiment was optimal with all groups completing quantitative data capture.\n- 92% of the cohort demonstrated mastery on Friday cumulative competency evaluation.\n- Follow-up recommendation: Provide 10-minute reinforcement on non-linear data sets at the start of next week.'
  );

  const [targetMonth, setTargetMonth] = useState('October 2025');
  const [monthlyHours, setMonthlyHours] = useState('36 Instructional Hours');
  const [monthlyTheme, setMonthlyTheme] = useState('');
  
  // Weekly Breakdown state (simple for now: 4 weeks)
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([
    { week: 'Week 1', topic: '', objectives: '', activities: '', resources: '', assessment: '' },
    { week: 'Week 2', topic: '', objectives: '', activities: '', resources: '', assessment: '' },
    { week: 'Week 3', topic: '', objectives: '', activities: '', resources: '', assessment: '' },
    { week: 'Week 4', topic: '', objectives: '', activities: '', resources: '', assessment: '' },
  ]);

  const [targetQuarter, setTargetQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [quarterWeeks, setQuarterWeeks] = useState('9 Weeks (72 Total Hours)');

  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [yearlyTerms, setYearlyTerms] = useState('4 Quarters / 2 Semesters (180 Instructional Days)');

  // Pedagogical Details
  const [standards, setStandards] = useState<string[]>([
    'DIS-SCI.G9.01: Formulate hypotheses and design inquiry-based investigation frameworks.',
    'CCSS/NGSS Alignment: Grade 9 Academic Science Standards 2025-2026.'
  ]);
  const [newStandardInput, setNewStandardInput] = useState('');

  const [objectives, setObjectives] = useState<string[]>([
    'Students will define core concepts and identify variables with 85% accuracy.',
    'Students will collaborate in pairs to analyze models and record structured observations.',
    'Students will synthesize key findings in their curriculum laboratory journals.'
  ]);
  const [newObjectiveInput, setNewObjectiveInput] = useState('');

  const [essentialQuestions, setEssentialQuestions] = useState<string[]>([
    'How do the mechanisms introduced today explain fundamental phenomena in our world?',
    'What real-world problem or technological innovation relies directly on this principle?'
  ]);
  const [newQuestionInput, setNewQuestionInput] = useState('');

  const [materials, setMaterials] = useState<string[]>([
    'Dewey International School Digital Flipbook Reader & iPad Terminals',
    'Student Practice Mastery Worksheet & Cornell Notes Journal',
    'Interactive Whiteboard & Laboratory Kit (Set A)'
  ]);
  const [newMaterialInput, setNewMaterialInput] = useState('');

  // Structured Schedule / Timeline Steps
  const [timelineSteps, setTimelineSteps] = useState<LessonPlanTimelineStep[]>([
    {
      phase: '1. Hook & Engagement (Engage)',
      timeSlot: '08:30 - 08:40 AM',
      durationMin: 10,
      teacherRole: 'Project dynamic opening case question on screen. Prompt Think-Pair-Share on real-world application.',
      studentRole: 'Record initial hypothesis in notebooks and discuss observations with assigned seat partner.'
    },
    {
      phase: '2. Concept Exploration & Inquiry (Explore)',
      timeSlot: '08:40 - 08:55 AM',
      durationMin: 15,
      teacherRole: 'Facilitate collaborative workstation setup. Distribute digital flipbook resources and observation guide.',
      studentRole: 'Work through interactive diagram stations and capture data points into collaborative spreadsheet.'
    },
    {
      phase: '3. Direct Instruction & Clarification (Explain)',
      timeSlot: '08:55 - 09:10 AM',
      durationMin: 15,
      teacherRole: 'Present formal scientific vocabulary and synthesize student findings on the interactive board.',
      studentRole: 'Annotate key terms in digital flipbook reader and ask clarifying questions on mechanisms.'
    },
    {
      phase: '4. Guided Application & Practice (Elaborate)',
      timeSlot: '09:10 - 09:22 AM',
      durationMin: 12,
      teacherRole: 'Circulate classroom for formative checks. Provide targeted scaffolding for small breakout groups.',
      studentRole: 'Complete application problems 1 through 3 on the Student Practice Worksheet independently.'
    },
    {
      phase: '5. Assessment & Exit Reflection (Evaluate)',
      timeSlot: '09:22 - 09:30 AM',
      durationMin: 8,
      teacherRole: 'Collect student worksheets and review key take-home synthesis question.',
      studentRole: 'Submit individual digital exit ticket summary and pack up laboratory materials.'
    }
  ]);

  // Assessment & Differentiation
  const [formativeAssessment, setFormativeAssessment] = useState(
    'Real-time Think-Pair-Share check-in, workstation observation rubric, and 5-item exit ticket mastery check.'
  );
  const [summativeAssessment, setSummativeAssessment] = useState(
    'End-of-unit comprehensive worksheet examination and laboratory inquiry presentation portfolio.'
  );
  const [supportDiff, setSupportDiff] = useState(
    'Provide bilingual vocabulary glossaries, visual diagram anchor charts, and peer mentor scaffolding.'
  );
  const [extensionDiff, setExtensionDiff] = useState(
    'Challenge students to formulate a novel mathematical model or design an independent laboratory extension experiment.'
  );
  const [homework, setHomework] = useState(
    'Review textbook pages 12-16 in Dewey Reader and complete unit reflection questions in digital journal.'
  );
  const [notes, setNotes] = useState(
    'Ensure all student devices have updated flipbook access before starting workstation exploration.'
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [clearedToast, setClearedToast] = useState(false);
  const [isExplicitlyCleared, setIsExplicitlyCleared] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiToastMsg, setAiToastMsg] = useState<string | null>(null);

  // Initialize teacher name & default title based on current user & subject
  useEffect(() => {
    if (isExplicitlyCleared) return;
    if (currentUser?.name) {
      setTeacherName(currentUser.name);
    } else {
      setTeacherName('Dewey Faculty Educator');
    }
  }, [currentUser, isExplicitlyCleared]);

  // Update default titles when scope, subject or grade changes if not dirty
  useEffect(() => {
    if (isExplicitlyCleared) return;
    if (!title || title.startsWith('Curriculum') || title.startsWith('Lesson') || title.startsWith('Daily') || title.startsWith('Quarter') || title.startsWith('Monthly') || title.startsWith('Yearly') || title.startsWith('Weekly')) {
      const scopeName = SCOPE_OPTIONS.find(s => s.id === scope)?.title || 'Lesson Plan';
      setTitle(`${scopeName}: Grade ${grade} ${subject} Instructional Framework`);
      setUnit(`Unit ${scope === 'yearly' ? '1–8' : scope === 'quarter' ? '1–2' : '3'}: Foundations & Advanced Applications in ${subject}`);
    }
  }, [scope, subject, grade, isExplicitlyCleared]);

  // Clear all fields in Dewey Curriculum Generator
  const handleClearFields = () => {
    setIsExplicitlyCleared(true);
    setTitle('');
    setUnit('');
    setTeacherName('');
    setStartTime('');
    setEndTime('');
    setClassPeriod('');
    setDailyDate('');
    setWeekNumber('');
    setWeekDateRange('');
    setWeekCommencing('');
    setWeeklyHours('');
    setWeeklyNotesAndEvaluations('');
    setTargetMonth('');
    setMonthlyHours('');
    setMonthlyTheme('');
    setAcademicYear('');
    setQuarterWeeks('');
    setYearlyTerms('');
    setStandards([]);
    setNewStandardInput('');
    setObjectives([]);
    setNewObjectiveInput('');
    setEssentialQuestions([]);
    setNewQuestionInput('');
    setMaterials([]);
    setNewMaterialInput('');
    setTimelineSteps([]);
    setWeeklyDays([
      {
        day: 'Monday',
        lessons: [
          { lessonName: 'Lesson 1', experiencesAndOutcomes: '', benchmarksForAssessment: '', resourcesRequired: '', evaluation: '' }
        ]
      },
      {
        day: 'Tuesday',
        lessons: [
          { lessonName: 'Lesson 1', experiencesAndOutcomes: '', benchmarksForAssessment: '', resourcesRequired: '', evaluation: '' }
        ]
      },
      {
        day: 'Wednesday',
        lessons: [
          { lessonName: 'Lesson 1', experiencesAndOutcomes: '', benchmarksForAssessment: '', resourcesRequired: '', evaluation: '' }
        ]
      },
      {
        day: 'Thursday',
        lessons: [
          { lessonName: 'Lesson 1', experiencesAndOutcomes: '', benchmarksForAssessment: '', resourcesRequired: '', evaluation: '' }
        ]
      },
      {
        day: 'Friday',
        lessons: [
          { lessonName: 'Lesson 1', experiencesAndOutcomes: '', benchmarksForAssessment: '', resourcesRequired: '', evaluation: '' }
        ]
      }
    ]);
    setFormativeAssessment('');
    setSummativeAssessment('');
    setSupportDiff('');
    setExtensionDiff('');
    setHomework('');
    setNotes('');

    setClearedToast(true);
    setTimeout(() => {
      setClearedToast(false);
    }, 2500);
  };

  // AI-Powered Lesson Plan Generator using Subject, Grade, Title, and Unit context
  const handleAiGenerateLessonPlan = async () => {
    setIsAiGenerating(true);
    setIsExplicitlyCleared(false);

    try {
      const response = await fetch('/api/gemini/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          title: title.trim() || undefined,
          unit: unit.trim() || undefined,
          scope,
          teacherName: teacherName.trim() || (currentUser?.name || 'Dewey Faculty Educator')
        })
      });

      const result = await response.json();
      if (result && result.success && result.data) {
        const data = result.data;

        if (data.title) setTitle(data.title);
        if (data.unit) setUnit(data.unit);
        if (data.teacherName) setTeacherName(data.teacherName);

        if (Array.isArray(data.standards) && data.standards.length > 0) {
          setStandards(data.standards.map((s: any) => typeof s === 'string' ? s : `${s.code || ''}: ${s.description || ''}`));
        }
        if (Array.isArray(data.objectives) && data.objectives.length > 0) {
          setObjectives(data.objectives.map((o: any) => typeof o === 'string' ? o : o.text || String(o)));
        }
        if (Array.isArray(data.essentialQuestions) && data.essentialQuestions.length > 0) {
          setEssentialQuestions(data.essentialQuestions.map((q: any) => typeof q === 'string' ? q : q.question || String(q)));
        }
        if (Array.isArray(data.materials) && data.materials.length > 0) {
          setMaterials(data.materials.map((m: any) => typeof m === 'string' ? m : m.name || String(m)));
        }

        if (Array.isArray(data.timelineSteps) && data.timelineSteps.length > 0) {
          setTimelineSteps(data.timelineSteps.map((st: any) => ({
            phase: st.phase || 'Instructional Step',
            timeSlot: st.timeSlot || 'Class Period',
            durationMin: Number(st.durationMin) || 15,
            teacherRole: st.teacherRole || 'Facilitate inquiry and guide student practice.',
            studentRole: st.studentRole || 'Engage in active collaborative tasks.'
          })));
        }

        if (Array.isArray(data.weeklyDays) && data.weeklyDays.length > 0) {
          setWeeklyDays(data.weeklyDays);
        }

        if (data.formativeAssessment) setFormativeAssessment(data.formativeAssessment);
        if (data.summativeAssessment) setSummativeAssessment(data.summativeAssessment);
        if (data.supportDiff) setSupportDiff(data.supportDiff);
        if (data.extensionDiff) setExtensionDiff(data.extensionDiff);
        if (data.homework) setHomework(data.homework);
        if (data.notes) setNotes(data.notes);
        if (data.monthlyHours) setMonthlyHours(data.monthlyHours);
        if (data.weeklyHours) setWeeklyHours(data.weeklyHours);
        if (data.quarterWeeks) setQuarterWeeks(data.quarterWeeks);
        if (data.yearlyTerms) setYearlyTerms(data.yearlyTerms);

        setAiToastMsg(`AI Generated: Grade ${grade} ${subject} Lesson Plan!`);
      } else {
        // Fallback to rich template if endpoint returns unexpected format
        handleAutoFillTemplate();
        setAiToastMsg(`Generated DIS Curriculum blueprint for Grade ${grade} ${subject}`);
      }
    } catch (err) {
      console.error('AI Lesson Plan Generation error:', err);
      handleAutoFillTemplate();
      setAiToastMsg(`Generated DIS Curriculum blueprint for Grade ${grade} ${subject}`);
    } finally {
      setIsAiGenerating(false);
      setTimeout(() => {
        setAiToastMsg(null);
      }, 4000);
    }
  };

  if (!isOpen) return null;

  // Auto-fill rich, realistic template based on scope + subject + grade
  const handleAutoFillTemplate = () => {
    setIsExplicitlyCleared(false);
    if (currentUser?.name) {
      setTeacherName(currentUser.name);
    }
    const scopeObj = SCOPE_OPTIONS.find(s => s.id === scope);
    setTitle(`${scopeObj?.title}: Grade ${grade} ${subject} Academic Mastery`);
    setUnit(`Unit ${scope === 'yearly' ? '1–8 Comprehensive Curriculum' : scope === 'quarter' ? '2: Advanced Principles' : scope === 'weekly' ? '3: Weekly Master Framework' : '1: Fundamentals'} of ${subject}`);
    
    // Auto-fill scope-specific timeline
    if (scope === 'daily') {
      setTimelineSteps([
        {
          phase: '1. Hook & Warm-Up (Engage)',
          timeSlot: `${startTime} - 10 mins in`,
          durationMin: 10,
          teacherRole: `Project provocative inquiry prompt related to Grade ${grade} ${subject}. Lead brief Think-Pair-Share.`,
          studentRole: 'Quick-write in reflection journals; share observations with seat partner.'
        },
        {
          phase: '2. Structured Investigation (Explore)',
          timeSlot: '10 mins - 25 mins',
          durationMin: 15,
          teacherRole: 'Distribute interactive digital flipbooks and facilitate student group inquiry stations.',
          studentRole: 'Collaborate in assigned pairs to analyze models, test hypotheses, and record evidence.'
        },
        {
          phase: '3. Explicit Modeling & Instruction (Explain)',
          timeSlot: '25 mins - 40 mins',
          durationMin: 15,
          teacherRole: `Synthesize findings on board; introduce core vocabulary and analytical frameworks for ${subject}.`,
          studentRole: 'Take structured Cornell notes and verify answers using textbook reference pages.'
        },
        {
          phase: '4. Guided Application & Mastery (Elaborate)',
          timeSlot: '40 mins - 52 mins',
          durationMin: 12,
          teacherRole: 'Circulate for targeted scaffolding; provide sentence starters for students needing support.',
          studentRole: 'Solve practice problems 1–5 on the Student Mastery Worksheet independently.'
        },
        {
          phase: '5. Exit Ticket & Wrap-Up (Evaluate)',
          timeSlot: '52 mins - 60 mins',
          durationMin: 8,
          teacherRole: 'Administer 3-question digital exit ticket and assign tonight’s extension reading.',
          studentRole: 'Submit exit ticket response and pack up instructional materials.'
        }
      ]);
    } else if (scope === 'weekly') {
      // Auto-fill Monday–Friday with subject-customized 4-lesson schedules matching the Weekly Lesson Planning Template
      setWeeklyDays([
        {
          day: 'Monday',
          lessons: [
            {
              lessonName: 'Lesson 1',
              experiencesAndOutcomes: `Introduce core foundational concepts and driving questions in Grade ${grade} ${subject}. Students link prior knowledge to upcoming topics.`,
              benchmarksForAssessment: 'Diagnostic Think-Pair-Share check; accurate initial concept definitions in notes.',
              resourcesRequired: 'Dewey Digital Flipbook, Interactive Whiteboard, Cornell Notes Journal.',
              evaluation: '88% of learners demonstrated baseline comprehension of core terminology.'
            },
            {
              lessonName: 'Lesson 2',
              experiencesAndOutcomes: `Direct instruction on essential mechanisms, mathematical formulas, and scientific/conceptual relationships in ${subject}.`,
              benchmarksForAssessment: 'Formative quick-check quiz (3 items); correct notation application.',
              resourcesRequired: 'Textbook reference pages, interactive diagram slides.',
              evaluation: 'Identified need for additional review on variable relationships during tomorrow’s lab.'
            },
            {
              lessonName: 'Lesson 3',
              experiencesAndOutcomes: 'Guided workstation inquiry: students collaborate in partner pairs to model mechanisms and record structured observations.',
              benchmarksForAssessment: 'Workstation observation rubric; evidence-based reasoning in pairs.',
              resourcesRequired: 'Laboratory exploration kits, digital data collection tables.',
              evaluation: 'Active peer collaboration; all groups completed data capture on schedule.'
            },
            {
              lessonName: 'Lesson 4',
              experiencesAndOutcomes: 'Independent application practice: complete practice problems 1–4 on Student Practice Worksheet.',
              benchmarksForAssessment: 'Worksheet accuracy check; self-assessment against scoring key.',
              resourcesRequired: 'Student Practice Worksheet (Set A), answer rubric.',
              evaluation: 'Target mastery achieved; homework assigned for reinforcement.'
            }
          ]
        },
        {
          day: 'Tuesday',
          lessons: [
            {
              lessonName: 'Lesson 1',
              experiencesAndOutcomes: `Review Monday findings and investigate real-world application case studies in ${subject}.`,
              benchmarksForAssessment: 'Opening retrieval warm-up response; oral explanation of mechanisms.',
              resourcesRequired: 'Digital case study slides, student study guides.',
              evaluation: 'Strong retrieval retention from Monday Lessons 1–2.'
            },
            {
              lessonName: 'Lesson 2',
              experiencesAndOutcomes: 'Collaborative problem-solving: analyze data sets, graph trends, and calculate variance.',
              benchmarksForAssessment: 'Proper chart formatting and gradient calculation accuracy.',
              resourcesRequired: 'Graph paper / iPad graphing tool, curated data sets.',
              evaluation: 'Scaffolded tier-2 support for students interpreting non-linear graphs.'
            },
            {
              lessonName: 'Lesson 3',
              experiencesAndOutcomes: 'Differentiated station rotations: targeted remediation clinic vs. advanced extension challenge.',
              benchmarksForAssessment: 'Station checkpoint tickets; mastery of target sub-skill.',
              resourcesRequired: 'Tiered worksheet cards, extension investigation prompt.',
              evaluation: 'Both groups successfully completed their assigned milestone.'
            },
            {
              lessonName: 'Lesson 4',
              experiencesAndOutcomes: 'Daily synthesis and formative exit reflection.',
              benchmarksForAssessment: 'Digital exit ticket submission with 80%+ accuracy.',
              resourcesRequired: 'Dewey student portal exit ticket module.',
              evaluation: 'Ready to proceed to experimental verification on Wednesday.'
            }
          ]
        },
        {
          day: 'Wednesday',
          lessons: [
            {
              lessonName: 'Lesson 1',
              experiencesAndOutcomes: 'Pre-lab briefing and safety protocols for structured inquiry experiment.',
              benchmarksForAssessment: 'Safety protocol checklist verification and lab hypothesis approval.',
              resourcesRequired: 'Safety guidelines, experiment briefing sheet.',
              evaluation: '100% compliance with laboratory safety regulations.'
            },
            {
              lessonName: 'Lesson 2',
              experiencesAndOutcomes: 'Hands-on laboratory experiment: students test variables and record quantitative data.',
              benchmarksForAssessment: 'Measurement precision check; systematic data logging.',
              resourcesRequired: 'Lab apparatus (Set B), digital sensor probes.',
              evaluation: 'High engagement; experimental results aligned with predicted values.'
            },
            {
              lessonName: 'Lesson 3',
              experiencesAndOutcomes: 'Post-lab data analysis and error margin discussion in small groups.',
              benchmarksForAssessment: 'Calculated percent error and valid justification of discrepancies.',
              resourcesRequired: 'Scientific calculator, post-lab synthesis guide.',
              evaluation: 'Students articulated sources of experimental variance clearly.'
            },
            {
              lessonName: 'Lesson 4',
              experiencesAndOutcomes: 'Mid-week review summary and draft lab report section.',
              benchmarksForAssessment: 'Peer review rubric on lab report methodology draft.',
              resourcesRequired: 'Lab report template, peer feedback rubric.',
              evaluation: 'Constructive peer feedback provided across all pairs.'
            }
          ]
        },
        {
          day: 'Thursday',
          lessons: [
            {
              lessonName: 'Lesson 1',
              experiencesAndOutcomes: `Deep-dive inquiry into interdisciplinary connections and technological developments in ${subject}.`,
              benchmarksForAssessment: 'Group discussion contributions and Socratic inquiry responses.',
              resourcesRequired: 'Digital reading excerpt, multimedia video case.',
              evaluation: 'Stimulating class dialogue linking concepts to modern technology.'
            },
            {
              lessonName: 'Lesson 2',
              experiencesAndOutcomes: 'Guided practice on complex multi-step analytical synthesis questions.',
              benchmarksForAssessment: 'Step-by-step problem breakdown on individual dry-erase boards.',
              resourcesRequired: 'Mini whiteboards, exam-style practice questions.',
              evaluation: 'Targeted support provided for multi-variable equations.'
            },
            {
              lessonName: 'Lesson 3',
              experiencesAndOutcomes: 'Collaborative peer tutoring and revision seminar for weekly mastery check.',
              benchmarksForAssessment: 'Comprehensive practice quiz self-scoring against standard.',
              resourcesRequired: 'Revision flashcards, practice exam booklet.',
              evaluation: 'Identified remaining focus areas prior to Friday assessment.'
            },
            {
              lessonName: 'Lesson 4',
              experiencesAndOutcomes: 'Review key vocabulary and finalize weekly study guide summaries.',
              benchmarksForAssessment: 'Complete vocabulary cross-check and study guide portfolio.',
              resourcesRequired: 'Dewey Digital Study Portal & Reference Glossary.',
              evaluation: 'Students prepared for weekly cumulative examination.'
            }
          ]
        },
        {
          day: 'Friday',
          lessons: [
            {
              lessonName: 'Lesson 1',
              experiencesAndOutcomes: 'Weekly Retrieval Warm-Up & Final Q&A Clarification Clinic.',
              benchmarksForAssessment: 'Rapid-fire verbal check; clarification of final edge cases.',
              resourcesRequired: 'Review summary slides, student questions queue.',
              evaluation: 'High student confidence going into assessment.'
            },
            {
              lessonName: 'Lesson 2',
              experiencesAndOutcomes: `Weekly Cumulative Competency Assessment on Grade ${grade} ${subject} Unit concepts.`,
              benchmarksForAssessment: 'Formal summative assessment examination (Criterion: 80%+ mastery).',
              resourcesRequired: 'Printed examination papers / secure digital testing terminal.',
              evaluation: 'Assessment conducted securely under standardized exam conditions.'
            },
            {
              lessonName: 'Lesson 3',
              experiencesAndOutcomes: 'Immediate post-exam reflective analysis and self-correction review.',
              benchmarksForAssessment: 'Error analysis log documenting reason for any missed items.',
              resourcesRequired: 'Examination marking rubric, error reflection guide.',
              evaluation: 'Learners demonstrated growth through metacognitive error analysis.'
            },
            {
              lessonName: 'Lesson 4',
              experiencesAndOutcomes: 'Weekly synthesis wrap-up, capstone showcase, and preview of upcoming unit.',
              benchmarksForAssessment: 'Weekly learning portfolio submission and weekend reading preview.',
              resourcesRequired: 'Portfolio binder / Dewey Cloud Storage, next unit syllabus.',
              evaluation: 'Week successfully concluded with 92% overall class competency.'
            }
          ]
        }
      ]);

      setWeeklyNotesAndEvaluations(
        `Weekly Notes & Evaluations for Grade ${grade} ${subject}:\n• Instructional pacing across Monday–Friday maintained strong student engagement.\n• All laboratory workstations for Wednesday experiment complied with DIS safety standards.\n• Friday cumulative assessment revealed 92% cohort mastery; extension challenges provided for high-achieving scholars.\n• Action Item for Next Week: Begin with a 10-minute reinforcement on complex graphical analysis.`
      );

      // Also set synthesis timeline
      setTimelineSteps([
        {
          phase: 'Monday: Core Concept Introduction & Inquiry Hook (Lessons 1–4)',
          timeSlot: 'Monday (4 Lessons)',
          durationMin: 180,
          teacherRole: `Introduce weekly unit driving questions for Grade ${grade} ${subject}. Direct modeling & guided workstation exploration.`,
          studentRole: 'Formulate hypotheses, take Cornell notes, and complete practice set 1.'
        },
        {
          phase: 'Tuesday: Data Analysis, Real-World Cases & Differentiated Stations (Lessons 1–4)',
          timeSlot: 'Tuesday (4 Lessons)',
          durationMin: 180,
          teacherRole: 'Facilitate data analysis seminars, tiered remediation clinics, and extension stations.',
          studentRole: 'Construct trend graphs, complete tiered mastery tickets, and submit exit reflections.'
        },
        {
          phase: 'Wednesday: Hands-On Laboratory Investigation & Error Analysis (Lessons 1–4)',
          timeSlot: 'Wednesday (4 Lessons)',
          durationMin: 180,
          teacherRole: 'Direct laboratory safety protocol briefing and supervise variable experiments.',
          studentRole: 'Collect quantitative empirical data, calculate variance, and draft lab methodology.'
        },
        {
          phase: 'Thursday: Interdisciplinary STEM Application & Exam Revision (Lessons 1–4)',
          timeSlot: 'Thursday (4 Lessons)',
          durationMin: 180,
          teacherRole: 'Guide multi-step analytical problem breakdowns and moderate peer tutoring groups.',
          studentRole: 'Complete mini-whiteboard problem solving and finalize weekly study guide.'
        },
        {
          phase: 'Friday: Weekly Cumulative Assessment & Portfolio Showcase (Lessons 1–4)',
          timeSlot: 'Friday (4 Lessons)',
          durationMin: 180,
          teacherRole: 'Administer standardized weekly competency examination and evaluate reflections.',
          studentRole: 'Sit for cumulative exam, conduct self-error analysis, and submit weekly portfolio.'
        }
      ]);
    } else if (scope === 'monthly') {
      setTimelineSteps([
        {
          phase: 'Week 1: Foundational Theories & Diagnostic Baseline',
          timeSlot: 'Week 1 (8 Hours)',
          durationMin: 480,
          teacherRole: `Introduce month-long curriculum theme for ${subject} Grade ${grade}. Conduct pre-assessment.`,
          studentRole: 'Establish personal learning goals and complete initial diagnostic review.'
        },
        {
          phase: 'Week 2: Deep Exploration & Guided Investigations',
          timeSlot: 'Week 2 (8 Hours)',
          durationMin: 480,
          teacherRole: 'Deliver core instructional units, supervise laboratory investigations, and facilitate breakouts.',
          studentRole: 'Complete chapters 1–3 in Dewey Flipbook reader and submit midterm lab data report.'
        },
        {
          phase: 'Week 3: Advanced Application & Case Study Synthesis',
          timeSlot: 'Week 3 (8 Hours)',
          durationMin: 480,
          teacherRole: 'Direct complex problem-solving seminars and review authentic real-world engineering/science cases.',
          studentRole: 'Develop collaborative case study presentation and draft technical project paper.'
        },
        {
          phase: 'Week 4: Unit Mastery Assessment & Capstone Presentations',
          timeSlot: 'Week 4 (8 Hours)',
          durationMin: 480,
          teacherRole: 'Evaluate monthly capstone presentations and administer comprehensive monthly exam.',
          studentRole: 'Deliver capstone group presentation and complete unit mastery examination.'
        }
      ]);
    } else if (scope === 'quarter') {
      setTimelineSteps([
        {
          phase: 'Weeks 1–3: Core Module 1 (Foundations & Analytical Tools)',
          timeSlot: 'Weeks 1–3 (24 Hours)',
          durationMin: 1440,
          teacherRole: `Direct instruction on foundational ${subject} laws, safety protocols, and digital reader orientation.`,
          studentRole: 'Master prerequisite concepts, complete weekly worksheets, and achieve 85%+ on Quiz 1.'
        },
        {
          phase: 'Weeks 4–6: Core Module 2 (Intermediate Applications & Lab Inquiry)',
          timeSlot: 'Weeks 4–6 (24 Hours)',
          durationMin: 1440,
          teacherRole: 'Supervise multi-week laboratory research project; provide intermediate rubrics and feedback.',
          studentRole: 'Conduct inquiry experiments, record ongoing data logs, and take Mid-Quarter Benchmark Exam.'
        },
        {
          phase: 'Weeks 7–9: Core Module 3 (Synthesis, Advanced Projects & Final Exams)',
          timeSlot: 'Weeks 7–9 (24 Hours)',
          durationMin: 1440,
          teacherRole: 'Facilitate comprehensive quarter review clinics, grade capstones, and submit quarter marks.',
          studentRole: 'Submit formal research portfolio, present capstone project, and sit for Quarter Exam.'
        }
      ]);
    } else if (scope === 'yearly') {
      setTimelineSteps([
        {
          phase: 'Quarter 1: Foundations, Inquiry Methods & Baseline Competency',
          timeSlot: 'Term 1 (Aug–Oct, 45 Hours)',
          durationMin: 2700,
          teacherRole: `Establish classroom norms, introduce annual ${subject} curriculum roadmap, and conduct pre-assessments.`,
          studentRole: 'Build strong core conceptual foundations and complete Q1 student portfolios.'
        },
        {
          phase: 'Quarter 2: Core Analytical Systems, Modeling & Mid-Year Projects',
          timeSlot: 'Term 2 (Nov–Jan, 45 Hours)',
          durationMin: 2700,
          teacherRole: 'Deliver advanced thematic units, oversee midterm research symposia, and conduct Semester 1 exams.',
          studentRole: 'Complete independent research milestone and sit for Semester 1 Comprehensive Examination.'
        },
        {
          phase: 'Quarter 3: Advanced Applications, Interdisciplinary STEM & Lab Protocols',
          timeSlot: 'Term 3 (Feb–Apr, 45 Hours)',
          durationMin: 2700,
          teacherRole: 'Guide higher-order critical thinking modules and mentor science/math competition projects.',
          studentRole: 'Participate in interdisciplinary exhibitions and complete high-rigor problem sets.'
        },
        {
          phase: 'Quarter 4: Comprehensive Review, Capstone Defense & Annual Mastery',
          timeSlot: 'Term 4 (May–Jun, 45 Hours)',
          durationMin: 2700,
          teacherRole: 'Lead final review intensives, evaluate annual defense portfolios, and finalize graduation standards.',
          studentRole: 'Defend annual capstone portfolio and complete final institutional competency evaluations.'
        }
      ]);
    }
  };

  const handleAddTimelineStep = () => {
    setTimelineSteps(prev => [
      ...prev,
      {
        phase: `Phase ${prev.length + 1}: Instructional Activity`,
        timeSlot: scope === 'daily' ? '10 min' : scope === 'weekly' ? `Day ${prev.length + 1}` : `Week ${prev.length + 1}`,
        durationMin: 15,
        teacherRole: 'Facilitate structured learning activity and provide guidance.',
        studentRole: 'Participate actively and complete assigned practice task.'
      }
    ]);
  };

  const handleRemoveTimelineStep = (index: number) => {
    setTimelineSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTimelineStep = (index: number, field: keyof LessonPlanTimelineStep, value: any) => {
    setTimelineSteps(prev => prev.map((step, i) => i === index ? { ...step, [field]: value } : step));
  };

  const handleUpdateWeeklyLesson = (
    dayName: string,
    lessonIndex: number,
    field: keyof WeeklyLessonEntry,
    value: string
  ) => {
    setWeeklyDays(prev =>
      prev.map(dayObj => {
        if (dayObj.day !== dayName) return dayObj;
        const newLessons = [...dayObj.lessons];
        newLessons[lessonIndex] = {
          ...newLessons[lessonIndex],
          [field]: value
        };
        return {
          ...dayObj,
          lessons: newLessons
        };
      })
    );
  };

  const handleAddLessonToDay = (dayName: string) => {
    setWeeklyDays(prev =>
      prev.map(dayObj => {
        if (dayObj.day !== dayName) return dayObj;
        const nextNum = dayObj.lessons.length + 1;
        return {
          ...dayObj,
          lessons: [
            ...dayObj.lessons,
            {
              lessonName: `Lesson ${nextNum}`,
              experiencesAndOutcomes: '',
              benchmarksForAssessment: '',
              resourcesRequired: '',
              evaluation: ''
            }
          ]
        };
      })
    );
  };

  const handleRemoveLessonFromDay = (dayName: string, lessonIndex: number) => {
    setWeeklyDays(prev =>
      prev.map(dayObj => {
        if (dayObj.day !== dayName) return dayObj;
        return {
          ...dayObj,
          lessons: dayObj.lessons.filter((_, idx) => idx !== lessonIndex)
        };
      })
    );
  };

  const handleAddStandard = () => {
    if (newStandardInput.trim()) {
      setStandards(prev => [...prev, newStandardInput.trim()]);
      setNewStandardInput('');
    }
  };

  const handleAddObjective = () => {
    if (newObjectiveInput.trim()) {
      setObjectives(prev => [...prev, newObjectiveInput.trim()]);
      setNewObjectiveInput('');
    }
  };

  const handleAddQuestion = () => {
    if (newQuestionInput.trim()) {
      setEssentialQuestions(prev => [...prev, newQuestionInput.trim()]);
      setNewQuestionInput('');
    }
  };

  const handleAddMaterial = () => {
    if (newMaterialInput.trim()) {
      setMaterials(prev => [...prev, newMaterialInput.trim()]);
      setNewMaterialInput('');
    }
  };

  // Construct final LessonPlanItem object
  const buildPlanObject = (): LessonPlanItem => {
    let computedDuration = `${durationMinutes} Minutes`;
    let timeDetailsObj: LessonPlanItem['timeDetails'] = {};

    if (scope === 'daily') {
      computedDuration = `${durationMinutes} Minutes (${startTime} - ${endTime})`;
      timeDetailsObj = {
        dateRange: dailyDate,
        startTime,
        endTime,
        classPeriod,
        totalHours: durationMinutes / 60
      };
    } else if (scope === 'weekly') {
      computedDuration = `Week Commencing: ${weekCommencing} • 20 Lessons (Monday–Friday)`;
      timeDetailsObj = {
        weekNumber,
        dateRange: `Week Commencing: ${weekCommencing}`,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        classPeriod
      };
    } else if (scope === 'monthly') {
      computedDuration = `${targetMonth} • ${monthlyHours}`;
      timeDetailsObj = {
        month: targetMonth,
        academicYear,
        totalHours: parseInt(monthlyHours) || 36
      };
    } else if (scope === 'quarter') {
      computedDuration = `${targetQuarter} • ${quarterWeeks}`;
      timeDetailsObj = {
        quarter: targetQuarter,
        academicYear,
        totalHours: 72
      };
    } else if (scope === 'yearly') {
      computedDuration = `Academic Year ${academicYear} • ${yearlyTerms}`;
      timeDetailsObj = {
        academicYear,
        totalHours: 180
      };
    }

    return {
      id: `lp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim() || `Weekly Lesson Planning: Grade ${grade} ${subject}`,
      unit: unit.trim() || `Unit 1: ${subject} Studies`,
      grade,
      subject,
      scope,
      duration: computedDuration,
      weekCommencing,
      weeklyDays,
      weeklyNotesAndEvaluations,
      timeDetails: timeDetailsObj,
      teacherName: teacherName.trim() || currentUser?.name || 'Dewey Faculty Educator',
      curriculumStandards: standards,
      learningObjectives: objectives,
      essentialQuestions,
      requiredMaterials: materials,
      timeline: timelineSteps,
      formativeAssessment,
      summativeAssessment,
      differentiation: {
        support: supportDiff,
        extension: extensionDiff
      },
      homeworkAssignment: homework,
      notes: notes || weeklyNotesAndEvaluations,
      monthlyTheme: monthlyTheme,
      monthlyWeeklyBreakdown: weeklyBreakdown,
      createdAt: new Date().toISOString(),
      createdByUserId: currentUser?.id,
      createdByUserEmail: currentUser?.email,
      createdByRole: currentUser?.role || 'Educator',
      createdByDepartment: currentUser?.department || 'Academic Faculty'
    };
  };

  const handleSave = () => {
    const plan = buildPlanObject();
    onSavePlan(plan);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      onClose();
    }, 1500);
  };

  const handleDownload = () => {
    const plan = buildPlanObject();
    downloadLessonPlanDocument(plan);
  };

  const handlePrint = () => {
    const plan = buildPlanObject();
    printLessonPlanDocument(plan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-md border border-blue-400/20">
                  Dewey Curriculum Generator
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  • Aligned with DIS Standards
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Create Comprehensive Lesson Plan
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="curriculum-generator-clear-fields-btn"
              type="button"
              onClick={handleClearFields}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 shadow-2xs cursor-pointer"
              title="Clear all fields in Dewey Curriculum Generator"
            >
              <RotateCcw size={13} className="text-rose-400" />
              <span className="hidden sm:inline">Clear Fields</span>
              <span className="sm:hidden">Clear</span>
            </button>

            <button
              id="curriculum-generator-autofill-btn"
              type="button"
              onClick={handleAutoFillTemplate}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border border-slate-700 cursor-pointer"
              title="One-click fill with DIS Standard Curriculum Template"
            >
              <FileText size={13} className="text-blue-400" />
              <span className="hidden sm:inline">DIS Template</span>
              <span className="sm:hidden">Template</span>
            </button>

            <button
              id="curriculum-generator-ai-header-btn"
              type="button"
              disabled={isAiGenerating}
              onClick={handleAiGenerateLessonPlan}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/25 border border-purple-400/40 cursor-pointer disabled:opacity-50"
              title="AI Generate Comprehensive Lesson Plan based on Subject, Grade, Topic & Unit Context"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  <span className="hidden sm:inline">AI Generating...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-300 animate-pulse" />
                  <span className="hidden sm:inline">AI Generate Plan</span>
                  <span className="sm:hidden">AI Generate</span>
                </>
              )}
            </button>

            <button
              id="curriculum-generator-preview-header-btn"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border border-amber-400/30 cursor-pointer"
              title="Open Print Preview of Current Lesson Plan"
            >
              <Printer size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Print Preview</span>
              <span className="sm:hidden">Preview</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Tabs & Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
          {/* 1. Scope Selector (Yearly, Quarter, Monthly, Weekly, Daily) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  1. Select Planning Scope & Timeframe
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Choose from full academic year curriculum maps down to exact daily class sessions.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                Active: {SCOPE_OPTIONS.find(s => s.id === scope)?.title}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {SCOPE_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = scope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setScope(opt.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-blue-50/90 to-white border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                        <IconComponent size={16} />
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {opt.title}
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                        {opt.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Core Curriculum Metadata (Subject, Grade, Title, Unit, Teacher) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
              2. Subject & Grade Classification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subject / Discipline *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 hover:border-orange-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none transition-all shadow-2xs"
                >
                  {SUBJECTS_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Grade Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Grade Level *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 hover:border-orange-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none transition-all shadow-2xs"
                >
                  {GRADES_LIST.map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              {/* Teacher / Author */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Educator / Instructor Name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Dr. Sabrina Bour"
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 hover:border-orange-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 hover:border-orange-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Plan Title and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Plan Title / Focus Topic *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cellular Respiration & ATP Synthesis"
                  className="w-full px-3 py-2 bg-orange-50/90 border border-orange-300 hover:border-orange-400 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Curriculum Unit / Module Context
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. Unit 3: Bioenergetics & Metabolic Systems"
                  className="w-full px-3 py-2 bg-orange-50/90 border border-orange-300 hover:border-orange-400 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* AI Generator Contextual Trigger Bar */}
            <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-blue-50/70 p-3.5 sm:p-4 rounded-2xl border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-purple-500/30">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-700 text-white px-2 py-0.5 rounded-md">
                      AI Plan Generator
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Context-Aware Curriculum Synthesis
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Analyzes: <span className="font-bold text-purple-900">{subject}</span> • <span className="font-bold text-purple-900">Grade {grade}</span> • <span className="font-bold text-purple-900 truncate max-w-[180px] inline-block align-bottom">{title || 'Topic Focus'}</span> • <span className="font-bold text-purple-900 truncate max-w-[180px] inline-block align-bottom">{unit || 'Unit Context'}</span>
                  </p>
                </div>
              </div>

              <button
                id="curriculum-generator-section2-ai-btn"
                type="button"
                disabled={isAiGenerating}
                onClick={handleAiGenerateLessonPlan}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 border border-purple-400/30 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Synthesizing Plan...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} className="text-amber-300" />
                    <span>AI Generate Lesson Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Scope-Specific Time & Schedule Breakdown Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                3. Time & Schedule Configuration ({SCOPE_OPTIONS.find(s => s.id === scope)?.title})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Customized for {scope.toUpperCase()} scope
              </span>
            </div>

            {/* Daily Inputs */}
            {scope === 'daily' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lesson Date
                  </label>
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Period / Room
                  </label>
                  <input
                    type="text"
                    value={classPeriod}
                    onChange={(e) => setClassPeriod(e.target.value)}
                    placeholder="Period 2 (Room 302)"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start & End Time
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="08:30 AM"
                      className="w-1/2 px-2 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 text-center focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="09:30 AM"
                      className="w-1/2 px-2 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 text-center focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={15}
                    max={240}
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Weekly Inputs */}
            {scope === 'weekly' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Week Commencing *
                  </label>
                  <input
                    type="text"
                    value={weekCommencing}
                    onChange={(e) => setWeekCommencing(e.target.value)}
                    placeholder="e.g. 25 August 2026"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Week Identifier
                  </label>
                  <input
                    type="text"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    placeholder="Week 1 (Term 1)"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weekly Teaching Volume
                  </label>
                  <input
                    type="text"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    placeholder="5 Days • 20 Lessons Total"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Monthly Inputs */}
            {scope === 'monthly' && (
              <div className="space-y-4 bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Thematic Focus</label>
                    <input type="text" value={monthlyTheme} onChange={(e) => setMonthlyTheme(e.target.value)} className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Month & Year</label>
                    <input type="text" value={targetMonth} onChange={(e) => setTargetMonth(e.target.value)} className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs" />
                  </div>
                </div>

                {/* Weekly Breakdown Table */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">🗓️ Weekly Breakdown</label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-orange-100/50">
                          <th className="p-1 border border-orange-200">Week</th>
                          <th className="p-1 border border-orange-200">Topic</th>
                          <th className="p-1 border border-orange-200">Objectives</th>
                          <th className="p-1 border border-orange-200">Activities</th>
                          <th className="p-1 border border-orange-200">Resources</th>
                          <th className="p-1 border border-orange-200">Assessment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyBreakdown.map((row, index) => (
                          <tr key={index}>
                            <td className="p-1 border border-orange-200 font-semibold">{row.week}</td>
                            {(['topic', 'objectives', 'activities', 'resources', 'assessment'] as const).map(field => (
                              <td key={field} className="p-0 border border-orange-200">
                                <input type="text" value={row[field]} onChange={(e) => {
                                  const next = [...weeklyBreakdown];
                                  next[index][field] = e.target.value;
                                  setWeeklyBreakdown(next);
                                }} className="w-full px-1 py-1 bg-transparent focus:bg-white" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Quarter Inputs */}
            {scope === 'quarter' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quarter / Term Selection
                  </label>
                  <select
                    value={targetQuarter}
                    onChange={(e) => setTargetQuarter(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  >
                    <option value="Q1">Quarter 1 (Fall Term)</option>
                    <option value="Q2">Quarter 2 (Winter Term)</option>
                    <option value="Q3">Quarter 3 (Spring Term)</option>
                    <option value="Q4">Quarter 4 (Summer Term)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weeks & Hours Allocated
                  </label>
                  <input
                    type="text"
                    value={quarterWeeks}
                    onChange={(e) => setQuarterWeeks(e.target.value)}
                    placeholder="9 Weeks (72 Total Hours)"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Yearly Inputs */}
            {scope === 'yearly' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year Scope
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025-2026 Academic Year"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Terms & Total Instructional Days
                  </label>
                  <input
                    type="text"
                    value={yearlyTerms}
                    onChange={(e) => setYearlyTerms(e.target.value)}
                    placeholder="4 Quarters / 2 Semesters (180 Teaching Days)"
                    className="w-full px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Interactive Schedule & Instructional Timeline Matrix */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            {scope === 'weekly' ? (
              /* Weekly Plan Template Matrix */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        4. Weekly Lesson Planning Matrix (Monday – Friday)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-700 border border-violet-200">
                        20 Instructional Periods
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Structured daily schedule: Links to Experiences & Outcomes, Benchmarks for Assessment, Resources, and Evaluations.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Week Commencing:</span>
                    <span className="text-xs font-black text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
                      {weekCommencing || 'Not Set'}
                    </span>
                  </div>
                </div>

                {/* Day Navigation Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
                  {weeklyDays.map((dayObj) => {
                    const isActive = activeWeeklyDay === dayObj.day;
                    return (
                      <button
                        key={dayObj.day}
                        type="button"
                        onClick={() => setActiveWeeklyDay(dayObj.day as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                          isActive
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-600/30 ring-2 ring-violet-400/30'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{dayObj.day}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10.5px] font-black ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {dayObj.lessons.length} {dayObj.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Day Lessons Table / List */}
                {(() => {
                  const currentDayObj = weeklyDays.find(d => d.day === activeWeeklyDay) || weeklyDays[0];
                  if (!currentDayObj) return null;

                  return (
                    <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                            {currentDayObj.day} Instructional Schedule
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            ({currentDayObj.lessons.length} planned lessons)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddLessonToDay(currentDayObj.day)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <Plus size={13} />
                          <span>Add Lesson to {currentDayObj.day}</span>
                        </button>
                      </div>

                      {/* Lesson Cards */}
                      <div className="space-y-3">
                        {currentDayObj.lessons.map((lesson, lIdx) => (
                          <div
                            key={lIdx}
                            className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-violet-300 transition-all space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-6 h-6 rounded-lg bg-violet-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                  {lIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={lesson.lessonName}
                                  onChange={(e) => handleUpdateWeeklyLesson(currentDayObj.day, lIdx, 'lessonName', e.target.value)}
                                  placeholder={`Lesson ${lIdx + 1} Title`}
                                  className="w-full max-w-xs px-2.5 py-1 bg-orange-50/80 border border-orange-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 shadow-2xs"
                                />
                              </div>

                              {currentDayObj.lessons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLessonFromDay(currentDayObj.day, lIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Links to Experiences and Outcomes:
                                </label>
                                <textarea
                                  rows={2}
                                  value={lesson.experiencesAndOutcomes}
                                  onChange={(e) => handleUpdateWeeklyLesson(currentDayObj.day, lIdx, 'experiencesAndOutcomes', e.target.value)}
                                  placeholder="Curriculum outcome links, core competencies, and targeted inquiry skills..."
                                  className="w-full px-2.5 py-1.5 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Benchmarks for Assessment:
                                </label>
                                <textarea
                                  rows={2}
                                  value={lesson.benchmarksForAssessment}
                                  onChange={(e) => handleUpdateWeeklyLesson(currentDayObj.day, lIdx, 'benchmarksForAssessment', e.target.value)}
                                  placeholder="Observable criteria, formative checkpoints, and scoring expectations..."
                                  className="w-full px-2.5 py-1.5 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Resources Required:
                                </label>
                                <textarea
                                  rows={2}
                                  value={lesson.resourcesRequired}
                                  onChange={(e) => handleUpdateWeeklyLesson(currentDayObj.day, lIdx, 'resourcesRequired', e.target.value)}
                                  placeholder="Dewey flipbooks, worksheets, laboratory equipment, digital media..."
                                  className="w-full px-2.5 py-1.5 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Evaluation:
                                </label>
                                <textarea
                                  rows={2}
                                  value={lesson.evaluation}
                                  onChange={(e) => handleUpdateWeeklyLesson(currentDayObj.day, lIdx, 'evaluation', e.target.value)}
                                  placeholder="Reflective evaluation notes, student progress metrics, and follow-ups..."
                                  className="w-full px-2.5 py-1.5 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Page 6: Weekly Notes and Evaluations */}
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-950 uppercase tracking-wider block">
                      📝 Weekly Notes and Evaluations (End of Week Synthesis)
                    </label>
                    <span className="text-[11px] font-bold text-amber-700">Page 6 Summary</span>
                  </div>
                  <textarea
                    rows={3}
                    value={weeklyNotesAndEvaluations}
                    onChange={(e) => setWeeklyNotesAndEvaluations(e.target.value)}
                    placeholder="Weekly summary reflections, cohort mastery levels, laboratory safety notes, and curriculum pacing adjustments for next week..."
                    className="w-full px-3 py-2 bg-orange-50/90 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                  />
                </div>
              </div>
            ) : (
              /* Non-Weekly Timeline Steps */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      4. Structured Instructional Schedule & Roadmap
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                      {scope === 'daily' ? '5E instructional phases with exact minute slots' 
                       : scope === 'monthly' ? 'Weekly module progression & benchmarks'
                       : scope === 'quarter' ? '3-week core modules & exam milestones'
                       : 'Quarterly terms & annual pacing guide'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTimelineStep}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto border border-slate-300"
                  >
                    <Plus size={14} />
                    <span>Add Time Block / Phase</span>
                  </button>
                </div>

                {/* Timeline Steps Cards */}
                <div className="space-y-3">
                  {timelineSteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl bg-orange-50/30 border border-orange-200/70 hover:border-orange-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step.phase}
                            onChange={(e) => handleUpdateTimelineStep(idx, 'phase', e.target.value)}
                            placeholder="Phase Name (e.g. Direct Instruction & Modeling)"
                            className="flex-1 px-2.5 py-1 bg-orange-50/80 border border-orange-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 shadow-2xs"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={step.timeSlot || ''}
                            onChange={(e) => handleUpdateTimelineStep(idx, 'timeSlot', e.target.value)}
                            placeholder="Time / Slot (e.g. 15 min)"
                            className="w-28 px-2 py-1 bg-orange-50/80 border border-orange-200 rounded-lg text-xs font-semibold text-orange-800 text-center focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 shadow-2xs"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveTimelineStep(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete phase"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Educator Facilitation & Instructional Strategy:
                          </label>
                          <textarea
                            rows={2}
                            value={step.teacherRole}
                            onChange={(e) => handleUpdateTimelineStep(idx, 'teacherRole', e.target.value)}
                            placeholder="Teacher actions, questions, modeling, and demonstration..."
                            className="w-full px-2.5 py-1.5 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-slate-800 font-medium focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Student Learning Tasks & Active Deliverables:
                          </label>
                          <textarea
                            rows={2}
                            value={step.studentRole}
                            onChange={(e) => handleUpdateTimelineStep(idx, 'studentRole', e.target.value)}
                            placeholder="Student tasks, partner discussions, worksheet problems..."
                            className="w-full px-2.5 py-1.5 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-slate-800 font-medium focus:bg-orange-50 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none resize-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 5. Standards, Objectives, Essential Questions & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Learning Objectives */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                🎯 Learning Objectives & Competencies
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 bg-orange-50/70 p-2 rounded-lg border border-orange-200/80">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span className="flex-1 font-medium">{obj}</span>
                    <button
                      type="button"
                      onClick={() => setObjectives(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newObjectiveInput}
                  onChange={(e) => setNewObjectiveInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                  placeholder="Add learning objective..."
                  className="flex-1 px-3 py-1.5 bg-orange-50/80 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-500 shadow-2xs"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Essential Questions */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                💡 Essential Questions
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {essentialQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 bg-orange-50/70 p-2 rounded-lg border border-orange-200/80">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span className="flex-1 font-medium">{q}</span>
                    <button
                      type="button"
                      onClick={() => setEssentialQuestions(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newQuestionInput}
                  onChange={(e) => setNewQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                  placeholder="Add essential question..."
                  className="flex-1 px-3 py-1.5 bg-orange-50/80 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-500 shadow-2xs"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Curriculum Standards */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                📜 Curriculum Standards Alignment
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {standards.map((std, i) => (
                  <li key={i} className="flex items-start gap-2 bg-orange-50/70 p-2 rounded-lg border border-orange-200/80">
                    <span className="text-orange-700 font-bold mt-0.5">•</span>
                    <span className="flex-1 font-medium">{std}</span>
                    <button
                      type="button"
                      onClick={() => setStandards(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newStandardInput}
                  onChange={(e) => setNewStandardInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStandard())}
                  placeholder="e.g. DIS-MATH.G9.02..."
                  className="flex-1 px-3 py-1.5 bg-orange-50/80 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddStandard}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-500 shadow-2xs"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Required Materials */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                📦 Required Materials & Digital Media
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {materials.map((mat, i) => (
                  <li key={i} className="flex items-start gap-2 bg-orange-50/70 p-2 rounded-lg border border-orange-200/80">
                    <span className="text-emerald-700 font-bold mt-0.5">•</span>
                    <span className="flex-1 font-medium">{mat}</span>
                    <button
                      type="button"
                      onClick={() => setMaterials(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newMaterialInput}
                  onChange={(e) => setNewMaterialInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
                  placeholder="e.g. Dewey Digital Flipbook Reader..."
                  className="flex-1 px-3 py-1.5 bg-orange-50/80 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 shadow-2xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* 6. Assessment, Differentiation & Reflection */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
              5. Differentiation, Assessment & Pedagogical Notes
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Formative Assessment & Checkpoints:
                </label>
                <textarea
                  rows={2}
                  value={formativeAssessment}
                  onChange={(e) => setFormativeAssessment(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Summative Assessment & Deliverables:
                </label>
                <textarea
                  rows={2}
                  value={summativeAssessment}
                  onChange={(e) => setSummativeAssessment(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Support Scaffolding (ESL / Remediation):
                </label>
                <textarea
                  rows={2}
                  value={supportDiff}
                  onChange={(e) => setSupportDiff(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Extension & Challenge (Gifted / Advanced):
                </label>
                <textarea
                  rows={2}
                  value={extensionDiff}
                  onChange={(e) => setExtensionDiff(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Homework Assignment / Independent Extension:
                </label>
                <input
                  type="text"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/80 border border-orange-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-orange-50 focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="bg-white px-5 py-4 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {aiToastMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 animate-in fade-in">
                <Sparkles size={15} className="text-purple-600 animate-pulse" />
                <span>{aiToastMsg}</span>
              </span>
            )}
            {clearedToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 animate-in fade-in">
                <CheckCircle2 size={15} className="text-rose-600" />
                <span>All Curriculum Fields Cleared!</span>
              </span>
            )}
            {saveSuccessToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                <CheckCircle2 size={15} />
                <span>Lesson Plan Saved to Hub!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="curriculum-generator-footer-clear-btn"
              type="button"
              onClick={handleClearFields}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reset all form fields to blank"
            >
              <RotateCcw size={13} className="text-rose-500" />
              <span>Clear All</span>
            </button>

            <button
              id="curriculum-generator-footer-ai-btn"
              type="button"
              disabled={isAiGenerating}
              onClick={handleAiGenerateLessonPlan}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 border border-purple-400/30 cursor-pointer disabled:opacity-50"
              title="Generate Lesson Plan with Gemini AI"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  <span>AI Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} className="text-amber-300" />
                  <span>AI Generate</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              id="curriculum-generator-footer-preview-btn"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 hover:border-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Open Print Preview of Current Lesson Plan"
            >
              <Printer size={14} className="text-amber-600" />
              <span>Print Preview</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-300 shadow-2xs"
            >
              <Download size={14} />
              <span>Download HTML / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Save size={14} />
              <span>Save Plan to Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Preview Modal Overlay */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl my-auto flex flex-col h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="bg-slate-900 text-white px-5 py-4 shrink-0 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Printer size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                      Print Preview • {scope.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      Grade {grade} • {subject}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md sm:max-w-xl">
                    {title || 'Curriculum Lesson Plan'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="print-preview-modal-print-btn"
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/30 cursor-pointer"
                  title="Trigger Print Dialog (Save as PDF or Print)"
                >
                  <Printer size={15} />
                  <span>Print Document</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Download formatted HTML document"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Preview Iframe Body */}
            <div className="flex-1 bg-slate-200/90 p-3 sm:p-6 overflow-y-auto flex justify-center">
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col min-h-full">
                <iframe
                  title="Lesson Plan Print Preview"
                  srcDoc={generateLessonPlanHTML(buildPlanObject())}
                  className="w-full flex-1 border-0 min-h-[700px]"
                />
              </div>
            </div>

            {/* Preview Footer */}
            <div className="bg-slate-900 text-slate-400 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>DIS Standard Layout • A4 Print Optimized • Ready for Physical Printing or PDF Export</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
