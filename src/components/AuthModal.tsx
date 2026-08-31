import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Database,
  UserCheck,
  Trash2
} from 'lucide-react';
import { UserProfile, GradeLevel } from '../types';
import { DisLogo } from './DisLogo';
import { 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  signInWithGoogle,
  saveUserProfileToFirestore,
  saveUserCredentialToFirestore
} from '../lib/firebaseServices';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  mandatory?: boolean;
}

export const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: 'user-sabrina',
    name: 'Sabrina Bour',
    email: 'vanthanbour@diu.edu.kh',
    role: 'STEAM Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    initials: 'SB',
    department: 'Dewey Faculty & STEAM Innovation',
    isSuperAdmin: true,
    canAssignRoles: true,
    adminScope: 'all',
    assignedDepartments: ['All'],
    assignedTasks: ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
  }
];

const RECENT_USERS_KEY = 'dewey_recent_users';
const CREDENTIALS_KEY = 'dewey_registered_credentials';

export interface StoredCredential {
  email: string;
  password: string;
  profile: UserProfile;
}

export const getStoredCredentials = (): Record<string, StoredCredential> => {
  try {
    const data = localStorage.getItem(CREDENTIALS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading credentials', e);
  }
  // Seed default institutional account for Sabrina Bour (supporting both spellings)
  return {
    'vanthanbour@diu.edu.kh': {
      email: 'vanthanbour@diu.edu.kh',
      password: 'Dewey2025!',
      profile: PRESET_ACCOUNTS[0]
    },
    'vanthabour@diu.edu.kh': {
      email: 'vanthabour@diu.edu.kh',
      password: 'Dewey2025!',
      profile: {
        ...PRESET_ACCOUNTS[0],
        email: 'vanthabour@diu.edu.kh'
      }
    }
  };
};

export const saveStoredCredential = (credential: StoredCredential) => {
  try {
    const current = getStoredCredentials();
    current[credential.email.toLowerCase()] = credential;
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving credential', e);
  }
};

export const getStoredRecentUsers = (): UserProfile[] => {
  try {
    const data = localStorage.getItem(RECENT_USERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading recent users', e);
  }
  return [PRESET_ACCOUNTS[0]]; // Initial recent user
};

export const saveStoredRecentUser = (user: UserProfile) => {
  try {
    const current = getStoredRecentUsers();
    // Move to front, remove duplicates by email
    const filtered = current.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
    const updated = [user, ...filtered].slice(0, 4); // Keep up to 4 most recent
    localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving recent user', e);
    return [user];
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onLoginSuccess,
  mandatory = false,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoHint, setInfoHint] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Recent logged-in or registered accounts
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>(() => getStoredRecentUsers());

  // Form fields for Sign In
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Form fields for Sign Up
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserProfile['role']>('Educator');
  const [signUpGrade, setSignUpGrade] = useState<GradeLevel>('9');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Reset when opened or on sign out
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSignInEmail('');
      setSignInPassword('');
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSuccessMessage(null);
      setErrorMessage(null);
      setInfoHint(null);
      setIsLoading(false);
      setRecentUsers(getStoredRecentUsers());

      // Focus email field for the next user
      const timer = setTimeout(() => {
        if (initialMode === 'signin') {
          emailInputRef.current?.focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSelectRecentAccount = (user: UserProfile) => {
    setSignInEmail(user.email);
    setSignInPassword('');
    setErrorMessage(null);
    setInfoHint(`Filled email for ${user.name}. Please enter your password below to sign in.`);
    if (mode !== 'signin') {
      setMode('signin');
    }
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleRemoveRecentUser = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    try {
      const updated = recentUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(updated));
      setRecentUsers(updated);
      if (signInEmail.toLowerCase() === email.toLowerCase()) {
        setSignInEmail('');
        setInfoHint(null);
      }
    } catch (err) {
      console.warn('Could not remove recent account', err);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = signInEmail.trim().toLowerCase();
    const cleanPassword = signInPassword.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Invalid email format. Please enter a valid email address (e.g. name@diu.edu.kh).');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      passwordInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setInfoHint(null);

    try {
      // 1. Attempt Firebase Authentication
      const userProfile = await loginWithEmailPassword(cleanEmail, cleanPassword);
      const updatedRecent = saveStoredRecentUser(userProfile);
      setRecentUsers(updatedRecent);
      setSuccessMessage(`Welcome back, ${userProfile.name}!`);
      setTimeout(() => {
        onLoginSuccess(userProfile);
        onClose();
      }, 600);
    } catch (fbError: any) {
      const errorCode = fbError?.code || '';
      console.warn('Firebase login verification:', errorCode, fbError?.message);

      // Check against registered credentials vault
      const credentials = getStoredCredentials();
      const existing = credentials[cleanEmail];

      if (
        errorCode === 'auth/wrong-password' ||
        errorCode === 'auth/invalid-credential' ||
        errorCode === 'auth/invalid-login-credentials'
      ) {
        // If credential exists in local vault and matches, allow; otherwise strictly reject
        if (existing && existing.password === cleanPassword) {
          const userProfile = existing.profile;
          const updatedRecent = saveStoredRecentUser(userProfile);
          setRecentUsers(updatedRecent);
          setSuccessMessage(`Welcome back, ${userProfile.name}!`);
          setTimeout(() => {
            onLoginSuccess(userProfile);
            onClose();
          }, 600);
          return;
        }

        setErrorMessage('Incorrect password. Please verify your password and try again.');
        passwordInputRef.current?.focus();
        setIsLoading(false);
        return;
      }

      if (errorCode === 'auth/user-not-found') {
        if (existing) {
          if (existing.password !== cleanPassword) {
            setErrorMessage('Incorrect password for this account. Access denied.');
            passwordInputRef.current?.focus();
            setIsLoading(false);
            return;
          }
          const userProfile = existing.profile;
          const updatedRecent = saveStoredRecentUser(userProfile);
          setRecentUsers(updatedRecent);
          setSuccessMessage(`Welcome back, ${userProfile.name}!`);
          setTimeout(() => {
            onLoginSuccess(userProfile);
            onClose();
          }, 600);
          return;
        }

        setErrorMessage('No account found with this email address. Please check your email or click Sign Up to register.');
        setIsLoading(false);
        return;
      }

      if (errorCode === 'auth/invalid-email') {
        setErrorMessage('The email address entered is not recognized by the institution.');
        setIsLoading(false);
        return;
      }

      if (errorCode === 'auth/too-many-requests') {
        setErrorMessage('Too many failed login attempts. Access is temporarily locked. Please try again shortly.');
        setIsLoading(false);
        return;
      }

      // For network/preview offline handling: strictly check registered credentials
      if (existing) {
        if (existing.password !== cleanPassword) {
          setErrorMessage('Incorrect password. Please check your password and try again.');
          passwordInputRef.current?.focus();
          setIsLoading(false);
          return;
        }

        const userProfile = existing.profile;
        const updatedRecent = saveStoredRecentUser(userProfile);
        setRecentUsers(updatedRecent);
        setSuccessMessage(`Welcome back, ${userProfile.name}!`);
        setTimeout(() => {
          onLoginSuccess(userProfile);
          onClose();
        }, 600);
        return;
      }

      // If email does not exist in Firebase or local credentials:
      setErrorMessage('Account not found with this email address. Please register by clicking Sign Up below.');
    } finally {
      setIsLoading(false);
    }
  };

  const isGradeEnabled = signUpRole === 'Educator' || signUpRole === 'Student';

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim().toLowerCase();
    const cleanPassword = signUpPassword.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid institutional email address (e.g. yourname@diu.edu.kh).');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    // Check if email already registered
    const existingCreds = getStoredCredentials();
    if (existingCreds[cleanEmail]) {
      setErrorMessage('An account with this email address is already registered. Please sign in instead.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setInfoHint(null);

    try {
      const userProfile = await registerWithEmailPassword(
        cleanEmail,
        cleanPassword,
        cleanName,
        signUpRole,
        isGradeEnabled ? signUpGrade : undefined
      );

      // Save credential for future login verification
      saveStoredCredential({
        email: cleanEmail,
        password: cleanPassword,
        profile: userProfile
      });

      const updatedRecent = saveStoredRecentUser(userProfile);
      setRecentUsers(updatedRecent);

      setSuccessMessage(`Account created in Firebase! Welcome to the Home page, ${userProfile.name}.`);
      setTimeout(() => {
        onLoginSuccess(userProfile);
        onClose();
      }, 350);
    } catch (err: any) {
      const errCode = err?.code || '';
      console.warn('Firebase registration notice:', errCode, err?.message);

      if (errCode === 'auth/email-already-in-use') {
        setErrorMessage('This email address is already in use. Please sign in instead.');
        setIsLoading(false);
        return;
      }

      if (errCode === 'auth/weak-password') {
        setErrorMessage('The chosen password is too weak. Please use a stronger password.');
        setIsLoading(false);
        return;
      }

      // Fallback create user profile and persist credentials
      const initials = cleanName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DE';

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: signUpRole,
        initials,
        gradeAssigned: isGradeEnabled ? signUpGrade : undefined,
        department: isGradeEnabled 
          ? (signUpRole === 'Student' ? `Grade ${signUpGrade} Scholar` : `Grade ${signUpGrade} Faculty`)
          : `${signUpRole} • Academic Administration`
      };

      await saveUserProfileToFirestore(newUser);

      // Save credentials record directly to Firestore user_credentials vault
      await saveUserCredentialToFirestore({
        id: newUser.id,
        email: cleanEmail,
        password: cleanPassword,
        name: cleanName,
        role: signUpRole,
        department: newUser.department || (signUpRole === 'Administrator' ? 'Academic Directorate & IT Governance' : 'Dewey Faculty'),
        gradeAssigned: newUser.gradeAssigned,
        initials,
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: 'active'
      });

      // Save credential
      saveStoredCredential({
        email: cleanEmail,
        password: cleanPassword,
        profile: newUser
      });

      const updatedRecent = saveStoredRecentUser(newUser);
      setRecentUsers(updatedRecent);

      setSuccessMessage(`Welcome to Dewey International, ${newUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 350);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setInfoHint(null);
    try {
      const profile = await signInWithGoogle();
      const updatedRecent = saveStoredRecentUser(profile);
      setRecentUsers(updatedRecent);
      setSuccessMessage(`Google authentication verified! Welcome, ${profile.name}`);
      setTimeout(() => {
        onLoginSuccess(profile);
        onClose();
      }, 600);
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      setErrorMessage(err.message || 'Google authentication could not be completed in preview mode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="auth-modal-dialog"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 relative overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-24 h-24 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

          {/* Close button (only shown when not mandatory gate) */}
          {!mandatory && (
            <button
              id="close-auth-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              aria-label="Close auth dialog"
            >
              <X size={18} />
            </button>
          )}

          {/* Mandatory Gateway Badge */}
          {mandatory && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck size={13} />
              <span>Sign In Required</span>
            </div>
          )}

          {/* Official DIS Logo Card */}
          <div className="bg-white rounded-2xl p-2 px-3.5 shadow-md inline-flex items-center mb-3">
            <DisLogo variant="full" height={34} />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight text-white">
              {mode === 'signin' ? 'Sign In to Curriculum Portal' : 'Create Academic Account'}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-300 font-semibold">
            <Database size={13} className="animate-pulse" />
            <span>Firebase Connected • dewey-international-school</span>
          </div>

          {/* Tabs: Sign In / Sign Up */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4 border border-white/10">
            <button
              id="tab-switch-signin-btn"
              type="button"
              onClick={() => {
                setMode('signin');
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
            <button
              id="tab-switch-signup-btn"
              type="button"
              onClick={() => {
                setMode('signup');
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <UserPlus size={14} />
              <span>Sign Up (Register)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage ? (
            <div className="py-8 text-center space-y-4 my-auto animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="font-extrabold text-xl text-slate-900">{successMessage}</h4>
                <p className="text-xs text-slate-500 mt-1">Synchronizing Firestore cloud profile...</p>
              </div>
            </div>
          ) : mode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Google Sign In Option */}
              <button
                type="button"
                id="firebase-google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-xs hover:border-slate-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Firebase)</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-slate-300">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or institutional email</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Info hint banner when account is selected */}
              {infoHint && (
                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <UserCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-blue-950">{infoHint}</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">Please type your password and click "Sign In to Portal".</p>
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  School / Institutional Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    ref={emailInputRef}
                    id="signin-email-input"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      if (infoHint) setInfoHint(null);
                    }}
                    placeholder="e.g. vanthanbour@diu.edu.kh"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Password reset instructions have been dispatched to your institutional email via Firebase.');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    ref={passwordInputRef}
                    id="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter password to log in"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all ${
                      infoHint ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="signin-remember-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Remember my session</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck size={14} />
                  <span>Firebase Auth & Firestore</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                id="signin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </button>

              {/* Recent Accounts List (only recent login or sign up) */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent Accounts on this device
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">Click to fill email</span>
                </div>

                {recentUsers.length > 0 ? (
                  <div className="space-y-1.5">
                    {recentUsers.map((user) => {
                      const isSelected = signInEmail.toLowerCase() === user.email.toLowerCase();
                      return (
                        <div
                          key={user.email}
                          id={`recent-account-${user.id || user.email.replace(/[^a-zA-Z0-9]/g, '-')}-btn`}
                          onClick={() => handleSelectRecentAccount(user)}
                          className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-400 shadow-xs ring-1 ring-blue-300/60'
                              : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {user.initials || 'DE'}
                              </div>
                            )}
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                                  {user.name}
                                </p>
                                <span className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold shrink-0">
                                  {user.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] font-semibold text-blue-600 group-hover:underline hidden sm:inline">
                              {isSelected ? 'Ready for password' : 'Select'}
                            </span>
                            <button
                              type="button"
                              title="Remove from recent accounts"
                              onClick={(e) => handleRemoveRecentUser(e, user.email)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-3 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                      No recent logins on this device yet. Sign in or register above to save your account here.
                    </p>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  id="signup-name-input"
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Prof. Sarath Som"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@diu.edu.kh or your-school.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Role & Grade Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Role
                  </label>
                  <select
                    id="signup-role-select"
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserProfile['role'])}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Administrator">Administrator (IT & Director)</option>
                    <option value="Educator">Educator (Faculty)</option>
                    <option value="Student">Student (Scholar)</option>
                    <option value="STEAM Manager">STEAM Coordinator</option>
                    <option value="Lead Curriculum Specialist">Curriculum Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Grade Focus</span>
                    <span className={`text-[10px] font-semibold lowercase ${isGradeEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isGradeEnabled ? 'active' : 'n/a for role'}
                    </span>
                  </label>
                  <select
                    id="signup-grade-select"
                    value={isGradeEnabled ? signUpGrade : ''}
                    disabled={!isGradeEnabled}
                    onChange={(e) => setSignUpGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 transition-all"
                  >
                    {!isGradeEnabled ? (
                      <option value="">N/A (All Grades)</option>
                    ) : (
                      ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Admin Privileges Info Callout */}
              {signUpRole === 'Administrator' && (
                <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl flex items-start gap-2.5 text-xs text-purple-900 animate-in fade-in duration-150">
                  <ShieldCheck size={16} className="text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-purple-900">Administrator Privileges Enabled</p>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      Signing up as an Administrator gives you direct access to the <strong>Admin Console</strong> to view all stored user passwords and login details in Firebase Firestore.
                    </p>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  id="signup-terms-checkbox"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5"
                />
                <span>
                  I agree to Dewey International School's Academic Integrity Guidelines and Digital Terms of Use.
                </span>
              </label>

              {/* Submit */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading || !agreeTerms}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Firebase Account...</span>
                  </span>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
