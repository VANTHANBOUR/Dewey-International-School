import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Key,
  Users,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Database,
  Lock,
  Mail,
  GraduationCap,
  Sparkles,
  AlertCircle,
  LogIn,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  BookOpen,
  UploadCloud,
  FileText,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Plus,
  Info,
  Calendar,
  Clock,
  UserCheck,
  Tag,
  FolderCheck,
  FileCode,
  Globe,
  LockKeyhole,
  Crown,
  Briefcase,
  Building2,
  SlidersHorizontal,
  ShieldAlert,
  ListChecks
} from 'lucide-react';
import {
  UserProfile,
  UserCredentialRecord,
  GradeLevel,
  Resource,
  ResourceFormat,
  SubjectCategory,
  LessonPlanItem,
  isSuperAdminEmail,
  isSuperAdminUser,
  canUserAssignRoles,
  canUserAccessUserAccounts,
  isDepartmentAuthorizedForAdmin,
  isTaskAuthorizedForAdmin,
  isAuthorizedToDeleteResource
} from '../../types';
import {
  subscribeToAllUserCredentials,
  saveUserCredentialToFirestore,
  updateUserCredentialInFirestore,
  updateUserPasswordInFirestore,
  deleteUserCredentialFromFirestore,
  seedInitialInstitutionalCredentialsToFirestore,
  assignUserRoleInFirestore,
  getEmailDocId,
  INITIAL_INSTITUTIONAL_CREDENTIALS
} from '../../lib/firebaseServices';
import { saveStoredCredential, saveStoredRecentUser } from '../AuthModal';
import { BookCoverIllustration } from '../BookCoverIllustration';
import { downloadLessonPlanDocument, downloadWorksheetDocument } from '../../utils/downloadHelper';

export const INSTITUTIONAL_DEPARTMENTS = [
  'Science & Biology',
  'Physics & Laboratory',
  'Mathematics Faculty',
  'Computer Science & STEAM Innovation',
  'English & Humanities',
  'Social Studies & History',
  'Arts & Design',
  'Physical Education',
  'Dewey Faculty & STEAM Innovation',
  'Academic Directorate & IT Governance'
];

export const ADMIN_TASK_OPTIONS = [
  { id: 'books_management', label: 'Books & Learning Materials Management', description: 'Upload, audit, inspect, and delete books and curriculum PDFs' },
  { id: 'lesson_plans_audit', label: 'Lesson Plan Audit & Review', description: 'Review, inspect, export, and manage educator lesson plans' },
  { id: 'user_management', label: 'Account & Credential Oversight', description: 'View credentials, reset passwords, provision new faculty/student accounts' },
  { id: 'curriculum_review', label: 'Curriculum & Standards Review', description: 'Curriculum mapping, grade alignment, and resource approval' },
  { id: 'analytics_oversight', label: 'Institutional Analytics Audit', description: 'Audit faculty activity, student downloads, and system metrics' },
  { id: 'announcements', label: 'Campus Announcements', description: 'Publish institutional notices and campus announcements' }
];

interface AdminConsoleViewProps {
  currentUser: UserProfile | null;
  onSwitchUser?: (user: UserProfile) => void;
  onUserUpdated?: (user: UserProfile) => void;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
  resources?: Resource[];
  lessonPlans?: LessonPlanItem[];
  onDeleteResource?: (resource: Resource) => void;
  onDeleteLessonPlan?: (planId: string) => void;
  onDeleteAllUploadedResources?: () => Promise<void>;
  onDeleteMultipleResources?: (resourceIds: string[]) => Promise<void>;
  onOpenResource?: (resource: Resource) => void;
  onOpenUploadModal?: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  currentUser,
  onSwitchUser,
  onUserUpdated,
  onOpenAuthModal,
  resources = [],
  lessonPlans = [],
  onDeleteResource,
  onDeleteLessonPlan,
  onDeleteAllUploadedResources,
  onDeleteMultipleResources,
  onOpenResource,
  onOpenUploadModal
}) => {
  // Navigation Tabs inside Admin Console
  const [adminTab, setAdminTab] = useState<'uploads' | 'credentials' | 'lesson_plans'>('uploads');

  // Authority & Role Scope Derivations
  const isSuperAdmin = isSuperAdminUser(currentUser);
  const canAccessUserAccounts = canUserAccessUserAccounts(currentUser);
  const canAssignRole = canUserAssignRoles(currentUser);
  const userAdminScope = currentUser?.adminScope || 'all';
  const userAssignedDepts = currentUser?.assignedDepartments || ['All'];
  const userAssignedTasks = currentUser?.assignedTasks || ['books_management', 'lesson_plans_audit'];

  // Credentials State
  const [credentials, setCredentials] = useState<UserCredentialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Department Filter Mode for Scoped Administrators
  const [deptFilterMode, setDeptFilterMode] = useState<'all' | 'my_depts'>('all');

  // Edit / Create Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingEmail, setEditingEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserProfile['role']>('Educator');
  const [formDepartment, setFormDepartment] = useState('');
  const [formGrade, setFormGrade] = useState<GradeLevel | ''>('');
  const [formNotes, setFormNotes] = useState('');
  const [formAdminScope, setFormAdminScope] = useState<'all' | 'specific'>('all');
  const [formAssignedDepartments, setFormAssignedDepartments] = useState<string[]>(['All']);
  const [formAssignedTasks, setFormAssignedTasks] = useState<string[]>([
    'books_management',
    'lesson_plans_audit'
  ]);
  const [formIsSuperAdmin, setFormIsSuperAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Role Assignment Modal State
  const [roleAssignmentModalUser, setRoleAssignmentModalUser] = useState<UserCredentialRecord | null>(null);

  // Delete Confirm State for Users
  const [deletingUser, setDeletingUser] = useState<UserCredentialRecord | null>(null);

  // Uploaded Resources Management State
  const [uploadSearchQuery, setUploadSearchQuery] = useState('');
  const [uploadFormatFilter, setUploadFormatFilter] = useState<'all' | 'pdf' | 'flipbook' | 'worksheet' | 'document'>('all');
  const [uploadGradeFilter, setUploadGradeFilter] = useState<string>('all');
  const [uploadUploaderFilter, setUploadUploaderFilter] = useState<string>('all');
  const [uploadScopeFilter, setUploadScopeFilter] = useState<string>('all');
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [singleDeletingResource, setSingleDeletingResource] = useState<Resource | null>(null);
  const [singleDeletingLessonPlan, setSingleDeletingLessonPlan] = useState<LessonPlanItem | null>(null);
  const [inspectingResource, setInspectingResource] = useState<Resource | null>(null);
  const [inspectingLessonPlan, setInspectingLessonPlan] = useState<LessonPlanItem | null>(null);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');

  // Subscribe to real-time credentials from Firebase Firestore (Only for Admin and STEAM Manager)
  useEffect(() => {
    if (!canAccessUserAccounts) {
      if (adminTab === 'credentials') {
        setAdminTab('uploads');
      }
      setCredentials([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    seedInitialInstitutionalCredentialsToFirestore();

    const unsubscribe = subscribeToAllUserCredentials((list) => {
      setCredentials(list);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [canAccessUserAccounts, adminTab]);

  // Filtered credentials list
  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      if (selectedRoleFilter !== 'all' && cred.role !== selectedRoleFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = cred.name.toLowerCase().includes(q);
        const matchEmail = cred.email.toLowerCase().includes(q);
        const matchRole = cred.role.toLowerCase().includes(q);
        const matchDept = cred.department?.toLowerCase().includes(q);
        const matchPassword = cred.password.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchDept && !matchPassword) {
          return false;
        }
      }
      return true;
    });
  }, [credentials, selectedRoleFilter, searchQuery]);

  // Statistics for Users
  const stats = useMemo(() => {
    const total = credentials.length;
    const admins = credentials.filter(c => c.role === 'Administrator').length;
    const faculty = credentials.filter(c => c.role === 'Educator' || c.role === 'Lead Curriculum Specialist' || c.role === 'STEAM Manager').length;
    const students = credentials.filter(c => c.role === 'Student').length;
    return { total, admins, faculty, students };
  }, [credentials]);

  // All Uploaded Resources (Custom uploads, teacher files, uploaded PDFs, worksheets)
  const allUploadedResources = useMemo(() => {
    return resources.filter(r => 
      r.id.startsWith('res-custom-') || 
      r.isCustomUpload === true || 
      !!r.uploadedByUserId || 
      r.source === 'uploaded' ||
      r.category === 'custom' ||
      r.isPersonalOnly === true
    );
  }, [resources]);

  // Unique list of Uploaders across custom materials for quick Admin filtering
  const availableUploaders = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email?: string; role?: string }>();
    allUploadedResources.forEach(r => {
      const uId = r.uploadedByUserId || r.uploadedByUserName || 'unknown';
      if (!map.has(uId)) {
        map.set(uId, {
          id: uId,
          name: r.uploadedByUserName || r.author || 'Dewey Faculty',
          email: r.uploadedByEmail,
          role: r.uploadedByRole
        });
      }
    });
    return Array.from(map.values());
  }, [allUploadedResources]);

  // Filtered Uploaded Resources
  const filteredUploadedResources = useMemo(() => {
    return allUploadedResources.filter(r => {
      // Department scope filter for scoped administrators
      if (deptFilterMode === 'my_depts' && userAdminScope === 'specific' && !isSuperAdmin) {
        if (!isDepartmentAuthorizedForAdmin(currentUser, r.subject) && !isDepartmentAuthorizedForAdmin(currentUser, r.uploadedByDepartment)) {
          return false;
        }
      }

      if (uploadFormatFilter !== 'all') {
        if (uploadFormatFilter === 'worksheet' && r.type !== 'worksheet') return false;
        if (uploadFormatFilter !== 'worksheet' && r.format !== uploadFormatFilter) return false;
      }
      if (uploadGradeFilter !== 'all' && r.grade !== uploadGradeFilter) {
        return false;
      }
      if (uploadUploaderFilter !== 'all') {
        const uId = r.uploadedByUserId || r.uploadedByUserName;
        if (uId !== uploadUploaderFilter && r.uploadedByUserName !== uploadUploaderFilter) {
          return false;
        }
      }
      if (uploadScopeFilter !== 'all') {
        if (uploadScopeFilter === 'personal' && !r.isPersonalOnly) return false;
        if (uploadScopeFilter === 'portal' && r.isPersonalOnly) return false;
      }
      if (uploadSearchQuery.trim()) {
        const q = uploadSearchQuery.toLowerCase().trim();
        const matches = 
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.author && r.author.toLowerCase().includes(q)) ||
          (r.uploadedByUserName && r.uploadedByUserName.toLowerCase().includes(q)) ||
          (r.uploadedByEmail && r.uploadedByEmail.toLowerCase().includes(q)) ||
          (r.uploadedByRole && r.uploadedByRole.toLowerCase().includes(q)) ||
          (r.uploadedByDepartment && r.uploadedByDepartment.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [allUploadedResources, uploadFormatFilter, uploadGradeFilter, uploadUploaderFilter, uploadScopeFilter, uploadSearchQuery, deptFilterMode, userAdminScope, isSuperAdmin, currentUser]);

  // Filtered Lesson Plans (All custom educator lesson plans created in the portal)
  const allCustomLessonPlans = useMemo(() => {
    return lessonPlans;
  }, [lessonPlans]);

  const filteredLessonPlans = useMemo(() => {
    return allCustomLessonPlans.filter(p => {
      // Department scope filter for scoped administrators
      if (deptFilterMode === 'my_depts' && userAdminScope === 'specific' && !isSuperAdmin) {
        if (!isDepartmentAuthorizedForAdmin(currentUser, p.subject) && !isDepartmentAuthorizedForAdmin(currentUser, p.createdByDepartment)) {
          return false;
        }
      }

      if (uploadGradeFilter !== 'all' && p.grade !== uploadGradeFilter) {
        return false;
      }
      if (uploadSearchQuery.trim()) {
        const q = uploadSearchQuery.toLowerCase().trim();
        const matches = 
          p.title.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q) ||
          p.teacherName.toLowerCase().includes(q) ||
          (p.createdByUserEmail && p.createdByUserEmail.toLowerCase().includes(q)) ||
          (p.createdByRole && p.createdByRole.toLowerCase().includes(q)) ||
          (p.unitTitle && p.unitTitle.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [allCustomLessonPlans, uploadGradeFilter, uploadSearchQuery, deptFilterMode, userAdminScope, isSuperAdmin, currentUser]);

  // Checkbox Selection Helpers
  const isAllSelected = filteredUploadedResources.length > 0 && selectedResourceIds.length === filteredUploadedResources.length;
  
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedResourceIds([]);
    } else {
      setSelectedResourceIds(filteredUploadedResources.map(r => r.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedResourceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Delete All Uploaded Resources Handler
  const handleConfirmDeleteAllUploads = async () => {
    setIsDeletingBulk(true);
    try {
      const countToDelete = allUploadedResources.length;
      if (onDeleteAllUploadedResources) {
        await onDeleteAllUploadedResources();
      } else if (onDeleteMultipleResources) {
        await onDeleteMultipleResources(allUploadedResources.map(r => r.id));
      } else if (onDeleteResource) {
        for (const res of allUploadedResources) {
          onDeleteResource(res);
        }
      }
      setSelectedResourceIds([]);
      setIsDeleteAllModalOpen(false);
      setDeleteAllConfirmText('');
      setStatusMessage({
        type: 'success',
        text: `Permanently deleted all (${countToDelete}) uploaded curriculum materials from Firebase Firestore across the entire domain.`
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.error('Error deleting all uploaded resources:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete all uploaded resources.' });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Batch Delete Selected Handler
  const handleConfirmBatchDelete = async () => {
    if (selectedResourceIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      const count = selectedResourceIds.length;
      if (onDeleteMultipleResources) {
        await onDeleteMultipleResources(selectedResourceIds);
      } else if (onDeleteResource) {
        for (const id of selectedResourceIds) {
          const res = resources.find(r => r.id === id);
          if (res) onDeleteResource(res);
        }
      }
      setStatusMessage({
        type: 'success',
        text: `Successfully deleted ${count} selected curriculum resources from Firebase Firestore.`
      });
      setSelectedResourceIds([]);
      setIsBatchDeleteModalOpen(false);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error in batch delete:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete selected resources.' });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Single Delete Handler
  const handleConfirmSingleDelete = async () => {
    if (!singleDeletingResource) return;
    try {
      if (onDeleteResource) {
        onDeleteResource(singleDeletingResource);
      }
      setStatusMessage({
        type: 'success',
        text: `Deleted "${singleDeletingResource.title}" from Firebase Firestore repository.`
      });
      setSingleDeletingResource(null);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error deleting resource:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete resource.' });
    }
  };

  const togglePasswordReveal = (email: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const handleCopyText = (text: string, keyIdentifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyIdentifier);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleOpenCreateModal = () => {
    setIsCreatingNew(true);
    setEditingEmail('');
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('Educator');
    setFormDepartment('Dewey Faculty');
    setFormGrade('9');
    setFormNotes('');
    setFormAdminScope('all');
    setFormAssignedDepartments(['All']);
    setFormAssignedTasks(['books_management', 'lesson_plans_audit']);
    setFormIsSuperAdmin(false);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (record: UserCredentialRecord) => {
    const isSuper = isSuperAdminEmail(record.email) || !!record.isSuperAdmin || record.role === 'STEAM Manager' || record.role === 'Super Admin';
    setIsCreatingNew(false);
    setEditingEmail(record.email);
    setFormName(record.name);
    setFormEmail(record.email);
    setFormPassword(record.password);
    setFormRole(record.role);
    setFormDepartment(record.department || '');
    setFormGrade(record.gradeAssigned || '');
    setFormNotes(record.notes || '');
    setFormAdminScope(isSuper ? 'all' : (record.adminScope || 'all'));
    setFormAssignedDepartments(
      isSuper
        ? ['All']
        : record.assignedDepartments && record.assignedDepartments.length > 0
        ? record.assignedDepartments
        : ['All']
    );
    setFormAssignedTasks(
      isSuper
        ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
        : record.assignedTasks && record.assignedTasks.length > 0
        ? record.assignedTasks
        : ['books_management', 'lesson_plans_audit']
    );
    setFormIsSuperAdmin(isSuper);
    setIsEditModalOpen(true);
  };

  const handleQuickRoleChange = async (cred: UserCredentialRecord, newRole: UserProfile['role']) => {
    const isSuper = isSuperAdminEmail(cred.email) || newRole === 'STEAM Manager' || newRole === 'Super Admin';
    const updatedRecord: UserCredentialRecord = {
      ...cred,
      role: newRole,
      isSuperAdmin: isSuper,
      canAssignRoles: true,
      adminScope: isSuper ? 'all' : (cred.adminScope || 'all'),
      assignedDepartments: isSuper ? ['All'] : (cred.assignedDepartments || ['All']),
      assignedTasks: isSuper
        ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
        : (cred.assignedTasks || ['books_management', 'lesson_plans_audit'])
    };

    setCredentials(prev => prev.map(c => (c.email.toLowerCase() === cred.email.toLowerCase() || c.id === cred.id ? updatedRecord : c)));

    try {
      await assignUserRoleInFirestore(cred.email, newRole, {
        department: cred.department,
        gradeAssigned: cred.gradeAssigned,
        adminScope: updatedRecord.adminScope,
        assignedDepartments: updatedRecord.assignedDepartments,
        assignedTasks: updatedRecord.assignedTasks
      });

      setStatusMessage({
        type: 'success',
        text: `Role for ${cred.name} successfully updated to "${newRole}". Changes saved directly to Firebase Firestore.`
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error updating role in Firestore:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update user role in Firebase.' });
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formPassword.trim() || !formName.trim()) {
      setStatusMessage({ type: 'error', text: 'Name, email, and password are required.' });
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const existingRecord = credentials.find(
      c => c.email.toLowerCase() === editingEmail.toLowerCase() || c.email.toLowerCase() === cleanEmail
    );

    const isSuper = isSuperAdminEmail(cleanEmail) || formRole === 'STEAM Manager' || formRole === 'Super Admin' || formIsSuperAdmin;
    const finalScope = isSuper ? 'all' : formAdminScope;
    const finalDepts = isSuper ? ['All'] : formAdminScope === 'all' ? ['All'] : formAssignedDepartments;
    const finalTasks = isSuper
      ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
      : formRole === 'Administrator'
      ? formAssignedTasks
      : undefined;

    setIsSaving(true);
    try {
      const initials = formName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DU';

      const userId = existingRecord?.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      if (isCreatingNew) {
        const newRecord: UserCredentialRecord = {
          id: userId,
          email: cleanEmail,
          password: formPassword.trim(),
          name: formName.trim(),
          role: formRole,
          department: formDepartment.trim() || (formRole === 'Administrator' ? 'Academic Directorate & IT Governance' : 'Dewey Faculty'),
          gradeAssigned: formGrade ? (formGrade as GradeLevel) : undefined,
          initials,
          registeredAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          status: 'active',
          notes: formNotes.trim(),
          isSuperAdmin: isSuper,
          canAssignRoles: isSuper,
          adminScope: finalScope,
          assignedDepartments: finalDepts,
          assignedTasks: finalTasks
        };

        setCredentials(prev => [newRecord, ...prev.filter(c => c.email.toLowerCase() !== cleanEmail)]);

        const newProfile: UserProfile = {
          id: newRecord.id,
          name: newRecord.name,
          email: newRecord.email,
          role: newRecord.role,
          initials: newRecord.initials,
          department: newRecord.department,
          gradeAssigned: newRecord.gradeAssigned,
          isSuperAdmin: isSuper,
          canAssignRoles: isSuper,
          adminScope: finalScope,
          assignedDepartments: finalDepts,
          assignedTasks: finalTasks
        };
        saveStoredCredential({
          email: cleanEmail,
          password: formPassword.trim(),
          profile: newProfile
        });
        saveStoredRecentUser(newProfile);

        await saveUserCredentialToFirestore(newRecord);
        setStatusMessage({ type: 'success', text: `Successfully registered and stored credentials for ${newRecord.name} in Firebase!` });
      } else {
        const updatedRecord: UserCredentialRecord = {
          id: userId,
          email: cleanEmail,
          password: formPassword.trim(),
          name: formName.trim(),
          role: formRole,
          department: formDepartment.trim() || (formRole === 'Administrator' ? 'Academic Directorate & IT Governance' : 'Dewey Faculty'),
          gradeAssigned: formGrade ? (formGrade as GradeLevel) : undefined,
          initials,
          registeredAt: existingRecord?.registeredAt || new Date().toISOString(),
          lastLoginAt: existingRecord?.lastLoginAt || new Date().toISOString(),
          status: 'active',
          notes: formNotes.trim(),
          isPreset: existingRecord?.isPreset,
          isSuperAdmin: isSuper,
          canAssignRoles: isSuper,
          adminScope: finalScope,
          assignedDepartments: finalDepts,
          assignedTasks: finalTasks
        };

        setCredentials(prev => prev.map(c => {
          if (c.email.toLowerCase() === editingEmail.toLowerCase() || c.email.toLowerCase() === cleanEmail || c.id === userId) {
            return updatedRecord;
          }
          return c;
        }));

        const updatedProfile: UserProfile = {
          id: userId,
          name: formName.trim(),
          email: cleanEmail,
          role: formRole,
          initials,
          department: formDepartment.trim() || 'Dewey Faculty',
          gradeAssigned: formGrade ? (formGrade as GradeLevel) : undefined,
          isSuperAdmin: isSuper,
          canAssignRoles: isSuper,
          adminScope: finalScope,
          assignedDepartments: finalDepts,
          assignedTasks: finalTasks
        };

        saveStoredCredential({
          email: cleanEmail,
          password: formPassword.trim(),
          profile: updatedProfile
        });
        saveStoredRecentUser(updatedProfile);

        if (
          currentUser &&
          (currentUser.email.toLowerCase() === editingEmail.toLowerCase() ||
           currentUser.email.toLowerCase() === cleanEmail ||
           currentUser.id === userId)
        ) {
          if (onUserUpdated) {
            onUserUpdated(updatedProfile);
          } else if (onSwitchUser) {
            onSwitchUser(updatedProfile);
          }
        }

        await updateUserCredentialInFirestore(editingEmail, {
          name: formName.trim(),
          email: cleanEmail,
          password: formPassword.trim(),
          role: formRole,
          department: formDepartment.trim(),
          gradeAssigned: formGrade || undefined,
          notes: formNotes.trim(),
          initials,
          id: userId,
          isSuperAdmin: isSuper,
          canAssignRoles: isSuper,
          adminScope: finalScope,
          assignedDepartments: finalDepts,
          assignedTasks: finalTasks
        });

        setStatusMessage({ type: 'success', text: `Instantly updated credentials, roles & permissions for ${formName.trim()} in Firebase Firestore.` });
      }

      setIsEditModalOpen(false);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving user credential to Firestore:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save credential to Firestore.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    if (isSuperAdminEmail(deletingUser.email) || isSuperAdminUser(deletingUser)) {
      setStatusMessage({
        type: 'error',
        text: 'The Super Admin account (STEAM Manager - vanthanbour@diu.edu.kh) is protected and cannot be deleted.'
      });
      setDeletingUser(null);
      return;
    }
    try {
      await deleteUserCredentialFromFirestore(deletingUser.email, deletingUser.id);
      setStatusMessage({ type: 'success', text: `Deleted account and credential record for ${deletingUser.name} from Firebase.` });
      setDeletingUser(null);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete user.' });
    }
  };

  const handleTestSignInAsUser = (record: UserCredentialRecord) => {
    const profile: UserProfile = {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role,
      avatarUrl: record.avatarUrl,
      initials: record.initials,
      department: record.department,
      gradeAssigned: record.gradeAssigned
    };

    saveStoredRecentUser(profile);
    if (onSwitchUser) {
      onSwitchUser(profile);
    }
    setStatusMessage({ type: 'success', text: `Switched active session to ${record.name} (${record.role}).` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Password', 'Role', 'Department', 'GradeAssigned', 'RegisteredAt', 'Status'];
    const rows = credentials.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.password}"`,
      `"${c.role}"`,
      `"${c.department || ''}"`,
      `"${c.gradeAssigned || ''}"`,
      `"${c.registeredAt || ''}"`,
      `"${c.status || 'active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dewey_user_credentials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(credentials, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dewey_user_credentials_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#0a0f24] via-[#0f1b44] to-[#1e224e] rounded-3xl border border-slate-800 text-white p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-36 h-36 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <ShieldCheck size={14} />
                <span>Institutional Administration & Cloud Repository Governance</span>
              </div>
              {isSuperAdmin ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-black shadow-xs">
                  <Crown size={13} className="text-amber-400 animate-bounce" />
                  <span>Super Admin Authority (STEAM Manager)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                  <Building2 size={13} />
                  <span>
                    {userAdminScope === 'all'
                      ? 'Cross-Departmental Access (All Departments)'
                      : `Scoped Access (${userAssignedDepts.filter(d => d !== 'All').length} Departments)`}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Admin Management Hub</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold flex items-center gap-1">
                <Database size={12} className="animate-pulse" />
                <span>Firebase Synced</span>
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              {isSuperAdmin
                ? 'Logged in as Sabrina Bour (vanthanbour@diu.edu.kh) with Super Admin executive authority over All Departments, user role assignments, task delegations, and school-wide asset purging.'
                : `Logged in as ${currentUser?.name || 'Administrator'} with access configured for ${
                    userAdminScope === 'all' ? 'All Institutional Departments' : userAssignedDepts.join(', ')
                  }.`}
            </p>
          </div>

          {/* Tab Selection in Banner */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md shrink-0 flex-wrap">
            <button
              id="admin-tab-uploads-btn"
              onClick={() => setAdminTab('uploads')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                adminTab === 'uploads'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud size={16} />
              <span>Uploaded Books ({allUploadedResources.length})</span>
            </button>

            <button
              id="admin-tab-lesson-plans-btn"
              onClick={() => setAdminTab('lesson_plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                adminTab === 'lesson_plans'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={16} />
              <span>Teacher Lesson Plans ({allCustomLessonPlans.length})</span>
            </button>

            {canAccessUserAccounts ? (
              <button
                id="admin-tab-credentials-btn"
                onClick={() => setAdminTab('credentials')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  adminTab === 'credentials'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={16} />
                <span>User Accounts ({credentials.length})</span>
              </button>
            ) : (
              <div
                id="admin-tab-credentials-locked"
                title="Access Restricted: Only Administrators and STEAM Managers can access User Accounts"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-400 bg-white/5 border border-white/10 cursor-not-allowed opacity-75"
              >
                <Lock size={14} className="text-amber-400" />
                <span>User Accounts</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold border border-amber-500/30">
                  Admin & STEAM Only
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: UPLOADED RESOURCES & CURRICULUM REPOSITORY MANAGEMENT */}
      {/* ========================================================================= */}
      {adminTab === 'uploads' && (
        <div className="space-y-6">
          {/* Uploaded Materials Stats & Bulk Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Uploaded</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <UploadCloud size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-900 mt-2">{allUploadedResources.length}</p>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Custom PDF & Flipbooks</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Books</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-900 mt-2">
                {allUploadedResources.filter(r => r.format === 'pdf').length}
              </p>
              <span className="text-[11px] text-blue-600/80 font-medium mt-0.5 block">Documents & Lab Manuals</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interactive Flipbooks</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-900 mt-2">
                {allUploadedResources.filter(r => r.format === 'flipbook').length}
              </p>
              <span className="text-[11px] text-purple-600/80 font-medium mt-0.5 block">3D Digital Textbooks</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Uploaders</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-2">{availableUploaders.length}</p>
              <span className="text-[11px] text-emerald-600/80 font-medium mt-0.5 block">Identified Faculty Members</span>
            </div>
          </div>

          {/* Uploaded Materials Table & Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Top Toolbar: Search, Filters & "Delete All Uploaded" Action */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-slate-50/50">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="admin-search-uploaded-resources"
                  type="text"
                  value={uploadSearchQuery}
                  onChange={(e) => setUploadSearchQuery(e.target.value)}
                  placeholder="Search by title, uploader name, email, role, or ID..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
                />
                {uploadSearchQuery && (
                  <button
                    onClick={() => setUploadSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Action Buttons: Batch Delete & "Delete All Uploaded" */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Delete Selected (Batch) */}
                {selectedResourceIds.length > 0 && (
                  <button
                    id="admin-batch-delete-btn"
                    onClick={() => setIsBatchDeleteModalOpen(true)}
                    className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-rose-200 shadow-xs active:scale-95 animate-in fade-in"
                  >
                    <Trash2 size={14} />
                    <span>Delete Selected ({selectedResourceIds.length})</span>
                  </button>
                )}

                {/* Primary Admin Button: Delete All Uploaded */}
                <button
                  id="admin-delete-all-uploaded-btn"
                  onClick={() => {
                    setDeleteAllConfirmText('');
                    setIsDeleteAllModalOpen(true);
                  }}
                  disabled={allUploadedResources.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 active:scale-95"
                  title="Purge all custom uploaded textbooks, PDFs, and worksheets from Firestore"
                >
                  <Trash2 size={16} />
                  <span>Delete All Uploaded ({allUploadedResources.length})</span>
                </button>

                {/* Quick Upload Button */}
                {onOpenUploadModal && (
                  <button
                    id="admin-quick-upload-btn"
                    onClick={onOpenUploadModal}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Upload New Book</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills Bar: Format, Grade, Uploader, Department Scope, and Scope Filters */}
            <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Department Access Filter for Scoped Admins */}
                {userAdminScope === 'specific' && !isSuperAdmin && (
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                    <Building2 size={13} className="text-amber-700" />
                    <span className="text-amber-800 font-bold text-[11px]">Dept Scope:</span>
                    <button
                      onClick={() => setDeptFilterMode('all')}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        deptFilterMode === 'all'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      All Depts
                    </button>
                    <button
                      onClick={() => setDeptFilterMode('my_depts')}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        deptFilterMode === 'my_depts'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      My Assigned ({userAssignedDepts.filter(d => d !== 'All').length})
                    </button>
                  </div>
                )}

                {/* Format Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-bold text-[11px]">Format:</span>
                  {(['all', 'pdf', 'flipbook', 'worksheet'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setUploadFormatFilter(fmt)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        uploadFormatFilter === fmt
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {fmt === 'all' ? 'All' : fmt.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Grade Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-bold text-[11px]">Grade:</span>
                  <select
                    value={uploadGradeFilter}
                    onChange={(e) => setUploadGradeFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Grades</option>
                    {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>

                {/* Uploader Identification Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-bold text-[11px]">Uploader:</span>
                  <select
                    value={uploadUploaderFilter}
                    onChange={(e) => setUploadUploaderFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none max-w-[170px] truncate"
                  >
                    <option value="all">All Uploaders ({availableUploaders.length})</option>
                    {availableUploaders.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scope Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-bold text-[11px]">Target Scope:</span>
                  <select
                    value={uploadScopeFilter}
                    onChange={(e) => setUploadScopeFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Scopes</option>
                    <option value="portal">Portal & Library (Public)</option>
                    <option value="personal">Personal Library Only</option>
                  </select>
                </div>
              </div>

              {filteredUploadedResources.length > 0 && (
                <button
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  {isAllSelected ? <CheckSquare size={14} className="text-rose-600" /> : <Square size={14} />}
                  <span>{isAllSelected ? 'Deselect All' : 'Select All Visible'}</span>
                </button>
              )}
            </div>

            {/* Uploaded Materials Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10.5px] tracking-wider">
                    <th className="py-3 px-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="py-3 px-4">Resource & Identifier</th>
                    <th className="py-3 px-4">Subject & Grade</th>
                    <th className="py-3 px-4">Format & Scope</th>
                    <th className="py-3 px-4">Uploaded By (Admin Identified)</th>
                    <th className="py-3 px-4">Timestamp & Size</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUploadedResources.length > 0 ? (
                    filteredUploadedResources.map((res) => {
                      const isSelected = selectedResourceIds.includes(res.id);
                      const uploaderRole = res.uploadedByRole || (res.uploadedByUserId?.includes('admin') ? 'Administrator' : 'Educator');
                      const uploaderName = res.uploadedByUserName || res.author || 'Dewey Faculty';
                      const uploaderEmail = res.uploadedByEmail || (res.uploadedByUserId ? `${res.uploadedByUserId.split('-')[0]}@diu.edu.kh` : 'curriculum@diu.edu.kh');
                      const uploaderDept = res.uploadedByDepartment || `${res.subject} Department`;

                      return (
                        <tr
                          key={res.id}
                          id={`uploaded-resource-row-${res.id}`}
                          className={`hover:bg-rose-50/30 transition-colors ${
                            isSelected ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-3.5 px-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(res.id)}
                              className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>

                          {/* Cover, Title & System Identifier */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3 min-w-[240px]">
                              <div className="w-10 h-13 rounded-lg overflow-hidden shrink-0 shadow-2xs border border-slate-200 bg-slate-100 relative mt-0.5">
                                {res.coverImage ? (
                                  <img
                                    src={res.coverImage}
                                    alt={res.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <BookCoverIllustration
                                    subject={res.subject as any}
                                    grade={res.grade}
                                    title={res.title}
                                    className="w-full h-full text-[6px]"
                                  />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-slate-900 block leading-tight line-clamp-1">
                                  {res.title}
                                </span>
                                <span className="text-[11px] text-slate-400 block line-clamp-1 font-normal">
                                  {res.subtitle || 'Custom uploaded curriculum material'}
                                </span>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 select-all" title="System ID">
                                    {res.id}
                                  </span>
                                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    Custom Upload
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Subject & Grade */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                                Grade {res.grade}
                              </span>
                              <span className="text-[11px] text-slate-600 block font-semibold truncate max-w-[130px]">
                                {res.subject}
                              </span>
                            </div>
                          </td>

                          {/* Format & Scope */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                res.format === 'pdf'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {res.format === 'pdf' ? <FileText size={11} /> : <BookOpen size={11} />}
                                <span>{res.format}</span>
                              </span>
                              <div>
                                {res.isPersonalOnly ? (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                    <LockKeyhole size={10} />
                                    <span>Personal Only</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    <Globe size={10} />
                                    <span>Portal & Library</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Uploaded By (Admin Identified) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2 min-w-[180px]">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                                uploaderRole.includes('Admin')
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : uploaderRole.includes('Student')
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                                {uploaderName.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                                    {uploaderName}
                                  </span>
                                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                    uploaderRole.includes('Admin')
                                      ? 'bg-purple-100 text-purple-700'
                                      : uploaderRole.includes('Student')
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {uploaderRole}
                                  </span>
                                </div>
                                <span className="text-[10.5px] text-slate-500 font-mono block truncate max-w-[160px]" title={uploaderEmail}>
                                  {uploaderEmail}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                                  {uploaderDept}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Timestamp & Size */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 text-slate-500 text-[11px] min-w-[110px]">
                              <div className="flex items-center gap-1 font-semibold text-slate-700">
                                <Calendar size={11} className="text-slate-400" />
                                <span>{res.uploadedAt ? new Date(res.uploadedAt).toLocaleDateString() : 'Active'}</span>
                              </div>
                              <span className="block text-slate-400 text-[10.5px]">
                                {res.totalPages ? `${res.totalPages} pgs` : 'PDF'} • {res.fileSize || '2.4 MB'}
                              </span>
                            </div>
                          </td>

                          {/* Admin Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Identity & Metadata */}
                              <button
                                onClick={() => setInspectingResource(res)}
                                title="Inspect Complete Uploader Identity & Metadata"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors border border-slate-200 hover:border-indigo-200"
                              >
                                <Info size={15} />
                              </button>

                              {/* Open / Read */}
                              {onOpenResource && (
                                <button
                                  onClick={() => onOpenResource(res)}
                                  title="Open in Flipbook Viewer"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                                >
                                  <Eye size={15} />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => setSingleDeletingResource(res)}
                                title="Permanently delete this uploaded resource"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-400">
                        <UploadCloud size={36} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-700">No uploaded curriculum resources found.</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          {allUploadedResources.length === 0 
                            ? 'All uploaded resources have been deleted, or no custom curriculum files have been uploaded yet.'
                            : 'No uploaded resources match the current search or uploader filters.'}
                        </p>
                        {onOpenUploadModal && (
                          <button
                            onClick={onOpenUploadModal}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
                          >
                            <Plus size={14} />
                            <span>Upload a Document or PDF Book</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEACHER LESSON PLANS REPOSITORY & AUDIT */}
      {/* ========================================================================= */}
      {adminTab === 'lesson_plans' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Plans</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-indigo-900 mt-2">{allCustomLessonPlans.length}</p>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Stored in Firebase</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Schedules</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-900 mt-2">
                {allCustomLessonPlans.filter(p => p.scope === 'weekly').length}
              </p>
              <span className="text-[11px] text-blue-600/80 font-medium mt-0.5 block">20-Lesson Plans</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Plans</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-900 mt-2">
                {allCustomLessonPlans.filter(p => p.scope === 'daily' || !p.scope).length}
              </p>
              <span className="text-[11px] text-purple-600/80 font-medium mt-0.5 block">5E Instructional Model</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mastery Units</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FolderCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-2">
                {allCustomLessonPlans.filter(p => p.scope === 'monthly' || p.scope === 'yearly' || p.scope === 'quarter').length}
              </p>
              <span className="text-[11px] text-emerald-600/80 font-medium mt-0.5 block">Quarterly & Yearly Curricula</span>
            </div>
          </div>

          {/* Lesson Plans Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={uploadSearchQuery}
                  onChange={(e) => setUploadSearchQuery(e.target.value)}
                  placeholder="Search lesson plans by title, teacher, subject..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {userAdminScope === 'specific' && !isSuperAdmin && (
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-xs">
                    <Building2 size={13} className="text-amber-700" />
                    <button
                      onClick={() => setDeptFilterMode('all')}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        deptFilterMode === 'all'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      All Depts
                    </button>
                    <button
                      onClick={() => setDeptFilterMode('my_depts')}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        deptFilterMode === 'my_depts'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      My Depts ({userAssignedDepts.filter(d => d !== 'All').length})
                    </button>
                  </div>
                )}

                <select
                  value={uploadGradeFilter}
                  onChange={(e) => setUploadGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Grades</option>
                  {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10.5px] tracking-wider">
                    <th className="py-3 px-4">Scope & Plan Title</th>
                    <th className="py-3 px-4">Subject & Grade</th>
                    <th className="py-3 px-4">Created By Educator (Identified)</th>
                    <th className="py-3 px-4">Duration & Schedule</th>
                    <th className="py-3 px-4">Objectives</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLessonPlans.length > 0 ? (
                    filteredLessonPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-block text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                              plan.scope === 'weekly' ? 'bg-blue-100 text-blue-800' :
                              plan.scope === 'yearly' ? 'bg-purple-100 text-purple-800' :
                              plan.scope === 'monthly' ? 'bg-emerald-100 text-emerald-800' :
                              plan.scope === 'quarter' ? 'bg-amber-100 text-amber-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {plan.scope ? `${plan.scope.toUpperCase()} SCOPE` : 'DAILY 5E'}
                            </span>
                            <span className="font-extrabold text-slate-900 block leading-tight">
                              {plan.title}
                            </span>
                            {plan.unitTitle && (
                              <span className="text-[11px] text-slate-400 block">Unit: {plan.unitTitle}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                              Grade {plan.grade}
                            </span>
                            <span className="text-[11px] text-slate-600 block font-semibold">
                              {plan.subject}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 block">
                                {plan.teacherName || 'Dewey Educator'}
                              </span>
                              {plan.createdByRole && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                  {plan.createdByRole}
                                </span>
                              )}
                            </div>
                            <span className="text-[10.5px] text-slate-400 font-mono block">
                              {plan.createdByUserEmail || 'faculty@diu.edu.kh'}
                            </span>
                            {plan.createdByDepartment && (
                              <span className="text-[10px] text-slate-400 block">
                                {plan.createdByDepartment}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-600 font-medium block">
                            {plan.duration}
                          </span>
                          {plan.createdAt && (
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(plan.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold text-slate-700">
                            {plan.learningObjectives?.length || 3} Learning Goals
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect */}
                            <button
                              onClick={() => setInspectingLessonPlan(plan)}
                              title="Inspect Lesson Plan Details"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors border border-slate-200 hover:border-indigo-200"
                            >
                              <Info size={15} />
                            </button>

                            {/* Download */}
                            <button
                              onClick={() => downloadLessonPlanDocument(plan)}
                              title="Download Lesson Plan Document"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-slate-200 hover:border-blue-200"
                            >
                              <Download size={15} />
                            </button>

                            {/* Delete */}
                            {onDeleteLessonPlan && (
                              <button
                                onClick={() => setSingleDeletingLessonPlan(plan)}
                                title="Delete Lesson Plan"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Layers size={36} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-700">No educator lesson plans found.</p>
                        <p className="text-xs text-slate-400 mt-1">Lesson plans created in the Lesson Planner will appear here with full teacher metadata.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USER CREDENTIALS & ACCOUNTS VAULT */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {adminTab === 'credentials' && (
        !canAccessUserAccounts ? (
          <div className="py-12 px-4 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-lg text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert size={32} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-black border border-amber-200">
                  <Lock size={12} />
                  <span>Institutional Access Protocol</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  User Accounts Access Restricted
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                  Only institutional <strong>Administrators</strong> and <strong>STEAM Managers</strong> (Super Admins) are authorized to view user registrations, manage credentials, or assign roles.
                </p>
              </div>

              {/* User Role Details Card */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-600">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Current Session:</span>
                  <span className="font-bold text-slate-800">{currentUser?.name || 'Guest / Unauthenticated'}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Assigned Role:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {currentUser?.role || 'Guest'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Required Authority:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                    Administrator or STEAM Manager
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenAuthModal && (
                  <button
                    onClick={() => onOpenAuthModal('signin')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2"
                  >
                    <Key size={15} />
                    <span>Sign In as Admin or STEAM</span>
                  </button>
                )}
                <button
                  onClick={() => setAdminTab('uploads')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5"
                >
                  <BookOpen size={15} />
                  <span>Return to Books Management</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* 4 Stats Cards for Users */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`text-left bg-white rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
                selectedRoleFilter === 'all'
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{stats.total}</p>
              <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">View All Registrations</span>
            </button>

            <button
              onClick={() => setSelectedRoleFilter('Administrator')}
              className={`text-left bg-white rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
                selectedRoleFilter === 'Administrator'
                  ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrators</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-900 mt-2">{stats.admins}</p>
              <span className="text-[11px] text-purple-600/80 font-medium mt-0.5 block">Governance & IT</span>
            </button>

            <button
              onClick={() => setSelectedRoleFilter('Educator')}
              className={`text-left bg-white rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
                selectedRoleFilter === 'Educator' || selectedRoleFilter === 'Lead Curriculum Specialist' || selectedRoleFilter === 'STEAM Manager'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Members</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Key size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-900 mt-2">{stats.faculty}</p>
              <span className="text-[11px] text-amber-600/80 font-medium mt-0.5 block">Teachers & STEAM</span>
            </button>

            <button
              onClick={() => setSelectedRoleFilter('Student')}
              className={`text-left bg-white rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
                selectedRoleFilter === 'Student'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-2">{stats.students}</p>
              <span className="text-[11px] text-emerald-600/80 font-medium mt-0.5 block">Secondary Scholars</span>
            </button>
          </div>

          {/* User Credentials Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Controls Row: Search & Role Filters */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="admin-search-credentials-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, role, or password..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="admin-create-user-btn"
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus size={15} />
                  <span>Add User</span>
                </button>

                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
                  <button
                    onClick={handleExportCSV}
                    title="Export CSV"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    title="Export JSON"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">JSON</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Role Filter Tabs */}
            <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold text-[11px] mr-1 hidden md:inline">Filter Role:</span>
              {['all', 'Administrator', 'STEAM Manager', 'Lead Curriculum Specialist', 'Educator', 'Student'].map((role) => (
                <button
                  key={role}
                  id={`filter-role-${role.toLowerCase().replace(/\s+/g, '-')}-btn`}
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                    selectedRoleFilter === role
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>

            {/* Credentials Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10.5px] tracking-wider">
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Login Email (ID)</th>
                    <th className="py-3.5 px-4">Stored Password</th>
                    <th className="py-3.5 px-4">Role & Dept</th>
                    <th className="py-3.5 px-4">Grade</th>
                    <th className="py-3.5 px-4">Firebase Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCredentials.length > 0 ? (
                    filteredCredentials.map((cred) => {
                      const isPasswordRevealed = !!revealedPasswords[cred.email];
                      const isCurrentLogged = currentUser?.email.toLowerCase() === cred.email.toLowerCase();

                      return (
                        <tr
                          key={cred.email}
                          id={`user-cred-row-${cred.email.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            isCurrentLogged ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          {/* Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 min-w-[170px]">
                              {cred.avatarUrl ? (
                                <img
                                  src={cred.avatarUrl}
                                  alt={cred.name}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {cred.initials || 'DU'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900">{cred.name}</span>
                                  {isCurrentLogged && (
                                    <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 block font-normal">
                                  Registered: {new Date(cred.registeredAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 group">
                              <span className="font-mono text-xs font-semibold text-slate-900">{cred.email}</span>
                              <button
                                title="Copy Email"
                                onClick={() => handleCopyText(cred.email, `email-${cred.email}`)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-60 group-hover:opacity-100"
                              >
                                {copiedKey === `email-${cred.email}` ? (
                                  <Check size={13} className="text-emerald-600" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Password */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-100 border border-slate-200/90 rounded-lg px-2.5 py-1 font-mono text-xs font-bold text-slate-900 flex items-center gap-2 min-w-[120px] justify-between shadow-2xs">
                                <span>{isPasswordRevealed ? cred.password : '••••••••••••'}</span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordReveal(cred.email)}
                                  title={isPasswordRevealed ? 'Hide password' : 'Show password'}
                                  className="text-slate-400 hover:text-slate-700 p-0.5"
                                >
                                  {isPasswordRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>

                              <button
                                title="Copy Password"
                                onClick={() => handleCopyText(cred.password, `pass-${cred.email}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                {copiedKey === `pass-${cred.email}` ? (
                                  <Check size={14} className="text-emerald-600" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Role & Department with Quick Role Changer */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <select
                                  id={`role-select-${cred.id || getEmailDocId(cred.email)}`}
                                  value={cred.role}
                                  onChange={(e) => handleQuickRoleChange(cred, e.target.value as UserProfile['role'])}
                                  title="Click to assign or change role for this user"
                                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs ${
                                    cred.role === 'Administrator'
                                      ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                                      : cred.role === 'STEAM Manager'
                                      ? 'bg-amber-50 text-amber-950 border-amber-400 hover:bg-amber-100 font-black'
                                      : cred.role === 'Lead Curriculum Specialist'
                                      ? 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100'
                                      : cred.role === 'Educator'
                                      ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                                      : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                  }`}
                                >
                                  <option value="Administrator">Administrator</option>
                                  <option value="STEAM Manager">STEAM Manager (Super Admin)</option>
                                  <option value="Lead Curriculum Specialist">Curriculum Specialist</option>
                                  <option value="Educator">Educator (Faculty)</option>
                                  <option value="Student">Student (Scholar)</option>
                                </select>

                                {(cred.isSuperAdmin || isSuperAdminEmail(cred.email) || cred.role === 'STEAM Manager') && (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs">
                                    <Crown size={10} />
                                    <span>Super Admin</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-600 block truncate max-w-[170px] font-medium">
                                {cred.department || 'Academic Department'}
                              </span>
                              {/* Scoped admin info */}
                              {cred.role === 'Administrator' && (
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                                    cred.adminScope === 'specific'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    {cred.adminScope === 'specific'
                                      ? `${(cred.assignedDepartments || []).filter(d => d !== 'All').length} Depts Scoped`
                                      : 'All Depts (Global)'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Grade */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-bold text-slate-700">
                              {cred.gradeAssigned ? `Grade ${cred.gradeAssigned}` : 'All (K–12)'}
                            </span>
                          </td>

                          {/* Firebase Sync Status */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Firestore Vault</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Assign Role & Scope Button */}
                              <button
                                id={`assign-role-btn-${cred.id || getEmailDocId(cred.email)}`}
                                title="Assign Role & Configure Scopes"
                                onClick={() => setRoleAssignmentModalUser(cred)}
                                className="px-2.5 py-1.5 rounded-lg text-amber-700 hover:text-amber-800 hover:bg-amber-100 transition-colors border border-amber-300 bg-amber-50/80 text-xs font-bold flex items-center gap-1 shadow-2xs"
                              >
                                <ShieldCheck size={14} className="text-amber-600" />
                                <span className="hidden md:inline">Assign Role</span>
                              </button>

                              {/* Test Sign In As Button */}
                              <button
                                title="Sign in as this user to test portal experience"
                                onClick={() => handleTestSignInAsUser(cred)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <LogIn size={15} />
                              </button>

                              {/* Edit / Change Password */}
                              <button
                                title="Edit User or Reset Password in Firebase"
                                onClick={() => handleOpenEditModal(cred)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* Delete */}
                              {isSuperAdminEmail(cred.email) || isSuperAdminUser(cred) ? (
                                <span
                                  title="Protected Super Admin account cannot be deleted"
                                  className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                                >
                                  <Shield size={15} />
                                </span>
                              ) : (
                                <button
                                  title="Delete Account from Firebase"
                                  onClick={() => setDeletingUser(cred)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-600">No matching user records found.</p>
                        <p className="text-xs text-slate-400 mt-1">Try modifying your search query or role filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DELETE ALL UPLOADED RESOURCES CONFIRMATION (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-6 relative">
              <button
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-rose-100 text-xs font-bold mb-2">
                <AlertTriangle size={13} />
                <span>Irreversible Administrative Action</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Delete All Uploaded Resources?
              </h3>
              <p className="text-xs text-rose-100/90 mt-1">
                This will permanently remove all custom uploaded books, PDFs, and learning materials across Firebase Firestore.
              </p>
            </div>

            <div className="p-6 space-y-4 text-slate-700 text-xs sm:text-sm">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <Trash2 size={16} className="text-rose-600" />
                  <span>Items to be permanently purged:</span>
                </div>
                <ul className="list-disc list-inside text-xs text-rose-800 space-y-1 pl-1">
                  <li><span className="font-bold">{allUploadedResources.length} uploaded curriculum files</span> will be deleted.</li>
                  <li>Removed immediately from all active teachers' and students' bookshelves.</li>
                  <li>Firestore documents and metadata will be permanently expunged.</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500">
                Are you completely sure you want to delete all uploaded resources from the Dewey International School repository?
              </p>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeletingBulk}
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingBulk}
                  onClick={handleConfirmDeleteAllUploads}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2"
                >
                  {isDeletingBulk ? (
                    <span>Purging from Firestore...</span>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>Confirm Delete All ({allUploadedResources.length}) Uploads</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BATCH DELETE SELECTED RESOURCES CONFIRMATION */}
      {/* ========================================================================= */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete {selectedResourceIds.length} Selected Resources?</h3>
              <p className="text-xs text-slate-500">
                This will permanently delete the {selectedResourceIds.length} selected materials from Firebase Firestore and domain bookshelves in real time.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={handleConfirmBatchDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                {isDeletingBulk ? 'Deleting...' : `Delete ${selectedResourceIds.length} Resources`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SINGLE RESOURCE DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {singleDeletingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Uploaded Resource?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{singleDeletingResource.title}"</span>? This will remove it from Firebase Firestore and all connected users immediately.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSingleDeletingResource(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Delete from Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT / CREATE USER MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 relative">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-xs font-bold mb-2">
                <Database size={12} />
                <span>Firebase Cloud Vault</span>
              </div>
              <h3 className="text-xl font-black text-white">
                {isCreatingNew ? 'Provision New Academic Account' : 'Edit Credentials & Password'}
              </h3>
              <p className="text-xs text-blue-100/90 mt-1">
                {isCreatingNew
                  ? 'The credentials and password will be immediately stored in Firebase Firestore.'
                  : `Update credentials for ${editingEmail} in Firebase Firestore.`}
              </p>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Prof. Sarath Som"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!isCreatingNew}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. som.sarath@diu.edu.kh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Password (Stored in Firebase)</span>
                  <span className="text-[11px] font-normal text-blue-600">Visible to Admin</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role & Grade Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>User Role</span>
                    <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                      <ShieldCheck size={11} />
                      <span>Admin Authority</span>
                    </span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserProfile['role'];
                      setFormRole(newRole);
                      if (newRole === 'STEAM Manager') {
                        setFormAdminScope('all');
                        setFormAssignedDepartments(['All']);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="Administrator">Administrator (IT & Governance)</option>
                    <option value="STEAM Manager">STEAM Manager (Super Admin)</option>
                    <option value="Lead Curriculum Specialist">Lead Curriculum Specialist</option>
                    <option value="Educator">Educator (Faculty)</option>
                    <option value="Student">Student (Scholar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Grade Focus
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Grades (K–12)</option>
                    {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Scope & Task Delegation Settings (For Admins) */}
              {(formRole === 'Administrator' || formRole === 'STEAM Manager') && (
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-blue-600" />
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        {formRole === 'STEAM Manager' ? 'Super Admin Scope' : 'Administrative Governance & Task Scope'}
                      </span>
                    </div>
                    {formRole === 'STEAM Manager' ? (
                      <span className="text-[10.5px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                        Global Executive
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        Task Delegation
                      </span>
                    )}
                  </div>

                  {formRole === 'STEAM Manager' ? (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-black">
                        <Crown size={14} className="text-amber-600" />
                        <span>Unrestricted Super Admin Authority</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        As STEAM Manager (vanthanbour@diu.edu.kh), this account holds full governance over all academic departments, user role assignments, teacher curricula, and domain-wide asset purging.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Scope Type Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Department Authority:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormAdminScope('all');
                              setFormAssignedDepartments(['All']);
                            }}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-start gap-2 ${
                              formAdminScope === 'all'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Globe size={14} className="shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">All Departments</div>
                              <div className={`text-[10px] ${formAdminScope === 'all' ? 'text-blue-100' : 'text-slate-400'}`}>
                                School-wide access
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormAdminScope('specific');
                              if (formAssignedDepartments.includes('All') || formAssignedDepartments.length === 0) {
                                setFormAssignedDepartments(['Science & STEAM Innovation']);
                              }
                            }}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-start gap-2 ${
                              formAdminScope === 'specific'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Building2 size={14} className="shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">Specific Departments</div>
                              <div className={`text-[10px] ${formAdminScope === 'specific' ? 'text-blue-100' : 'text-slate-400'}`}>
                                Task-scoped access
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Department Multi-Select Checkboxes if Specific */}
                      {formAdminScope === 'specific' && (
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[11px] font-bold text-slate-600">
                            Assigned Departments:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                            {INSTITUTIONAL_DEPARTMENTS.filter(d => d !== 'All').map(dept => {
                              const isChecked = formAssignedDepartments.includes(dept);
                              return (
                                <label
                                  key={dept}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                    isChecked ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormAssignedDepartments(prev => [...prev.filter(d => d !== 'All'), dept]);
                                      } else {
                                        setFormAssignedDepartments(prev => {
                                          const next = prev.filter(d => d !== dept);
                                          return next.length === 0 ? ['Science & STEAM Innovation'] : next;
                                        });
                                      }
                                    }}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                  />
                                  <span className="truncate">{dept}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Assigned Tasks Checkboxes */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Assigned Administrative Responsibilities:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {ADMIN_TASK_OPTIONS.map(task => {
                            const isTaskChecked = formAssignedTasks.includes(task.id);
                            return (
                              <label
                                key={task.id}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                  isTaskChecked
                                    ? 'bg-white border-blue-400 text-blue-900 shadow-2xs font-bold'
                                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isTaskChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormAssignedTasks(prev => [...prev, task.id]);
                                    } else {
                                      setFormAssignedTasks(prev => prev.filter(t => t !== task.id));
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span>{task.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Subject Focus
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Science & STEAM Innovation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrative Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Head of secondary math curriculum"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <span>Saving to Firebase...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{isCreatingNew ? 'Create & Store in Firebase' : 'Update Credentials'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4B: SUPER ADMIN QUICK ROLE & SCOPE ASSIGNMENT MODAL */}
      {/* ========================================================================= */}
      {roleAssignmentModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-6 relative">
              <button
                onClick={() => setRoleAssignmentModalUser(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-100 text-xs font-black mb-2">
                <Crown size={13} />
                <span>Super Admin Governance Authority</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Assign Role & Delegate Department Scope
              </h3>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Executive authority of STEAM Manager (vanthanbour@diu.edu.kh) to assign roles and task permissions.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
              {/* Target User Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Account</div>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">{roleAssignmentModalUser.name}</div>
                  <div className="font-mono text-xs text-slate-500">{roleAssignmentModalUser.email}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Role</span>
                  <span className="inline-block mt-0.5 text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900">
                    {roleAssignmentModalUser.role}
                  </span>
                </div>
              </div>

              {/* Select New Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Institutional Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Administrator', 'STEAM Manager', 'Lead Curriculum Specialist', 'Educator', 'Student'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleQuickRoleChange(roleAssignmentModalUser, r)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        roleAssignmentModalUser.role === r
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <div className="truncate">{r}</div>
                      <div className={`text-[10px] font-medium ${roleAssignmentModalUser.role === r ? 'text-amber-100' : 'text-slate-400'}`}>
                        {r === 'STEAM Manager' ? 'Super Admin' : r === 'Administrator' ? 'Scoped Ops' : 'Standard'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit full details shortcut */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">
                  Need to configure fine-grained department checkboxes and task assignments?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const u = roleAssignmentModalUser;
                    setRoleAssignmentModalUser(null);
                    handleOpenEditModal(u);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shrink-0 ml-2"
                >
                  Open Full Editor
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setRoleAssignmentModalUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE USER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete User Account?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deletingUser.name}</span> ({deletingUser.email})? This will permanently remove their credentials and permissions from Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Delete from Firebase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: INSPECT RESOURCE IDENTIFICATION & METADATA AUDIT (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {inspectingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 relative">
              <button
                onClick={() => setInspectingResource(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-2">
                <ShieldCheck size={13} />
                <span>Institutional Provenance & Uploader Identification Audit</span>
              </div>
              <h3 className="text-xl font-black text-white line-clamp-1">
                {inspectingResource.title}
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Complete security audit trail, uploader credentials, and Firestore system identifiers.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
              {/* Uploader Identification Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <UserCheck size={15} className="text-indigo-600" />
                  <span>Uploader Identity & Account Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Faculty Member / Name:</span>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {inspectingResource.uploadedByUserName || inspectingResource.author || 'Dewey Faculty'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Institutional Email:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {inspectingResource.uploadedByEmail || (inspectingResource.uploadedByUserId ? `${inspectingResource.uploadedByUserId.split('-')[0]}@diu.edu.kh` : 'curriculum@diu.edu.kh')}
                      </span>
                      <button
                        onClick={() => handleCopyText(inspectingResource.uploadedByEmail || 'curriculum@diu.edu.kh', 'inspect-email')}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500"
                        title="Copy Email"
                      >
                        {copiedKey === 'inspect-email' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Institutional Role:</span>
                    <span className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 mt-0.5">
                      {inspectingResource.uploadedByRole || 'Educator'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Department / Program:</span>
                    <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                      {inspectingResource.uploadedByDepartment || `${inspectingResource.subject} Department`}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[11px] text-slate-400 block font-bold">Firebase User Identifier:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 select-all">
                        {inspectingResource.uploadedByUserId || 'system-repository'}
                      </span>
                      <button
                        onClick={() => handleCopyText(inspectingResource.uploadedByUserId || 'system-repository', 'inspect-uid')}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500"
                        title="Copy User ID"
                      >
                        {copiedKey === 'inspect-uid' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Distribution & Educational Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Subject</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{inspectingResource.subject}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Grade Target</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">Grade {inspectingResource.grade}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Document Format</span>
                  <span className="text-xs font-black uppercase text-indigo-700 block mt-0.5">{inspectingResource.format}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Distribution Scope</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                    {inspectingResource.isPersonalOnly ? 'Personal Only' : 'Portal & Personal Library'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Uploaded Timestamp</span>
                  <span className="text-xs font-medium text-slate-700 block mt-0.5">
                    {inspectingResource.uploadedAt ? new Date(inspectingResource.uploadedAt).toLocaleString() : 'Active'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Resource System ID</span>
                  <span className="font-mono text-[10.5px] text-slate-700 block mt-0.5 truncate select-all">{inspectingResource.id}</span>
                </div>
              </div>

              {/* Raw JSON Manifest for Admin Export */}
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Raw Firestore Resource Manifest
                </span>
                <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[10.5px] overflow-x-auto max-h-36 border border-slate-800">
                  {JSON.stringify({
                    id: inspectingResource.id,
                    title: inspectingResource.title,
                    subject: inspectingResource.subject,
                    grade: inspectingResource.grade,
                    format: inspectingResource.format,
                    uploadedByUserId: inspectingResource.uploadedByUserId,
                    uploadedByUserName: inspectingResource.uploadedByUserName,
                    uploadedByEmail: inspectingResource.uploadedByEmail,
                    uploadedByRole: inspectingResource.uploadedByRole,
                    uploadedByDepartment: inspectingResource.uploadedByDepartment,
                    uploadedAt: inspectingResource.uploadedAt,
                    isCustomUpload: inspectingResource.isCustomUpload,
                    isPersonalOnly: inspectingResource.isPersonalOnly
                  }, null, 2)}
                </pre>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inspectingResource, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `resource_${inspectingResource.id}_audit.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Export Audit JSON</span>
                </button>

                <div className="flex items-center gap-2">
                  {onOpenResource && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenResource(inspectingResource);
                        setInspectingResource(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>Open in Viewer</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInspectingResource(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: INSPECT LESSON PLAN AUDIT (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {inspectingLessonPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 relative">
              <button
                onClick={() => setInspectingLessonPlan(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-2">
                <Layers size={13} />
                <span>Educator Lesson Plan & Provenance Audit</span>
              </div>
              <h3 className="text-xl font-black text-white line-clamp-1">
                {inspectingLessonPlan.title}
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Teacher curriculum design metadata, scope alignment, and instructional goals.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
              {/* Creator Educator Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <UserCheck size={15} className="text-indigo-600" />
                  <span>Teacher / Author Identity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Teacher Name:</span>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {inspectingLessonPlan.teacherName || 'Dewey Educator'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Educator Email:</span>
                    <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                      {inspectingLessonPlan.createdByUserEmail || 'faculty@diu.edu.kh'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Department:</span>
                    <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                      {inspectingLessonPlan.createdByDepartment || `${inspectingLessonPlan.subject} Department`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Subject & Grade:</span>
                    <span className="text-xs font-bold text-indigo-700 block mt-0.5">
                      {inspectingLessonPlan.subject} • Grade {inspectingLessonPlan.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 block">
                  Learning Objectives ({inspectingLessonPlan.learningObjectives?.length || 0})
                </span>
                <ul className="list-disc list-inside text-xs text-blue-950 space-y-1">
                  {inspectingLessonPlan.learningObjectives?.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => downloadLessonPlanDocument(inspectingLessonPlan)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download Lesson Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingLessonPlan(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: DELETE LESSON PLAN CONFIRMATION (ADMIN) */}
      {/* ========================================================================= */}
      {singleDeletingLessonPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Lesson Plan?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{singleDeletingLessonPlan.title}"</span>? This will permanently remove it from Firestore and teacher planners.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSingleDeletingLessonPlan(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteLessonPlan && singleDeletingLessonPlan) {
                    onDeleteLessonPlan(singleDeletingLessonPlan.id);
                    setSingleDeletingLessonPlan(null);
                    setStatusMessage({ type: 'success', text: `Lesson plan "${singleDeletingLessonPlan.title}" deleted from Firebase.` });
                    setTimeout(() => setStatusMessage(null), 3000);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

