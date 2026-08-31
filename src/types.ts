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

export type LessonPlanScope = 'yearly' | 'quarter' | 'monthly' | 'weekly' | 'daily';

export interface WeeklyLessonEntry {
  id?: string;
  lessonName: string; // "Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"
  experiencesAndOutcomes: string; // Links to Experiences and Outcomes
  benchmarksForAssessment: string; // Benchmarks for Assessment
  resourcesRequired: string; // Resources Required
  evaluation: string; // Evaluation
}

export interface WeeklyDaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | string;
  lessons: WeeklyLessonEntry[];
}

export interface LessonPlanTimelineStep {
  phase: string;
  durationMin?: number;
  timeSlot?: string;
  teacherRole: string;
  studentRole: string;
  subject?: string;
  assessment?: string;
  resources?: string;
}

export interface LessonPlanItem {
  id: string;
  title: string;
  unit: string;
  grade: GradeLevel;
  subject: SubjectCategory | string;
  scope?: LessonPlanScope;
  duration: string;
  weekCommencing?: string;
  weeklyDays?: WeeklyDaySchedule[];
  weeklyNotesAndEvaluations?: string;
  timeDetails?: {
    academicYear?: string;
    quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | string;
    month?: string;
    weekNumber?: string | number;
    dateRange?: string;
    startTime?: string;
    endTime?: string;
    classPeriod?: string;
    daysOfWeek?: string[];
    totalHours?: number;
  };
  teacherName?: string;
  curriculumStandards: string[];
  learningObjectives: string[];
  essentialQuestions: string[];
  requiredMaterials: string[];
  vocabularyTerms?: { term: string; definition: string }[];
  timeline: LessonPlanTimelineStep[];
  formativeAssessment: string;
  summativeAssessment?: string;
  differentiation: {
    support: string;
    extension: string;
  };
  homeworkAssignment: string;
  notes?: string;
  createdAt?: string;
  createdByUserId?: string;
  createdByUserEmail?: string;
  createdByRole?: string;
  createdByDepartment?: string;
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
  uploadedByEmail?: string;
  uploadedByRole?: string;
  uploadedByDepartment?: string;
  uploadedAt?: string;
  isCustomUpload?: boolean;
  source?: 'preset' | 'uploaded' | 'shared';
  category?: string;
  verificationStatus?: 'verified' | 'pending' | 'institutional';
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
  myLessonPlanIds?: string[];
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
  role: 'Super Admin' | 'STEAM Manager' | 'Educator' | 'Lead Curriculum Specialist' | 'Student' | 'Administrator';
  avatarUrl?: string;
  initials: string;
  department?: string;
  gradeAssigned?: GradeLevel;
  isSuperAdmin?: boolean;
  adminScope?: 'all' | 'specific';
  assignedDepartments?: string[];
  assignedTasks?: string[];
  canAssignRoles?: boolean;
}

export interface UserCredentialRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'Super Admin' | 'STEAM Manager' | 'Educator' | 'Lead Curriculum Specialist' | 'Student' | 'Administrator';
  department?: string;
  gradeAssigned?: GradeLevel;
  avatarUrl?: string;
  initials: string;
  registeredAt: string;
  lastLoginAt?: string;
  status?: 'active' | 'suspended';
  isPreset?: boolean;
  notes?: string;
  isSuperAdmin?: boolean;
  adminScope?: 'all' | 'specific';
  assignedDepartments?: string[];
  assignedTasks?: string[];
  canAssignRoles?: boolean;
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

export interface InstitutionalAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'steam' | 'maintenance' | 'event' | 'urgent';
  targetAudience: 'all' | 'faculty' | 'students' | 'steam_dept';
  authorName: string;
  authorRole: string;
  createdAt: string;
  expiresAt?: string;
  isPinned?: boolean;
}

export interface ActivityLogItem {
  id: string;
  action: 'upload' | 'delete' | 'share' | 'create_lesson_plan' | 'login' | 'profile_update' | 'bookmark';
  title: string;
  description: string;
  userName: string;
  userRole: string;
  userEmail: string;
  timestamp: string;
  resourceId?: string;
  details?: Record<string, any>;
}

/**
 * Helper to check if email belongs to the institutional Super Admin (STEAM Manager vanthanbour@diu.edu.kh / vanthabour@diu.edu.kh)
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return (
    clean === 'vanthanbour@diu.edu.kh' ||
    clean === 'vanthabour@diu.edu.kh' ||
    clean.includes('vanthanbour') ||
    clean.includes('vanthabour')
  );
}

/**
 * Helper to check if user is Super Admin
 * By default: STEAM Manager with vanthabour@diu.edu.kh / vanthanbour@diu.edu.kh has Super Admin status and full authority.
 */
export function isSuperAdminUser(user?: UserProfile | UserCredentialRecord | null): boolean {
  if (!user) return false;
  if (isSuperAdminEmail(user.email)) return true;
  if (user.isSuperAdmin) return true;
  const role = (user.role || '').toLowerCase().trim();
  if (role === 'super admin' || role === 'super_admin') return true;
  if (role === 'steam manager' || role === 'steam_manager') return true;
  return false;
}

/**
 * Check if user can access User Accounts, user registrations, and credentials vault.
 * STRICT POLICY: Only Administrators and STEAM Managers (Super Admin) can access User Accounts.
 */
export function canUserAccessUserAccounts(user?: UserProfile | UserCredentialRecord | null): boolean {
  if (!user || !user.role) return false;
  if (isSuperAdminUser(user)) return true;
  const role = user.role.toLowerCase().trim();
  if (role === 'steam manager' || role === 'steam_manager' || role.includes('steam')) return true;
  if (role === 'administrator' || role === 'admin' || role.includes('admin')) return true;
  return false;
}

/**
 * Check if user has authority to assign roles or change the role of users in the Admin Console.
 * All Administrators and STEAM Managers / Super Admins can assign roles to all users.
 */
export function canUserAssignRoles(user?: UserProfile | UserCredentialRecord | null): boolean {
  return canUserAccessUserAccounts(user);
}

/**
 * Check if user can access the Admin Console
 * Super Admin, STEAM Manager, or Administrators can access
 */
export function canUserAccessAdmin(user?: UserProfile | UserCredentialRecord | null): boolean {
  if (!user || !user.role) return false;
  if (isSuperAdminUser(user)) return true;
  const role = user.role.toLowerCase().trim();
  return role === 'administrator' || role === 'admin' || role.includes('admin') || role.includes('steam');
}

/**
 * Check if an administrator is authorized for a specific department or subject
 */
export function isDepartmentAuthorizedForAdmin(
  user: UserProfile | UserCredentialRecord | null | undefined,
  departmentOrSubject?: string | null
): boolean {
  if (!user) return false;
  // Super Admin has authority over all departments
  if (isSuperAdminUser(user)) return true;
  // If administrator has full department scope ('all' or undefined)
  if (user.adminScope === 'all' || !user.adminScope) return true;
  if (!user.assignedDepartments || user.assignedDepartments.length === 0) return true;
  if (user.assignedDepartments.includes('All') || user.assignedDepartments.includes('all')) return true;
  if (!departmentOrSubject) return true;

  const target = departmentOrSubject.toLowerCase().trim();
  return user.assignedDepartments.some(d => {
    const dept = d.toLowerCase().trim();
    return target.includes(dept) || dept.includes(target);
  });
}

/**
 * Check if an administrator is authorized for a specific administrative task
 */
export function isTaskAuthorizedForAdmin(
  user: UserProfile | UserCredentialRecord | null | undefined,
  taskId: string
): boolean {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  if (!user.assignedTasks || user.assignedTasks.length === 0) return true;
  if (user.assignedTasks.includes('all')) return true;
  return user.assignedTasks.includes(taskId);
}

/**
 * Authorization helper: Check if a user has authority to delete books & curriculum resources
 * Super Admin, STEAM Manager, and authorized Administrators.
 */
export function isAuthorizedToDeleteResource(user?: UserProfile | null): boolean {
  if (!user || !user.role) return false;
  if (isSuperAdminUser(user)) return true;
  const role = user.role.toLowerCase().trim();
  const isAdm = role === 'administrator' || role === 'admin' || role.includes('admin');
  if (isAdm) {
    return isTaskAuthorizedForAdmin(user, 'books_management');
  }
  return false;
}


