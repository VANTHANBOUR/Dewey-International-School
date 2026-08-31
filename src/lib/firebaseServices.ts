import { 
  auth, 
  db, 
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot, 
  serverTimestamp,
  FirebaseUser
} from './firebase';
import { 
  UserProfile, 
  Resource, 
  NotificationItem, 
  UserCredentialRecord,
  LessonPlanItem,
  SharedResourceItem,
  InstitutionalAnnouncement,
  ActivityLogItem,
  UserPersonalData,
  isSuperAdminEmail
} from '../types';

// Institutional Preset Accounts with login details
export const INITIAL_INSTITUTIONAL_CREDENTIALS: UserCredentialRecord[] = [
  {
    id: 'user-sabrina',
    name: 'Sabrina Bour',
    email: 'vanthanbour@diu.edu.kh',
    password: 'Dewey2025!',
    role: 'STEAM Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    initials: 'SB',
    department: 'Dewey Faculty & STEAM Innovation',
    registeredAt: '2025-01-15T08:00:00.000Z',
    status: 'active',
    isPreset: true,
    isSuperAdmin: true,
    canAssignRoles: true,
    adminScope: 'all',
    assignedDepartments: ['All'],
    assignedTasks: ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight'],
    notes: 'Default Super Admin (STEAM Manager) with exclusive authority to assign roles and manage all departments'
  },
  {
    id: 'user-admin',
    name: 'System Administrator',
    email: 'admin@diu.edu.kh',
    password: 'AdminDewey2025!',
    role: 'Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    initials: 'SA',
    department: 'Academic Directorate & IT Governance',
    registeredAt: '2025-01-10T08:00:00.000Z',
    status: 'active',
    isPreset: true,
    isSuperAdmin: false,
    canAssignRoles: false,
    adminScope: 'all',
    assignedDepartments: ['All'],
    assignedTasks: ['books_management', 'lesson_plans_audit', 'curriculum_review', 'analytics_oversight'],
    notes: 'Department & task-scoped Administrator'
  },
  {
    id: 'user-evelyn',
    name: 'Dr. Evelyn Martinez',
    email: 'evelyn.martinez@diu.edu.kh',
    password: 'Science2025!',
    role: 'Lead Curriculum Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1580894732488-b210214a1a72?q=80&w=200&auto=format&fit=crop',
    initials: 'EM',
    department: 'Science & Biology Department Head',
    gradeAssigned: '11',
    registeredAt: '2025-02-01T09:30:00.000Z',
    status: 'active',
    isPreset: true,
    notes: 'AP Biology & Secondary Science Lead'
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@diu.edu.kh',
    password: 'Physics2025!',
    role: 'Educator',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    initials: 'MV',
    department: 'Physics & Senior Laboratory',
    gradeAssigned: '10',
    registeredAt: '2025-02-10T10:15:00.000Z',
    status: 'active',
    isPreset: true,
    notes: 'Physical Sciences Instructor'
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@diu.edu.kh',
    password: 'Math2025!',
    role: 'Educator',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    initials: 'ER',
    department: 'Mathematics Faculty',
    gradeAssigned: '9',
    registeredAt: '2025-03-01T11:00:00.000Z',
    status: 'active',
    isPreset: true,
    notes: 'Algebra II & Pre-Calculus Teacher'
  },
  {
    id: 'user-student-serey',
    name: 'Serey Vathanak',
    email: 'serey.vathanak@diu.edu.kh',
    password: 'Student2025!',
    role: 'Student',
    initials: 'SV',
    department: 'Grade 10 Scholar',
    gradeAssigned: '10',
    registeredAt: '2025-04-12T14:20:00.000Z',
    status: 'active',
    isPreset: true,
    notes: 'High School Honors Student'
  }
];

// Helper to sanitize email for document key
export const getEmailDocId = (email: string) => {
  return email.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
};

// Save or Update User Profile in Firestore
export const saveUserProfileToFirestore = async (userProfile: UserProfile): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userProfile.id);
    await setDoc(userRef, {
      ...userProfile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not save user profile to Firestore:', error);
  }
};

// Save User Credential & Login Details directly into Firestore
export const saveUserCredentialToFirestore = async (record: UserCredentialRecord): Promise<void> => {
  const docId = getEmailDocId(record.email);
  const cleanEmail = record.email.toLowerCase().trim();
  const isSuper = isSuperAdminEmail(cleanEmail) || record.isSuperAdmin || record.role === 'STEAM Manager' || record.role === 'Super Admin';

  try {
    const credRef = doc(db, 'user_credentials', docId);
    await setDoc(credRef, {
      ...record,
      email: cleanEmail,
      isSuperAdmin: isSuper,
      canAssignRoles: isSuper,
      adminScope: isSuper ? 'all' : (record.adminScope || 'all'),
      assignedDepartments: isSuper ? ['All'] : (record.assignedDepartments || ['All']),
      assignedTasks: isSuper ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight'] : (record.assignedTasks || ['books_management', 'lesson_plans_audit']),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also update users collection
    const userRef = doc(db, 'users', record.id);
    await setDoc(userRef, {
      id: record.id,
      name: record.name,
      email: cleanEmail,
      role: record.role,
      avatarUrl: record.avatarUrl || null,
      initials: record.initials,
      department: record.department || 'Academic Faculty',
      gradeAssigned: record.gradeAssigned || null,
      isSuperAdmin: isSuper,
      canAssignRoles: isSuper,
      adminScope: isSuper ? 'all' : (record.adminScope || 'all'),
      assignedDepartments: isSuper ? ['All'] : (record.assignedDepartments || ['All']),
      assignedTasks: isSuper ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight'] : (record.assignedTasks || ['books_management', 'lesson_plans_audit']),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not save user credential to Firestore:', error);
  }
};

// Fetch User Credential Record by Email from Firestore
export const fetchUserCredentialByEmail = async (email: string): Promise<UserCredentialRecord | null> => {
  const docId = getEmailDocId(email);
  try {
    const credRef = doc(db, 'user_credentials', docId);
    const snap = await getDoc(credRef);
    if (snap.exists()) {
      return snap.data() as UserCredentialRecord;
    }
  } catch (error) {
    console.warn('Error fetching credential from Firestore:', error);
  }
  return null;
};

// Helper to get local storage credentials
export const getLocalStorageCredentials = (): Record<string, any> => {
  try {
    const data = localStorage.getItem('dewey_registered_credentials');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('Error reading local credentials:', e);
  }
  return {};
};

// Fetch All Registered User Credentials & Accounts from Firestore (for Admin Access)
export const fetchAllUserCredentialsFromFirestore = async (): Promise<UserCredentialRecord[]> => {
  try {
    const map = new Map<string, UserCredentialRecord>();

    // 1. Seed initial institutional accounts into map
    for (const cred of INITIAL_INSTITUTIONAL_CREDENTIALS) {
      map.set(cred.email.toLowerCase().trim(), cred);
    }

    // 2. Load from localStorage
    const local = getLocalStorageCredentials();
    for (const key of Object.keys(local)) {
      const item = local[key];
      if (item && item.email) {
        const cleanEmail = item.email.toLowerCase().trim();
        const profile = item.profile || {};
        map.set(cleanEmail, {
          id: profile.id || `local-${cleanEmail}`,
          email: cleanEmail,
          password: item.password || 'Dewey2025!',
          name: profile.name || item.name || 'Dewey Member',
          role: profile.role || item.role || 'Educator',
          department: profile.department || 'Dewey Faculty',
          gradeAssigned: profile.gradeAssigned,
          initials: profile.initials || 'DM',
          registeredAt: item.registeredAt || new Date().toISOString(),
          status: 'active',
          isSuperAdmin: isSuperAdminEmail(cleanEmail) || profile.isSuperAdmin,
          canAssignRoles: isSuperAdminEmail(cleanEmail) || profile.canAssignRoles || true,
          adminScope: profile.adminScope || 'all',
          assignedDepartments: profile.assignedDepartments || ['All'],
          assignedTasks: profile.assignedTasks || ['books_management', 'lesson_plans_audit']
        });
      }
    }

    // 3. Fetch from user_credentials collection
    try {
      const credsCol = collection(db, 'user_credentials');
      const snapshot = await getDocs(credsCol);
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as UserCredentialRecord;
        if (data && data.email) {
          map.set(data.email.toLowerCase().trim(), {
            ...data,
            email: data.email.toLowerCase().trim()
          });
        }
      });
    } catch (err) {
      console.warn('Error fetching user_credentials collection:', err);
    }

    // 4. Fetch from users collection
    try {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      userSnapshot.forEach(docSnap => {
        const userData = docSnap.data() as any;
        if (userData && userData.email) {
          const email = userData.email.toLowerCase().trim();
          const existing = map.get(email);
          const isSuper = isSuperAdminEmail(email) || userData.isSuperAdmin || userData.role === 'STEAM Manager' || userData.role === 'Super Admin';
          map.set(email, {
            id: userData.id || docSnap.id,
            email,
            password: existing?.password || 'Dewey2025!',
            name: userData.name || existing?.name || 'Registered User',
            role: userData.role || existing?.role || 'Educator',
            department: userData.department || existing?.department || 'Dewey Faculty',
            gradeAssigned: userData.gradeAssigned || existing?.gradeAssigned,
            avatarUrl: userData.avatarUrl || existing?.avatarUrl,
            initials: userData.initials || existing?.initials || 'DU',
            registeredAt: userData.createdAt || existing?.registeredAt || new Date().toISOString(),
            lastLoginAt: userData.lastLoginAt || existing?.lastLoginAt,
            status: userData.status || 'active',
            isSuperAdmin: isSuper,
            canAssignRoles: isSuper || true,
            adminScope: isSuper ? 'all' : (userData.adminScope || existing?.adminScope || 'all'),
            assignedDepartments: isSuper ? ['All'] : (userData.assignedDepartments || existing?.assignedDepartments || ['All']),
            assignedTasks: isSuper
              ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
              : (userData.assignedTasks || existing?.assignedTasks || ['books_management', 'lesson_plans_audit'])
          });
        }
      });
    } catch (err) {
      console.warn('Error fetching users collection:', err);
    }

    return Array.from(map.values());
  } catch (error) {
    console.warn('Error reading all credentials from Firestore:', error);
  }
  return INITIAL_INSTITUTIONAL_CREDENTIALS;
};

// Subscribe to real-time credentials and user registrations in Firestore
export const subscribeToAllUserCredentials = (onUpdate: (credentials: UserCredentialRecord[]) => void) => {
  try {
    const credsCol = collection(db, 'user_credentials');
    const usersCol = collection(db, 'users');

    let currentCreds: Map<string, UserCredentialRecord> = new Map();
    let currentUsers: Map<string, any> = new Map();

    const mergeAndEmit = () => {
      const mergedMap = new Map<string, UserCredentialRecord>();

      // 1. Initial presets
      for (const cred of INITIAL_INSTITUTIONAL_CREDENTIALS) {
        mergedMap.set(cred.email.toLowerCase().trim(), cred);
      }

      // 2. Local storage
      const local = getLocalStorageCredentials();
      for (const key of Object.keys(local)) {
        const item = local[key];
        if (item && item.email) {
          const cleanEmail = item.email.toLowerCase().trim();
          const profile = item.profile || {};
          mergedMap.set(cleanEmail, {
            id: profile.id || `local-${cleanEmail}`,
            email: cleanEmail,
            password: item.password || 'Dewey2025!',
            name: profile.name || item.name || 'Dewey Member',
            role: profile.role || item.role || 'Educator',
            department: profile.department || 'Dewey Faculty',
            gradeAssigned: profile.gradeAssigned,
            initials: profile.initials || 'DM',
            registeredAt: item.registeredAt || new Date().toISOString(),
            status: 'active',
            isSuperAdmin: isSuperAdminEmail(cleanEmail) || profile.isSuperAdmin,
            canAssignRoles: true,
            adminScope: profile.adminScope || 'all',
            assignedDepartments: profile.assignedDepartments || ['All'],
            assignedTasks: profile.assignedTasks || ['books_management', 'lesson_plans_audit']
          });
        }
      }

      // 3. Firestore user_credentials
      currentCreds.forEach((val, key) => {
        mergedMap.set(key, val);
      });

      // 4. Firestore users collection
      currentUsers.forEach((userData, emailKey) => {
        const existing = mergedMap.get(emailKey);
        const isSuper = isSuperAdminEmail(emailKey) || userData.isSuperAdmin || userData.role === 'STEAM Manager' || userData.role === 'Super Admin';
        mergedMap.set(emailKey, {
          id: userData.id || existing?.id || `usr-${emailKey}`,
          email: emailKey,
          password: existing?.password || 'Dewey2025!',
          name: userData.name || existing?.name || 'Dewey Member',
          role: userData.role || existing?.role || 'Educator',
          department: userData.department || existing?.department || 'Dewey Faculty',
          gradeAssigned: userData.gradeAssigned || existing?.gradeAssigned,
          avatarUrl: userData.avatarUrl || existing?.avatarUrl,
          initials: userData.initials || existing?.initials || 'DU',
          registeredAt: userData.createdAt || existing?.registeredAt || new Date().toISOString(),
          lastLoginAt: userData.lastLoginAt || existing?.lastLoginAt,
          status: userData.status || 'active',
          isSuperAdmin: isSuper,
          canAssignRoles: true,
          adminScope: isSuper ? 'all' : (userData.adminScope || existing?.adminScope || 'all'),
          assignedDepartments: isSuper ? ['All'] : (userData.assignedDepartments || existing?.assignedDepartments || ['All']),
          assignedTasks: isSuper
            ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
            : (userData.assignedTasks || existing?.assignedTasks || ['books_management', 'lesson_plans_audit'])
        });
      });

      const list = Array.from(mergedMap.values());
      onUpdate(list.length > 0 ? list : INITIAL_INSTITUTIONAL_CREDENTIALS);
    };

    const unsubCreds = onSnapshot(credsCol, (snapshot) => {
      const nextCreds = new Map<string, UserCredentialRecord>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserCredentialRecord;
        if (data && data.email) {
          nextCreds.set(data.email.toLowerCase().trim(), {
            ...data,
            email: data.email.toLowerCase().trim()
          });
        }
      });
      currentCreds = nextCreds;
      mergeAndEmit();
    }, (err) => {
      console.warn('user_credentials onSnapshot error:', err);
      mergeAndEmit();
    });

    const unsubUsers = onSnapshot(usersCol, (snapshot) => {
      const nextUsers = new Map<string, any>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        if (data && data.email) {
          nextUsers.set(data.email.toLowerCase().trim(), data);
        }
      });
      currentUsers = nextUsers;
      mergeAndEmit();
    }, (err) => {
      console.warn('users onSnapshot error:', err);
      mergeAndEmit();
    });

    return () => {
      unsubCreds();
      unsubUsers();
    };
  } catch (e) {
    console.warn('Failed to establish Firestore credentials listener:', e);
    onUpdate(INITIAL_INSTITUTIONAL_CREDENTIALS);
    return () => {};
  }
};

// Quick Role Assignment to Any User in Firestore
export const assignUserRoleInFirestore = async (
  email: string,
  newRole: UserProfile['role'],
  options?: {
    department?: string;
    gradeAssigned?: any;
    adminScope?: 'all' | 'specific';
    assignedDepartments?: string[];
    assignedTasks?: string[];
  }
): Promise<void> => {
  const cleanEmail = email.toLowerCase().trim();
  const docId = getEmailDocId(cleanEmail);
  const isSuper = isSuperAdminEmail(cleanEmail) || newRole === 'STEAM Manager' || newRole === 'Super Admin';

  const updatePayload: any = {
    email: cleanEmail,
    role: newRole,
    isSuperAdmin: isSuper,
    canAssignRoles: true,
    adminScope: isSuper ? 'all' : (options?.adminScope || 'all'),
    assignedDepartments: isSuper ? ['All'] : (options?.assignedDepartments || ['All']),
    assignedTasks: isSuper
      ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
      : (options?.assignedTasks || ['books_management', 'lesson_plans_audit']),
    updatedAt: serverTimestamp()
  };

  if (options?.department) {
    updatePayload.department = options.department;
  }
  if (options?.gradeAssigned !== undefined) {
    updatePayload.gradeAssigned = options.gradeAssigned;
  }

  // 1. Update user_credentials document
  try {
    const credRef = doc(db, 'user_credentials', docId);
    await setDoc(credRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn('Could not update role in user_credentials:', err);
  }

  // 2. Update users collection document
  try {
    const userRef = doc(db, 'users', docId);
    await setDoc(userRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn('Could not update role in users:', err);
  }

  // 3. Update localStorage credential
  try {
    const local = getLocalStorageCredentials();
    if (local[cleanEmail]) {
      local[cleanEmail].profile = {
        ...local[cleanEmail].profile,
        role: newRole,
        department: options?.department || local[cleanEmail].profile?.department,
        gradeAssigned: options?.gradeAssigned !== undefined ? options.gradeAssigned : local[cleanEmail].profile?.gradeAssigned,
        adminScope: updatePayload.adminScope,
        assignedDepartments: updatePayload.assignedDepartments,
        assignedTasks: updatePayload.assignedTasks
      };
      localStorage.setItem('dewey_registered_credentials', JSON.stringify(local));
    }
  } catch (err) {
    console.warn('Could not update local storage role:', err);
  }
};

// Seed initial institutional credentials into Firestore if not yet present
export const seedInitialInstitutionalCredentialsToFirestore = async (): Promise<void> => {
  try {
    for (const cred of INITIAL_INSTITUTIONAL_CREDENTIALS) {
      const docId = getEmailDocId(cred.email);
      const credRef = doc(db, 'user_credentials', docId);
      const snap = await getDoc(credRef);
      if (!snap.exists()) {
        await setDoc(credRef, {
          ...cred,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (e) {
    console.warn('Notice seeding initial institutional credentials:', e);
  }
};

// Update full user credentials and profile details in Firestore (Admin & Profile function)
export const updateUserCredentialInFirestore = async (
  originalEmail: string,
  updatedData: {
    name: string;
    email: string;
    password: string;
    role: UserProfile['role'];
    department?: string;
    gradeAssigned?: any;
    notes?: string;
    initials?: string;
    avatarUrl?: string;
    id?: string;
    isSuperAdmin?: boolean;
    adminScope?: 'all' | 'specific';
    assignedDepartments?: string[];
    assignedTasks?: string[];
    canAssignRoles?: boolean;
  }
): Promise<void> => {
  const oldDocId = getEmailDocId(originalEmail);
  const cleanEmail = updatedData.email.toLowerCase().trim();
  const newDocId = getEmailDocId(cleanEmail);

  const isSuper = isSuperAdminEmail(cleanEmail) || updatedData.isSuperAdmin || updatedData.role === 'STEAM Manager' || updatedData.role === 'Super Admin';

  const initials = updatedData.initials || updatedData.name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DU';

  const credRef = doc(db, 'user_credentials', newDocId);
  const recordToSave: any = {
    email: cleanEmail,
    name: updatedData.name.trim(),
    password: updatedData.password.trim(),
    role: updatedData.role,
    department: updatedData.department || 'Dewey Faculty',
    gradeAssigned: updatedData.gradeAssigned || null,
    notes: updatedData.notes || '',
    initials,
    status: 'active',
    isSuperAdmin: isSuper,
    canAssignRoles: isSuper,
    adminScope: isSuper ? 'all' : (updatedData.adminScope || 'all'),
    assignedDepartments: isSuper ? ['All'] : (updatedData.assignedDepartments || ['All']),
    assignedTasks: isSuper
      ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
      : (updatedData.assignedTasks || ['books_management', 'lesson_plans_audit']),
    updatedAt: serverTimestamp()
  };

  if (updatedData.id) {
    recordToSave.id = updatedData.id;
  }
  if (updatedData.avatarUrl) {
    recordToSave.avatarUrl = updatedData.avatarUrl;
  }

  // Save/merge into user_credentials
  await setDoc(credRef, recordToSave, { merge: true });

  // If email was changed, delete the previous document in user_credentials
  if (oldDocId !== newDocId) {
    try {
      const oldDocRef = doc(db, 'user_credentials', oldDocId);
      await deleteDoc(oldDocRef);
    } catch (err) {
      console.warn('Old credential doc removal notice:', err);
    }
  }

  // Also sync to users collection
  try {
    const userDocId = updatedData.id || newDocId;
    const userRef = doc(db, 'users', userDocId);
    await setDoc(userRef, {
      name: updatedData.name.trim(),
      email: cleanEmail,
      role: updatedData.role,
      department: updatedData.department || 'Dewey Faculty',
      gradeAssigned: updatedData.gradeAssigned || null,
      initials,
      avatarUrl: updatedData.avatarUrl || null,
      isSuperAdmin: isSuper,
      canAssignRoles: isSuper,
      adminScope: isSuper ? 'all' : (updatedData.adminScope || 'all'),
      assignedDepartments: isSuper ? ['All'] : (updatedData.assignedDepartments || ['All']),
      assignedTasks: isSuper
        ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
        : (updatedData.assignedTasks || ['books_management', 'lesson_plans_audit']),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (userErr) {
    console.warn('Could not sync user profile document:', userErr);
  }
};

// Update user password and details in Firestore (Admin function - backwards compatible)
export const updateUserPasswordInFirestore = async (
  email: string,
  newPassword: string,
  newRole?: UserProfile['role'],
  newDepartment?: string,
  newGrade?: any,
  newName?: string
): Promise<void> => {
  if (newName) {
    await updateUserCredentialInFirestore(email, {
      name: newName,
      email,
      password: newPassword,
      role: newRole || 'Educator',
      department: newDepartment,
      gradeAssigned: newGrade
    });
    return;
  }

  const docId = getEmailDocId(email);
  try {
    const credRef = doc(db, 'user_credentials', docId);
    const updateData: any = {
      password: newPassword,
      updatedAt: serverTimestamp()
    };
    if (newRole) updateData.role = newRole;
    if (newDepartment) updateData.department = newDepartment;
    if (newGrade) updateData.gradeAssigned = newGrade;

    await setDoc(credRef, updateData, { merge: true });
  } catch (error) {
    console.warn('Error updating password in Firestore:', error);
    throw error;
  }
};

// Delete user from Firestore
export const deleteUserCredentialFromFirestore = async (email: string, userId?: string): Promise<void> => {
  const docId = getEmailDocId(email);
  try {
    const credRef = doc(db, 'user_credentials', docId);
    await deleteDoc(credRef);
    if (userId) {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    }
  } catch (error) {
    console.warn('Error deleting user from Firestore:', error);
    throw error;
  }
};

// Convert Firebase User to Dewey UserProfile
export const mapFirebaseUserToProfile = async (fbUser: FirebaseUser, customRole?: string): Promise<UserProfile> => {
  const isSuperByEmail = isSuperAdminEmail(fbUser.email);

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const isSuper = isSuperByEmail || data.isSuperAdmin || data.role === 'STEAM Manager' || data.role === 'Super Admin';
      const role = isSuperByEmail ? 'STEAM Manager' : (data.role || (customRole as any) || 'Educator');

      return {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || (isSuperByEmail ? 'Sabrina Bour' : 'Dewey Educator'),
        email: fbUser.email || '',
        role,
        avatarUrl: fbUser.photoURL || data.avatarUrl,
        initials: data.initials || (data.name || fbUser.displayName || 'DE')
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        department: data.department || (isSuperByEmail ? 'Dewey Faculty & STEAM Innovation' : 'Academic Faculty & STEAM'),
        gradeAssigned: data.gradeAssigned,
        isSuperAdmin: isSuper,
        canAssignRoles: isSuper,
        adminScope: isSuper ? 'all' : (data.adminScope || 'all'),
        assignedDepartments: isSuper ? ['All'] : (data.assignedDepartments || ['All']),
        assignedTasks: isSuper
          ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
          : (data.assignedTasks || ['books_management', 'lesson_plans_audit'])
      };
    }
  } catch (error) {
    console.warn('Firestore user fetch fallback:', error);
  }

  // Check user_credentials collection as fallback
  if (fbUser.email) {
    try {
      const cred = await fetchUserCredentialByEmail(fbUser.email);
      if (cred) {
        const isSuper = isSuperByEmail || cred.isSuperAdmin || cred.role === 'STEAM Manager' || cred.role === 'Super Admin';
        const role = isSuperByEmail ? 'STEAM Manager' : cred.role;

        return {
          id: cred.id || fbUser.uid,
          name: cred.name,
          email: cred.email,
          role,
          avatarUrl: cred.avatarUrl,
          initials: cred.initials,
          department: cred.department,
          gradeAssigned: cred.gradeAssigned,
          isSuperAdmin: isSuper,
          canAssignRoles: isSuper,
          adminScope: isSuper ? 'all' : (cred.adminScope || 'all'),
          assignedDepartments: isSuper ? ['All'] : (cred.assignedDepartments || ['All']),
          assignedTasks: isSuper
            ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
            : (cred.assignedTasks || ['books_management', 'lesson_plans_audit'])
        };
      }
    } catch (e) {
      console.warn('Cred fallback check:', e);
    }
  }

  // Default computed profile
  const name = isSuperByEmail ? 'Sabrina Bour' : (fbUser.displayName || fbUser.email?.split('@')[0] || 'Dewey Faculty');
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DF';

  return {
    id: fbUser.uid,
    name,
    email: fbUser.email || '',
    role: isSuperByEmail ? 'STEAM Manager' : ((customRole as any) || 'Educator'),
    avatarUrl: fbUser.photoURL || undefined,
    initials,
    department: isSuperByEmail ? 'Dewey Faculty & STEAM Innovation' : 'Dewey International Faculty',
    isSuperAdmin: isSuperByEmail,
    canAssignRoles: isSuperByEmail,
    adminScope: 'all',
    assignedDepartments: ['All'],
    assignedTasks: isSuperByEmail
      ? ['all', 'books_management', 'lesson_plans_audit', 'user_management', 'curriculum_review', 'analytics_oversight']
      : ['books_management', 'lesson_plans_audit']
  };
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<UserProfile> => {
  const result = await signInWithPopup(auth, googleProvider);
  const profile = await mapFirebaseUserToProfile(result.user);
  await saveUserProfileToFirestore(profile);
  return profile;
};

// Sign in with Email and Password
export const loginWithEmailPassword = async (email: string, pass: string): Promise<UserProfile> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await mapFirebaseUserToProfile(result.user);
  return profile;
};

// Register with Email and Password
export const registerWithEmailPassword = async (
  email: string, 
  pass: string, 
  name: string, 
  role: UserProfile['role'] = 'Educator',
  gradeAssigned?: any
): Promise<UserProfile> => {
  let uid = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    uid = result.user.uid;
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
  } catch (authErr) {
    console.warn('Firebase Auth creation note (will store in Firestore):', authErr);
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DE';

  const userProfile: UserProfile = {
    id: uid,
    name,
    email: email.toLowerCase().trim(),
    role,
    initials,
    gradeAssigned,
    department: role === 'Administrator' 
      ? 'Academic Directorate & IT Governance'
      : role === 'Student'
      ? `Grade ${gradeAssigned || 'Secondary'} Scholar`
      : 'Dewey Faculty & Academic Innovation'
  };

  // 1. Save profile to Firestore
  await saveUserProfileToFirestore(userProfile);

  // 2. Save full credential record (including password & login details) in Firestore user_credentials
  const credentialRecord: UserCredentialRecord = {
    id: uid,
    email: email.toLowerCase().trim(),
    password: pass,
    name,
    role,
    department: userProfile.department,
    gradeAssigned,
    initials,
    registeredAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    status: 'active'
  };
  await saveUserCredentialToFirestore(credentialRecord);

  return userProfile;
};

// Sign Out
export const logoutFirebase = async (): Promise<void> => {
  await fbSignOut(auth);
};

// Save a Resource to Firestore
export const saveResourceToFirestore = async (resource: Resource): Promise<void> => {
  try {
    const resRef = doc(db, 'resources', resource.id);
    await setDoc(resRef, {
      ...resource,
      savedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not sync resource to Firestore:', e);
  }
};

// Delete a Resource from Firestore (Authorized for Administrator and STEAM Manager)
export const deleteResourceFromFirestore = async (resourceId: string): Promise<void> => {
  try {
    const resRef = doc(db, 'resources', resourceId);
    await deleteDoc(resRef);
  } catch (e) {
    console.warn('Could not delete resource from Firestore:', e);
  }
};

// Delete Multiple Resources from Firestore (Authorized for Administrator and STEAM Manager)
export const deleteMultipleResourcesFromFirestore = async (resourceIds: string[]): Promise<void> => {
  try {
    for (const id of resourceIds) {
      await deleteResourceFromFirestore(id);
      await markResourceAsDeletedInFirestore(id);
    }
  } catch (e) {
    console.warn('Could not batch delete resources from Firestore:', e);
  }
};

// Delete All Uploaded Resources from Firestore (Authorized for Administrator)
export const deleteAllUploadedResourcesFromFirestore = async (resourceIds: string[]): Promise<void> => {
  try {
    for (const id of resourceIds) {
      await deleteResourceFromFirestore(id);
      await markResourceAsDeletedInFirestore(id);
    }
  } catch (e) {
    console.warn('Could not delete all uploaded resources from Firestore:', e);
  }
};

// Mark a resource as deleted in Firestore so preset resources are also removed across all connected clients in real time
export const markResourceAsDeletedInFirestore = async (resourceId: string): Promise<void> => {
  try {
    const delRef = doc(db, 'deleted_resources', resourceId);
    await setDoc(delRef, {
      resourceId,
      deletedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not mark resource as deleted in Firestore:', e);
  }
};

// Subscribe to real-time deleted resources from Firestore
export const subscribeToDeletedResourceIds = (onUpdate: (deletedIds: string[]) => void) => {
  try {
    const delCol = collection(db, 'deleted_resources');
    return onSnapshot(delCol, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach(docSnap => {
        ids.push(docSnap.id);
      });
      onUpdate(ids);
    }, (err) => {
      console.warn('Firestore deleted_resources subscription note:', err);
    });
  } catch (e) {
    console.warn('Failed to establish deleted resources listener:', e);
    return () => {};
  }
};

// Subscribe to real-time custom resources from Firestore
export const subscribeToCustomResources = (onUpdate: (resources: Resource[]) => void) => {
  try {
    const resCollection = collection(db, 'resources');
    return onSnapshot(resCollection, (snapshot) => {
      const customResources: Resource[] = [];
      snapshot.forEach((doc) => {
        customResources.push(doc.data() as Resource);
      });
      onUpdate(customResources);
    }, (error) => {
      console.warn('Firestore resources subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to establish Firestore listener:', e);
    return () => {};
  }
};

// ==================== REAL-TIME LESSON PLANS ====================

// Save Lesson Plan to Firestore
export const saveLessonPlanToFirestore = async (plan: LessonPlanItem): Promise<void> => {
  try {
    const planRef = doc(db, 'lesson_plans', plan.id);
    await setDoc(planRef, {
      ...plan,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not save lesson plan to Firestore:', e);
  }
};

// Delete Lesson Plan from Firestore
export const deleteLessonPlanFromFirestore = async (planId: string): Promise<void> => {
  try {
    const planRef = doc(db, 'lesson_plans', planId);
    await deleteDoc(planRef);
  } catch (e) {
    console.warn('Could not delete lesson plan from Firestore:', e);
  }
};

// Subscribe to real-time lesson plans from Firestore
export const subscribeToLessonPlans = (onUpdate: (plans: LessonPlanItem[]) => void) => {
  try {
    const plansCol = collection(db, 'lesson_plans');
    return onSnapshot(plansCol, (snapshot) => {
      const plans: LessonPlanItem[] = [];
      snapshot.forEach((docSnap) => {
        plans.push(docSnap.data() as LessonPlanItem);
      });
      onUpdate(plans);
    }, (error) => {
      console.warn('Firestore lesson_plans subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to establish lesson_plans listener:', e);
    return () => {};
  }
};

// ==================== REAL-TIME SHARED RESOURCES ====================

// Save Shared Resource to Firestore
export const saveSharedResourceToFirestore = async (item: SharedResourceItem): Promise<void> => {
  try {
    const shareRef = doc(db, 'shared_resources', item.id);
    await setDoc(shareRef, {
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not save shared resource to Firestore:', e);
  }
};

// Delete Shared Resource from Firestore
export const deleteSharedResourceFromFirestore = async (shareId: string): Promise<void> => {
  try {
    const shareRef = doc(db, 'shared_resources', shareId);
    await deleteDoc(shareRef);
  } catch (e) {
    console.warn('Could not delete shared resource from Firestore:', e);
  }
};

// Subscribe to real-time shared resources from Firestore
export const subscribeToSharedResources = (onUpdate: (items: SharedResourceItem[]) => void) => {
  try {
    const shareCol = collection(db, 'shared_resources');
    return onSnapshot(shareCol, (snapshot) => {
      const list: SharedResourceItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SharedResourceItem);
      });
      onUpdate(list);
    }, (error) => {
      console.warn('Firestore shared_resources subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to establish shared_resources listener:', e);
    return () => {};
  }
};

// ==================== REAL-TIME ANNOUNCEMENTS ====================

export const INITIAL_ANNOUNCEMENTS: InstitutionalAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Term 3 STEAM Curriculum Synchronization',
    content: 'All secondary science and mathematics educators are encouraged to review the updated Grade 9-12 laboratory workbooks and flipbooks in the portal repository.',
    category: 'steam',
    targetAudience: 'all',
    authorName: 'Sabrina Bour',
    authorRole: 'STEAM Manager',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isPinned: true
  },
  {
    id: 'ann-2',
    title: 'Dewey Digital Library Server Optimization',
    content: 'Real-time multi-client synchronization is active across all DIU subdomains. All curriculum resources, annotations, and credentials sync live to Firestore.',
    category: 'academic',
    targetAudience: 'all',
    authorName: 'System Administrator',
    authorRole: 'Administrator',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isPinned: false
  }
];

// Save Announcement to Firestore
export const saveAnnouncementToFirestore = async (announcement: InstitutionalAnnouncement): Promise<void> => {
  try {
    const annRef = doc(db, 'announcements', announcement.id);
    await setDoc(annRef, {
      ...announcement,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not save announcement to Firestore:', e);
  }
};

// Delete Announcement from Firestore
export const deleteAnnouncementFromFirestore = async (annId: string): Promise<void> => {
  try {
    const annRef = doc(db, 'announcements', annId);
    await deleteDoc(annRef);
  } catch (e) {
    console.warn('Could not delete announcement from Firestore:', e);
  }
};

// Subscribe to real-time announcements from Firestore
export const subscribeToAnnouncements = (onUpdate: (announcements: InstitutionalAnnouncement[]) => void) => {
  try {
    const annCol = collection(db, 'announcements');
    return onSnapshot(annCol, (snapshot) => {
      const list: InstitutionalAnnouncement[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as InstitutionalAnnouncement);
      });
      if (list.length > 0) {
        onUpdate(list);
      } else {
        onUpdate(INITIAL_ANNOUNCEMENTS);
      }
    }, (error) => {
      console.warn('Firestore announcements subscription error:', error);
      onUpdate(INITIAL_ANNOUNCEMENTS);
    });
  } catch (e) {
    console.warn('Failed to establish announcements listener:', e);
    return () => {};
  }
};

// ==================== REAL-TIME AUDIT & ACTIVITY LOGS ====================

// Log system activity to Firestore in real time
export const logSystemActivityToFirestore = async (activity: ActivityLogItem): Promise<void> => {
  try {
    const logRef = doc(db, 'activity_logs', activity.id);
    await setDoc(logRef, {
      ...activity,
      serverTime: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not record activity log in Firestore:', e);
  }
};

// Subscribe to real-time activity logs
export const subscribeToActivityLogs = (onUpdate: (logs: ActivityLogItem[]) => void) => {
  try {
    const logsCol = collection(db, 'activity_logs');
    return onSnapshot(logsCol, (snapshot) => {
      const logs: ActivityLogItem[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as ActivityLogItem);
      });
      // Sort newest first
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logs);
    }, (error) => {
      console.warn('Firestore activity_logs subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to establish activity logs listener:', e);
    return () => {};
  }
};

// ==================== REAL-TIME USER PERSONAL DATA CLOUD SYNC ====================

// Save User Personal Data to Firestore
export const saveUserPersonalDataToFirestore = async (
  userId: string,
  data: UserPersonalData
): Promise<void> => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'user_data', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Could not sync user personal data to Firestore:', e);
  }
};

// Subscribe to user personal data in real time
export const subscribeToUserPersonalData = (
  userId: string,
  onUpdate: (data: UserPersonalData) => void
) => {
  if (!userId) return () => {};
  try {
    const userRef = doc(db, 'user_data', userId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserPersonalData;
        onUpdate(data);
      }
    }, (error) => {
      console.warn('Firestore user_data subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to establish user_data listener:', e);
    return () => {};
  }
};

