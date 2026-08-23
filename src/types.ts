export type ResourceFormat = 'flipbook' | 'pdf';

export type SubjectCategory = 
  | 'Science'
  | 'Mathematics'
  | 'English'
  | 'Social Studies'
  | 'Technology'
  | 'Engineering'
  | 'Arts'
  | 'Physical Education';

export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export interface PageContent {
  pageNumber: number;
  title: string;
  subtitle?: string;
  content: string[];
  keyTerms?: { term: string; definition: string }[];
  diagramType?: 'biology_cell' | 'physics_forces' | 'math_algebra' | 'chemistry_reactions' | 'history_timeline' | 'art_wheel' | 'coding_flow';
  exercise?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface WorksheetQuestion {
  num: number;
  prompt: string;
  type: 'multiple_choice' | 'short_answer' | 'fill_in_blank' | 'diagram_label';
  options?: string[];
  correctAnswer?: string;
  points: number;
  hint?: string;
}

export interface WorksheetItem {
  id: string;
  title: string;
  subtitle?: string;
  grade: GradeLevel;
  subject: SubjectCategory;
  estimatedMinutes: number;
  totalPoints: number;
  instructions: string;
  questions: WorksheetQuestion[];
  answerKey: {
    questionNum: number;
    answer: string;
    explanation?: string;
  }[];
}

export interface LessonPlanTimelineStep {
  phase: string;
  durationMin: number;
  teacherRole: string;
  studentRole: string;
}

export interface LessonPlanItem {
  id: string;
  title: string;
  unit: string;
  grade: GradeLevel;
  subject: SubjectCategory;
  duration: string;
  curriculumStandards: string[];
  learningObjectives: string[];
  essentialQuestions: string[];
  requiredMaterials: string[];
  vocabularyTerms: { term: string; definition: string }[];
  timeline: LessonPlanTimelineStep[];
  formativeAssessment: string;
  differentiation: {
    support: string;
    extension: string;
  };
  homeworkAssignment: string;
}

export interface Resource {
  id: string;
  title: string;
  subtitle: string;
  grade: GradeLevel;
  subject: SubjectCategory;
  format: ResourceFormat;
  coverImage?: string;
  coverGradient?: string;
  coverTheme: {
    bg: string;
    text: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
  totalPages: number;
  fileSize: string;
  author: string;
  publishedYear: number;
  rating: number;
  viewsCount: number;
  description: string;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  isFavorite?: boolean;
  isMyLibrary?: boolean;
  addedToLibraryAt?: string;
  uploadedByUserId?: string;
  uploadedByUserName?: string;
  isPersonalOnly?: boolean;
  sharedWithGrades?: GradeLevel[] | 'all';
  sharedWithEmails?: string[];
  lastReadDate?: string;
  lastReadTimeAgo?: string;
  lastPageRead?: number;
  chapters: {
    title: string;
    page: number;
  }[];
  samplePages: PageContent[];
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  worksheet?: WorksheetItem;
  lessonPlan?: LessonPlanItem;
}

export interface UserPersonalData {
  myLibraryResourceIds: string[];
  bookmarkedResourceIds: string[];
  favoriteResourceIds: string[];
  recentlyRead: {
    resourceId: string;
    date: string;
    page: number;
  }[];
  sharedWithMe: SharedResourceItem[];
  notes?: Record<string, string>;
}

export interface SharedResourceItem {
  id: string;
  resourceId: string;
  sharedByUserId?: string;
  sharedByName: string;
  sharedByRole?: string;
  sharedByEmail?: string;
  sharedAt: string;
  targetType?: 'school' | 'grade' | 'email';
  targetValue?: string;
  note?: string;
}

export interface CategoryInfo {
  id: SubjectCategory;
  name: string;
  count: number;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'curriculum' | 'alert' | 'share' | 'system';
  linkResourceId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'STEAM Manager' | 'Educator' | 'Lead Curriculum Specialist' | 'Student' | 'Administrator';
  avatarUrl?: string;
  initials: string;
  department?: string;
  gradeAssigned?: GradeLevel;
}

export interface UserCredentialRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'STEAM Manager' | 'Educator' | 'Lead Curriculum Specialist' | 'Student' | 'Administrator';
  department?: string;
  gradeAssigned?: GradeLevel;
  avatarUrl?: string;
  initials: string;
  registeredAt: string;
  lastLoginAt?: string;
  status?: 'active' | 'suspended';
  isPreset?: boolean;
  notes?: string;
}

export type ActiveNavTab = 
  | 'dashboard'
  | 'grades'
  | 'library'
  | 'worksheets'
  | 'bookmarks'
  | 'recent'
  | 'favorites'
  | 'shared'
  | 'analytics'
  | 'admin'
  | 'settings'
  | 'help';


