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
import { UserProfile, Resource, NotificationItem, UserCredentialRecord } from '../types';

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
    notes: 'Head of STEAM Innovation and Curriculum Digitization'
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
    notes: 'Master Administrator with portal and credentials access'
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
  try {
    const credRef = doc(db, 'user_credentials', docId);
    await setDoc(credRef, {
      ...record,
      email: record.email.toLowerCase().trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also update users collection
    const userRef = doc(db, 'users', record.id);
    await setDoc(userRef, {
      id: record.id,
      name: record.name,
      email: record.email.toLowerCase().trim(),
      role: record.role,
      avatarUrl: record.avatarUrl || null,
      initials: record.initials,
      department: record.department || 'Academic Faculty',
      gradeAssigned: record.gradeAssigned || null,
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

// Fetch All Registered User Credentials from Firestore (for Admin Access)
export const fetchAllUserCredentialsFromFirestore = async (): Promise<UserCredentialRecord[]> => {
  try {
    const credsCol = collection(db, 'user_credentials');
    const snapshot = await getDocs(credsCol);
    const list: UserCredentialRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as UserCredentialRecord);
    });

    if (list.length > 0) {
      return list;
    }
  } catch (error) {
    console.warn('Error reading all credentials from Firestore:', error);
  }
  return INITIAL_INSTITUTIONAL_CREDENTIALS;
};

// Subscribe to real-time credentials in Firestore
export const subscribeToAllUserCredentials = (onUpdate: (credentials: UserCredentialRecord[]) => void) => {
  try {
    const credsCol = collection(db, 'user_credentials');
    return onSnapshot(credsCol, (snapshot) => {
      const list: UserCredentialRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserCredentialRecord);
      });
      if (list.length > 0) {
        onUpdate(list);
      } else {
        // If empty, return initial presets
        onUpdate(INITIAL_INSTITUTIONAL_CREDENTIALS);
      }
    }, (error) => {
      console.warn('Firestore user_credentials subscription error:', error);
      onUpdate(INITIAL_INSTITUTIONAL_CREDENTIALS);
    });
  } catch (e) {
    console.warn('Failed to establish Firestore credentials listener:', e);
    return () => {};
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

// Update user password and details in Firestore (Admin function)
export const updateUserPasswordInFirestore = async (
  email: string,
  newPassword: string,
  newRole?: UserProfile['role'],
  newDepartment?: string,
  newGrade?: any
): Promise<void> => {
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
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || 'Dewey Educator',
        email: fbUser.email || '',
        role: data.role || (customRole as any) || 'Educator',
        avatarUrl: fbUser.photoURL || data.avatarUrl,
        initials: data.initials || (data.name || fbUser.displayName || 'DE')
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        department: data.department || 'Academic Faculty & STEAM',
        gradeAssigned: data.gradeAssigned
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
        return {
          id: cred.id || fbUser.uid,
          name: cred.name,
          email: cred.email,
          role: cred.role,
          avatarUrl: cred.avatarUrl,
          initials: cred.initials,
          department: cred.department,
          gradeAssigned: cred.gradeAssigned
        };
      }
    } catch (e) {
      console.warn('Cred fallback check:', e);
    }
  }

  // Default computed profile
  const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Dewey Faculty';
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
    role: (customRole as any) || 'Educator',
    avatarUrl: fbUser.photoURL || undefined,
    initials,
    department: 'Dewey International Faculty'
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

