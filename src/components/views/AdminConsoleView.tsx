import React, { useState, useEffect, useMemo } from 'react';
import {
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
  ExternalLink
} from 'lucide-react';
import { UserProfile, UserCredentialRecord, GradeLevel } from '../../types';
import {
  subscribeToAllUserCredentials,
  saveUserCredentialToFirestore,
  updateUserPasswordInFirestore,
  deleteUserCredentialFromFirestore,
  seedInitialInstitutionalCredentialsToFirestore,
  INITIAL_INSTITUTIONAL_CREDENTIALS
} from '../../lib/firebaseServices';
import { saveStoredCredential, saveStoredRecentUser } from '../AuthModal';

interface AdminConsoleViewProps {
  currentUser: UserProfile | null;
  onSwitchUser?: (user: UserProfile) => void;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  currentUser,
  onSwitchUser,
  onOpenAuthModal
}) => {
  const [credentials, setCredentials] = useState<UserCredentialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm State
  const [deletingUser, setDeletingUser] = useState<UserCredentialRecord | null>(null);

  // Subscribe to real-time credentials from Firebase Firestore
  useEffect(() => {
    setIsLoading(true);
    // Ensure initial presets are seeded to Firestore
    seedInitialInstitutionalCredentialsToFirestore();

    const unsubscribe = subscribeToAllUserCredentials((list) => {
      setCredentials(list);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered credentials list
  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      // Role filter
      if (selectedRoleFilter !== 'all' && cred.role !== selectedRoleFilter) {
        return false;
      }
      // Search query
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

  // Statistics
  const stats = useMemo(() => {
    const total = credentials.length;
    const admins = credentials.filter(c => c.role === 'Administrator').length;
    const faculty = credentials.filter(c => c.role === 'Educator' || c.role === 'Lead Curriculum Specialist' || c.role === 'STEAM Manager').length;
    const students = credentials.filter(c => c.role === 'Student').length;
    return { total, admins, faculty, students };
  }, [credentials]);

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
    setFormDepartment('Academic Faculty');
    setFormGrade('9');
    setFormNotes('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (record: UserCredentialRecord) => {
    setIsCreatingNew(false);
    setEditingEmail(record.email);
    setFormName(record.name);
    setFormEmail(record.email);
    setFormPassword(record.password);
    setFormRole(record.role);
    setFormDepartment(record.department || '');
    setFormGrade(record.gradeAssigned || '');
    setFormNotes(record.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formPassword.trim() || !formName.trim()) {
      setStatusMessage({ type: 'error', text: 'Name, email, and password are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const initials = formName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DU';

      const cleanEmail = formEmail.trim().toLowerCase();

      if (isCreatingNew) {
        const newRecord: UserCredentialRecord = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
          notes: formNotes.trim()
        };

        await saveUserCredentialToFirestore(newRecord);
        saveStoredCredential({
          email: cleanEmail,
          password: formPassword.trim(),
          profile: {
            id: newRecord.id,
            name: newRecord.name,
            email: newRecord.email,
            role: newRecord.role,
            initials: newRecord.initials,
            department: newRecord.department,
            gradeAssigned: newRecord.gradeAssigned
          }
        });

        setStatusMessage({ type: 'success', text: `Successfully registered and stored credentials for ${newRecord.name} in Firebase!` });
      } else {
        await updateUserPasswordInFirestore(
          editingEmail,
          formPassword.trim(),
          formRole,
          formDepartment.trim(),
          formGrade || undefined
        );

        // Also update stored local vault for seamless offline fallback
        const updatedProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          name: formName.trim(),
          email: cleanEmail,
          role: formRole,
          initials,
          department: formDepartment.trim(),
          gradeAssigned: formGrade ? (formGrade as GradeLevel) : undefined
        };
        saveStoredCredential({
          email: cleanEmail,
          password: formPassword.trim(),
          profile: updatedProfile
        });

        setStatusMessage({ type: 'success', text: `Updated credentials for ${formName} in Firebase Firestore.` });
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
        <div className="absolute bottom-0 right-1/4 -mb-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Administrator Portal & Credential Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>User & Login Details Registry</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold flex items-center gap-1">
                <Database size={12} className="animate-pulse" />
                <span>Firebase Firestore Synced</span>
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              All faculty, student, and administrator accounts and passwords are encrypted and synchronized in Firebase Firestore. Search, manage, reveal passwords, or provision new accounts.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="admin-create-user-btn"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <UserPlus size={16} />
              <span>Add New User / Admin</span>
            </button>

            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
              <button
                id="admin-export-csv-btn"
                onClick={handleExportCSV}
                title="Export all credentials to CSV"
                className="p-2 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Download size={14} />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                id="admin-export-json-btn"
                onClick={handleExportJSON}
                title="Export all credentials to JSON"
                className="p-2 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Download size={14} />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>
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

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Stored in Firebase</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrators</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-900 mt-2">{stats.admins}</p>
          <span className="text-[11px] text-purple-600/80 font-medium mt-0.5 block">Governance & IT</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Members</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{stats.faculty}</p>
          <span className="text-[11px] text-amber-600/80 font-medium mt-0.5 block">Teachers & STEAM</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-900 mt-2">{stats.students}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-0.5 block">Secondary Scholars</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls Row: Search & Role Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
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

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] mr-1 hidden md:inline">Role Filter:</span>
            {['all', 'Administrator', 'STEAM Manager', 'Lead Curriculum Specialist', 'Educator', 'Student'].map((role) => (
              <button
                key={role}
                id={`filter-role-${role.toLowerCase().replace(/\s+/g, '-')}-btn`}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                  selectedRoleFilter === role
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
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

                      {/* Role & Department */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block text-[10.5px] font-extrabold px-2 py-0.5 rounded-md ${
                              cred.role === 'Administrator'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : cred.role === 'STEAM Manager'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : cred.role === 'Lead Curriculum Specialist'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : cred.role === 'Educator'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {cred.role}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                            {cred.department || 'Academic Department'}
                          </span>
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
                        <div className="flex items-center justify-end gap-1">
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
                          <button
                            title="Delete Account from Firebase"
                            onClick={() => setDeletingUser(cred)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Edit / Create User Modal */}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    User Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserProfile['role'])}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="STEAM Manager">STEAM Manager</option>
                    <option value="Lead Curriculum Specialist">Curriculum Specialist</option>
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

      {/* Delete User Confirmation Modal */}
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
    </div>
  );
};
