import { db, doc, getDoc, setDoc, serverTimestamp } from './firebase';
import { UserPersonalData, SharedResourceItem } from '../types';

const STORAGE_PREFIX = 'dewey_user_personal_data_';
const SHARED_STORAGE_KEY = 'dewey_shared_resources_list';

// Default initial data for users
export const getInitialUserData = (): UserPersonalData => ({
  myLibraryResourceIds: ['1', '2', '4'],
  bookmarkedResourceIds: ['1', '3'],
  favoriteResourceIds: ['1', '4'],
  recentlyRead: [
    {
      resourceId: '1',
      date: new Date().toISOString().split('T')[0],
      page: 12,
    },
    {
      resourceId: '3',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      page: 45,
    }
  ],
  sharedWithMe: [],
  notes: {},
});

// Load user-specific data synchronously from localStorage (with background Firestore hydration)
export const loadUserPersonalData = (userId?: string | null): UserPersonalData => {
  const effectiveId = userId || 'guest_user';
  const localKey = `${STORAGE_PREFIX}${effectiveId}`;

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        myLibraryResourceIds: parsed.myLibraryResourceIds || [],
        bookmarkedResourceIds: parsed.bookmarkedResourceIds || [],
        favoriteResourceIds: parsed.favoriteResourceIds || [],
        recentlyRead: parsed.recentlyRead || [],
        sharedWithMe: parsed.sharedWithMe || [],
        notes: parsed.notes || {},
      };
    }
  } catch (e) {
    console.warn('Error reading local user data:', e);
  }

  const initial = getInitialUserData();
  try {
    localStorage.setItem(localKey, JSON.stringify(initial));
  } catch (e) {
    console.warn('Storage note:', e);
  }
  return initial;
};

// Save user personal data synchronously to localStorage and asynchronously to Firestore
export const saveUserPersonalData = (
  userId: string | undefined | null,
  data: UserPersonalData
): void => {
  const effectiveId = userId || 'guest_user';
  const localKey = `${STORAGE_PREFIX}${effectiveId}`;

  try {
    localStorage.setItem(localKey, JSON.stringify(data));
  } catch (e) {
    console.warn('Error writing local user data:', e);
  }

  // Background sync with Firestore if valid user
  if (userId) {
    try {
      const userLibraryRef = doc(db, 'user_libraries', userId);
      setDoc(userLibraryRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(err => {
        console.warn('Firestore background sync notice:', err);
      });
    } catch (err) {
      console.warn('Firestore reference error:', err);
    }
  }
};

// Toggle book in personal library
export const toggleBookInMyLibrary = (
  userId: string | undefined | null,
  resourceId: string
): UserPersonalData => {
  const current = loadUserPersonalData(userId);
  const exists = current.myLibraryResourceIds.includes(resourceId);

  const updated: UserPersonalData = {
    ...current,
    myLibraryResourceIds: exists
      ? current.myLibraryResourceIds.filter(id => id !== resourceId)
      : [...current.myLibraryResourceIds, resourceId],
  };

  saveUserPersonalData(userId, updated);
  return updated;
};

// Toggle bookmark
export const toggleBookmarkInUserData = (
  userId: string | undefined | null,
  resourceId: string
): UserPersonalData => {
  const current = loadUserPersonalData(userId);
  const exists = current.bookmarkedResourceIds.includes(resourceId);

  const updated: UserPersonalData = {
    ...current,
    bookmarkedResourceIds: exists
      ? current.bookmarkedResourceIds.filter(id => id !== resourceId)
      : [...current.bookmarkedResourceIds, resourceId],
  };

  saveUserPersonalData(userId, updated);
  return updated;
};

// Toggle favorite
export const toggleFavoriteInUserData = (
  userId: string | undefined | null,
  resourceId: string
): UserPersonalData => {
  const current = loadUserPersonalData(userId);
  const exists = current.favoriteResourceIds.includes(resourceId);

  const updated: UserPersonalData = {
    ...current,
    favoriteResourceIds: exists
      ? current.favoriteResourceIds.filter(id => id !== resourceId)
      : [...current.favoriteResourceIds, resourceId],
  };

  saveUserPersonalData(userId, updated);
  return updated;
};

// Record book opened
export const recordBookOpenedInUserData = (
  userId: string | undefined | null,
  resourceId: string,
  page: number = 1
): UserPersonalData => {
  const current = loadUserPersonalData(userId);
  const filtered = current.recentlyRead.filter(r => r.resourceId !== resourceId);

  const updated: UserPersonalData = {
    ...current,
    recentlyRead: [
      {
        resourceId,
        date: new Date().toISOString().split('T')[0],
        page,
      },
      ...filtered,
    ],
  };

  saveUserPersonalData(userId, updated);
  return updated;
};

// Share a resource with peers / grade / school
export const shareResourceWithAudience = (
  userId: string | undefined | null,
  resourceId: string,
  authorName: string,
  authorRole: string | undefined,
  targetType: 'school' | 'grade' | 'email',
  targetValue: string,
  note?: string
): SharedResourceItem => {
  const newItem: SharedResourceItem = {
    id: `share-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    resourceId,
    sharedByUserId: userId || undefined,
    sharedByName: authorName,
    sharedByRole: authorRole || 'Faculty Member',
    sharedAt: new Date().toISOString(),
    targetType,
    targetValue,
    note: note || 'Shared for curriculum collaboration.',
  };

  try {
    const raw = localStorage.getItem(SHARED_STORAGE_KEY);
    const list: SharedResourceItem[] = raw ? JSON.parse(raw) : [];
    const updated = [newItem, ...list];
    localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local share list save error:', e);
  }

  // Also sync to user's personal shared items
  const current = loadUserPersonalData(userId);
  const updatedUserData: UserPersonalData = {
    ...current,
    sharedWithMe: [newItem, ...current.sharedWithMe],
  };
  saveUserPersonalData(userId, updatedUserData);

  // Background sync to Firestore
  try {
    const shareRef = doc(db, 'shared_resources', newItem.id);
    setDoc(shareRef, {
      ...newItem,
      timestamp: serverTimestamp(),
    }, { merge: true }).catch(e => console.warn('Firestore share notice:', e));
  } catch (e) {
    console.warn('Firestore share err:', e);
  }

  return newItem;
};

// Load global shared list
export const loadSharedResources = (): SharedResourceItem[] => {
  try {
    const raw = localStorage.getItem(SHARED_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading shared resources:', e);
  }
  return [];
};

