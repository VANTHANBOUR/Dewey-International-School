import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { WelcomeHeader } from './components/WelcomeHeader';
import { GradeSelector } from './components/GradeSelector';
import { FeaturedResources } from './components/FeaturedResources';
import { RecentlyViewed } from './components/RecentlyViewed';
import { ResourceCategories } from './components/ResourceCategories';
import { FlipbookReaderModal } from './components/FlipbookReaderModal';
import { UploadResourceModal } from './components/UploadResourceModal';
import { ShareResourceModal } from './components/ShareResourceModal';
import { CreateLessonPlanModal } from './components/CreateLessonPlanModal';
import { CreateWorksheetModal } from './components/CreateWorksheetModal';
import { CreateQuizModal } from './components/CreateQuizModal';
import { AuthModal, PRESET_ACCOUNTS } from './components/AuthModal';

import { GradesView } from './components/views/GradesView';
import { LibraryView } from './components/views/LibraryView';
import { BookmarksView } from './components/views/BookmarksView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SharedWithMeView } from './components/views/SharedWithMeView';
import { SettingsView } from './components/views/SettingsView';
import { HelpSupportView } from './components/views/HelpSupportView';
import { WorksheetsView } from './components/views/WorksheetsView';
import { AdminConsoleView } from './components/views/AdminConsoleView';

import { INITIAL_RESOURCES, INITIAL_NOTIFICATIONS } from './data/mockData';
import { Resource, GradeLevel, ActiveNavTab, SubjectCategory, NotificationItem, UserProfile, UserPersonalData, LessonPlanItem, isAuthorizedToDeleteResource } from './types';
import { 
  auth, 
  onAuthStateChanged 
} from './lib/firebase';
import { 
  mapFirebaseUserToProfile, 
  saveResourceToFirestore, 
  deleteResourceFromFirestore,
  deleteMultipleResourcesFromFirestore,
  deleteAllUploadedResourcesFromFirestore,
  markResourceAsDeletedInFirestore,
  subscribeToCustomResources,
  subscribeToDeletedResourceIds,
  saveLessonPlanToFirestore,
  deleteLessonPlanFromFirestore,
  subscribeToLessonPlans,
  saveSharedResourceToFirestore,
  subscribeToSharedResources,
  subscribeToAnnouncements,
  logSystemActivityToFirestore,
  saveUserPersonalDataToFirestore,
  subscribeToUserPersonalData,
  logoutFirebase 
} from './lib/firebaseServices';
import {
  loadUserPersonalData,
  saveUserPersonalData,
  toggleBookInMyLibrary,
  toggleBookmarkInUserData,
  toggleFavoriteInUserData,
  recordBookOpenedInUserData,
  shareResourceWithAudience,
} from './lib/userLibraryService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [formatFilter, setFormatFilter] = useState<'all' | 'flipbook' | 'pdf' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Authentication state - Pops up by default on start as requested
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Deleted Resource IDs synced live from Firestore
  const [deletedResourceIds, setDeletedResourceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dewey_deleted_resource_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read deleted resource ids cache', e);
    }
    return [];
  });

  // User-isolated Personal Data (my bookshelf, bookmarks, favorites, shared items)
  const [userPersonalData, setUserPersonalData] = useState<UserPersonalData>(() =>
    loadUserPersonalData(null)
  );

  // Master Resources state with localStorage & Firestore real-time synchronization
  const [rawResources, setRawResources] = useState<Resource[]>(() => {
    try {
      const saved = localStorage.getItem('dewey_custom_uploaded_resources');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_RESOURCES];
        }
      }
    } catch (e) {
      console.error('Failed to load cached resources', e);
    }
    return INITIAL_RESOURCES;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  // Modal states
  const [activeReaderResource, setActiveReaderResource] = useState<Resource | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateLessonPlanOpen, setIsCreateLessonPlanOpen] = useState(false);
  const [isCreateWorksheetOpen, setIsCreateWorksheetOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [shareTargetResource, setShareTargetResource] = useState<Resource | null>(null);

  // Custom Created Lesson Plans (Yearly, Quarter, Monthly, Weekly, Daily) synced live with Firestore
  const [customLessonPlans, setCustomLessonPlans] = useState<LessonPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('dewey_custom_lesson_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load custom lesson plans', e);
    }
    return [];
  });

  // When currentUser changes, reload their isolated personal data and set up live user personal data listener
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const personalData = loadUserPersonalData(currentUser.id);
      setUserPersonalData(personalData);

      // Subscribe to cloud user personal data for real-time cross-device sync
      const unsubscribeUserData = subscribeToUserPersonalData(currentUser.id, (cloudData) => {
        if (cloudData) {
          setUserPersonalData(prev => ({
            ...prev,
            ...cloudData
          }));
          saveUserPersonalData(currentUser.id, cloudData);
        }
      });
      return () => {
        unsubscribeUserData();
      };
    } else {
      setUserPersonalData(loadUserPersonalData(null));
    }
  }, [currentUser]);

  // Synchronize Firebase Auth state & all Firestore Real-Time collections
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await mapFirebaseUserToProfile(fbUser);
        if (profile) {
          setCurrentUser(profile);
          try {
            localStorage.setItem('dewey_auth_user', JSON.stringify(profile));
          } catch (e) {
            console.warn('Storage sync note:', e);
          }
        }
      }
    });

    // 1. Real-time Firestore resources listener
    const unsubscribeResources = subscribeToCustomResources((cloudResources) => {
      if (cloudResources && cloudResources.length > 0) {
        setRawResources(prev => {
          const combined = [...cloudResources.filter(r => !!r && !!r.id)];
          INITIAL_RESOURCES.forEach(initRes => {
            if (initRes && initRes.id && !combined.some(r => r && r.id === initRes.id)) {
              combined.push(initRes);
            }
          });
          return combined;
        });
      }
    });

    // 2. Real-time Firestore deleted resources listener
    const unsubscribeDeleted = subscribeToDeletedResourceIds((deletedIds) => {
      if (deletedIds && deletedIds.length > 0) {
        setDeletedResourceIds(deletedIds);
        try {
          localStorage.setItem('dewey_deleted_resource_ids', JSON.stringify(deletedIds));
        } catch (e) {
          console.warn('Storage note:', e);
        }
      }
    });

    // 3. Real-time Firestore lesson plans listener
    const unsubscribeLessonPlans = subscribeToLessonPlans((plans) => {
      if (plans && plans.length > 0) {
        setCustomLessonPlans(prev => {
          const merged = [...plans.filter(p => !!p && !!p.id)];
          prev.forEach(localPlan => {
            if (localPlan && localPlan.id && !merged.some(p => p && p.id === localPlan.id)) {
              merged.push(localPlan);
            }
          });
          try {
            localStorage.setItem('dewey_custom_lesson_plans', JSON.stringify(merged));
          } catch (e) {
            console.warn('Lesson plan sync storage note:', e);
          }
          return merged;
        });
      }
    });

    // 4. Real-time Firestore shared resources listener
    const unsubscribeShared = subscribeToSharedResources((sharedList) => {
      if (sharedList && sharedList.length > 0) {
        setUserPersonalData(prev => ({
          ...prev,
          sharedWithMe: sharedList
        }));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeResources();
      unsubscribeDeleted();
      unsubscribeLessonPlans();
      unsubscribeShared();
    };
  }, []);

  // Compute User-Isolated Resources
  // 1. Filter out deleted resources in real time
  // 2. Filter out personal-only resources belonging to other users
  // 3. Map user's personal bookmarks, library status, favorites, and read dates
  const resources = useMemo(() => {
    const baseList = (rawResources || [])
      .filter((res): res is Resource => {
        if (!res || !res.id) return false;

        // Exclude any resource marked as deleted in Firestore
        if (deletedResourceIds && deletedResourceIds.includes(res.id)) {
          return false;
        }

        // If a resource is marked personal-only, only its author can see it
        if (res.isPersonalOnly && res.uploadedByUserId) {
          if (!currentUser || res.uploadedByUserId !== currentUser.id) {
            return false;
          }
        }
        return true;
      });

    // Automatically generate companion interactive Flipbooks for all PDF books to satisfy institutional standards
    const listWithFlipbooks: Resource[] = [];
    baseList.forEach((res) => {
      listWithFlipbooks.push(res);
      if (res.format === 'pdf') {
        const flipbookId = `${res.id}-flipbook`;
        const alreadyHasFlipbook = baseList.some(r => r.id === flipbookId);
        if (!alreadyHasFlipbook) {
          listWithFlipbooks.push({
            ...res,
            id: flipbookId,
            title: `${res.title} (Flipbook)`,
            format: 'flipbook',
            fileType: 'application/epub+zip', // Flipbook standard ePUB container format type
            coverTheme: {
              bg: res.coverTheme?.bg || 'from-blue-900 via-indigo-900 to-slate-950',
              text: 'text-white',
              accent: '#3b82f6',
              badgeBg: 'bg-blue-600',
              badgeText: 'text-white'
            }
          });
        }
      }
    });

    return listWithFlipbooks.map((res) => {
      const myLibIds = userPersonalData?.myLibraryResourceIds || [];
      const bmIds = userPersonalData?.bookmarkedResourceIds || [];
      const favIds = userPersonalData?.favoriteResourceIds || [];
      const recentReadList = userPersonalData?.recentlyRead || [];

      const lookupId = res.id;
      const isMyLib =
        myLibIds.includes(lookupId) ||
        (!!currentUser?.id && res.uploadedByUserId === currentUser.id);
      const isBm = bmIds.includes(lookupId);
      const isFav = favIds.includes(lookupId);
      const userRead = recentReadList.find(r => r && r.resourceId === lookupId);

      return {
        ...res,
        isMyLibrary: isMyLib,
        isBookmarked: isBm,
        isFavorite: isFav,
        lastReadDate: userRead ? userRead.date : res.lastReadDate,
        lastReadTimeAgo: userRead ? 'Recently' : res.lastReadTimeAgo,
      };
    });
  }, [rawResources, deletedResourceIds, userPersonalData, currentUser]);

  // Auth Handlers
  const handleOpenAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile, targetTab?: ActiveNavTab) => {
    if (!user) return;
    setCurrentUser(user);
    const personalData = loadUserPersonalData(user.id);
    setUserPersonalData(personalData);

    // If a targetTab is specified or currently on admin/settings, keep it; otherwise navigate to dashboard
    if (targetTab) {
      setActiveTab(targetTab);
    } else if (activeTab !== 'admin' && activeTab !== 'settings') {
      setActiveTab('dashboard');
    }
    setIsAuthModalOpen(false); // Close auth modal
    setActiveReaderResource(null); // Close any open book reader
    setIsUploadModalOpen(false); // Close upload modal
    setShareTargetResource(null); // Close share modal
    setSearchQuery(''); // Reset search so home shows full curriculum
    setFormatFilter('all');

    // If user has a specific grade assigned, focus on their grade
    if (user.gradeAssigned) {
      setSelectedGrade(user.gradeAssigned);
    } else {
      setSelectedGrade(null);
    }

    try {
      localStorage.setItem('dewey_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist auth user', e);
    }

    // Add notification
    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Portal Access Granted',
      message: `Welcome to Dewey International Portal, ${user.name}! You are now on your Home dashboard.`,
      time: 'Just now',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
  };

  const handleSignOut = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Firebase logout note:', e);
    }

    setCurrentUser(null);
    setUserPersonalData(loadUserPersonalData(null));

    try {
      localStorage.removeItem('dewey_auth_user');
    } catch (e) {
      console.error('Failed to clear auth user', e);
    }

    const logoutNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Signed Out',
      message: 'You have signed out of your institutional profile. Sign in anytime to sync your curriculum.',
      time: 'Just now',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [logoutNotif, ...prev]);

    // Immediately trigger the Sign In pop-up on sign out
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  // Real-time optimistic user profile update handler across all views
  const handleUserUpdated = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('dewey_auth_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Storage sync notice:', e);
    }
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Profile Updated',
      message: `User details for "${updatedUser.name}" were updated instantly across Dewey portal.`,
      time: 'Just now',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Save custom lesson plan handler (Yearly, Quarter, Monthly, Weekly, Daily) with real-time Firestore sync
  const handleSaveCustomLessonPlan = async (plan: LessonPlanItem) => {
    // 1. Save to Firestore for live real-time sync across all domain clients
    await saveLessonPlanToFirestore(plan);

    // 2. Log system audit activity
    if (currentUser) {
      await logSystemActivityToFirestore({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        action: 'create_lesson_plan',
        title: 'Lesson Plan Created',
        description: `Created "${plan.title}" (${(plan.scope || 'Plan').toUpperCase()}) for Grade ${plan.grade}.`,
        userName: currentUser.name,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        resourceId: plan.id
      });
    }

    setCustomLessonPlans(prev => {
      const updated = [plan, ...prev.filter(p => p.id !== plan.id)];
      try {
        localStorage.setItem('dewey_custom_lesson_plans', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save lesson plan to storage', e);
      }
      return updated;
    });

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Lesson Plan Created',
      message: `"${plan.title}" (${(plan.scope || 'Plan').toUpperCase()}) has been synced in real time across the domain.`,
      time: 'Just now',
      isRead: false,
      type: 'curriculum'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Delete Lesson Plan handler with real-time Firestore sync
  const handleDeleteLessonPlan = async (planId: string) => {
    await deleteLessonPlanFromFirestore(planId);
    setCustomLessonPlans(prev => {
      const updated = prev.filter(p => p.id !== planId);
      try {
        localStorage.setItem('dewey_custom_lesson_plans', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return updated;
    });

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Lesson Plan Removed',
      message: 'Lesson plan was deleted and removed in real time from the curriculum center.',
      time: 'Just now',
      isRead: false,
      type: 'alert'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Delete Resource handler with authorized Administrator / STEAM Manager real-time domain sync
  const handleDeleteResource = async (resource: Resource) => {
    // Identify companions to delete both PDF and converted Flipbook
    const companionId = resource.id.endsWith('-flipbook') 
      ? resource.id.replace('-flipbook', '')
      : `${resource.id}-flipbook`;

    const targetIds = [resource.id, companionId];

    for (const id of targetIds) {
      // 1. Delete document from Firestore
      await deleteResourceFromFirestore(id);
      // 2. Register deletion in deleted_resources so all active sessions across the domain remove it instantly
      await markResourceAsDeletedInFirestore(id);
    }

    // 3. Log real-time audit activity
    if (currentUser) {
      await logSystemActivityToFirestore({
        id: `act-${Date.now()}-delete-dual`,
        action: 'delete',
        title: 'Resources Deleted',
        description: `Permanently removed "${resource.title}" and its companion format copy (Grade ${resource.grade} • ${resource.subject}).`,
        userName: currentUser.name,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        resourceId: resource.id
      });
    }

    // 4. Update local deleted IDs cache and rawResources
    setDeletedResourceIds(prev => {
      const next = Array.from(new Set([...prev, ...targetIds]));
      try {
        localStorage.setItem('dewey_deleted_resource_ids', JSON.stringify(next));
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return next;
    });

    setRawResources(prev => {
      const updated = prev.filter(r => !targetIds.includes(r.id));
      try {
        const customItems = updated.filter(r => r.id.startsWith('res-custom-'));
        localStorage.setItem('dewey_custom_uploaded_resources', JSON.stringify(customItems));
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return updated;
    });

    // Close reader if deleting active book or companion
    if (activeReaderResource && targetIds.includes(activeReaderResource.id)) {
      setActiveReaderResource(null);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Resources Deleted in Real Time',
      message: `"${resource.title}" and its companion format copy were removed across the entire domain and Firestore repository.`,
      time: 'Just now',
      isRead: false,
      type: 'alert'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Batch delete multiple resources (Authorized for Admin & STEAM Manager)
  const handleDeleteMultipleResources = async (resourceIds: string[]) => {
    if (!currentUser || !isAuthorizedToDeleteResource(currentUser) || resourceIds.length === 0) return;

    // 1. Delete from Firestore & mark deleted
    await deleteMultipleResourcesFromFirestore(resourceIds);

    // 2. Audit log
    await logSystemActivityToFirestore({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: 'delete',
      title: `Batch Deleted ${resourceIds.length} Resources`,
      description: `Administrator ${currentUser.name} removed ${resourceIds.length} resources from the domain repository.`,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      timestamp: new Date().toISOString(),
      details: { resourceIds }
    });

    // 3. Update local caches
    setDeletedResourceIds(prev => {
      const next = Array.from(new Set([...prev, ...resourceIds]));
      try {
        localStorage.setItem('dewey_deleted_resource_ids', JSON.stringify(next));
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return next;
    });

    setRawResources(prev => {
      const updated = prev.filter(r => !resourceIds.includes(r.id));
      try {
        const customItems = updated.filter(r => r.id.startsWith('res-custom-'));
        localStorage.setItem('dewey_custom_uploaded_resources', JSON.stringify(customItems));
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return updated;
    });

    // Close reader if deleting active book
    if (activeReaderResource && resourceIds.includes(activeReaderResource.id)) {
      setActiveReaderResource(null);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Batch Resources Deleted',
      message: `${resourceIds.length} resources were permanently deleted by Administrator.`,
      time: 'Just now',
      isRead: false,
      type: 'alert'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Delete ALL uploaded resources across the domain (Authorized for Admin)
  const handleDeleteAllUploadedResources = async () => {
    if (!currentUser || !isAuthorizedToDeleteResource(currentUser)) return;

    const uploadedList = resources.filter(r => 
      r.id.startsWith('res-custom-') || 
      r.isCustomUpload === true || 
      !!r.uploadedByUserId || 
      r.source === 'uploaded' ||
      r.category === 'custom'
    );
    const uploadedIds = uploadedList.map(r => r.id);

    if (uploadedIds.length === 0) return;

    // 1. Delete all from Firestore
    await deleteAllUploadedResourcesFromFirestore(uploadedIds);

    // 2. Audit log
    await logSystemActivityToFirestore({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: 'delete',
      title: `Purged All (${uploadedIds.length}) Uploaded Resources`,
      description: `Administrator ${currentUser.name} permanently deleted all uploaded curriculum materials from the institution's repository.`,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      timestamp: new Date().toISOString(),
      details: { count: uploadedIds.length }
    });

    // 3. Update local caches
    setDeletedResourceIds(prev => {
      const next = Array.from(new Set([...prev, ...uploadedIds]));
      try {
        localStorage.setItem('dewey_deleted_resource_ids', JSON.stringify(next));
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return next;
    });

    setRawResources(prev => {
      const updated = prev.filter(r => !uploadedIds.includes(r.id));
      try {
        localStorage.removeItem('dewey_custom_uploaded_resources');
      } catch (e) {
        console.warn('Storage note:', e);
      }
      return updated;
    });

    // Close reader if deleting active book
    if (activeReaderResource && uploadedIds.includes(activeReaderResource.id)) {
      setActiveReaderResource(null);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'All Uploaded Resources Purged',
      message: `All ${uploadedIds.length} uploaded curriculum materials were deleted from Firebase Firestore.`,
      time: 'Just now',
      isRead: false,
      type: 'alert'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Filtered resources for Dashboard Featured section
  const featuredResources = useMemo(() => {
    return resources.filter((res) => {
      // Grade filter
      if (selectedGrade && res.grade !== selectedGrade) return false;
      // Format filter
      if (formatFilter === 'pdf') {
        if (res.format !== 'pdf' || res.category === 'Quiz') return false;
      } else if (formatFilter === 'flipbook') {
        if (res.format !== 'flipbook') return false;
      } else if (formatFilter === 'other') {
        if (res.format !== 'pdf' && res.format !== 'flipbook') {
          return true;
        }
        if (res.category === 'Quiz' || res.category === 'Worksheet' || res.id.includes('quiz') || !!res.worksheet) {
          return true;
        }
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          res.title.toLowerCase().includes(q) ||
          res.subtitle.toLowerCase().includes(q) ||
          res.subject.toLowerCase().includes(q) ||
          res.grade.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [resources, selectedGrade, formatFilter, searchQuery]);

  // Filtered recently viewed items
  const recentResources = useMemo(() => {
    return resources.filter((r) => r.lastReadDate !== undefined);
  }, [resources]);

  // Counts
  const totalCount = resources.length * 104 + 248; // Scaled to realistic school library numbers (1,248)
  const flipbookCount = resources.filter(r => r.format === 'flipbook').length * 41 + 128; // ~328
  const otherCount = resources.filter(r => (r.format !== 'pdf' && r.format !== 'flipbook') || r.category === 'Quiz' || r.id.includes('quiz') || !!r.worksheet).length * 12 + 35;
  const pdfCount = resources.filter(r => r.format === 'pdf' && r.category !== 'Quiz' && !r.id.includes('quiz') && !r.worksheet).length * 115 + 420; // ~920
  const bookmarkCount = resources.filter(r => r.isBookmarked).length;
  const favoriteCount = resources.filter(r => r.isFavorite).length;
  const myLibraryCount = resources.filter(r => r.isMyLibrary).length;

  // Handlers for User-Isolated Operations
  const handleToggleMyLibrary = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated = toggleBookInMyLibrary(currentUser?.id, id);

    // Keep both PDF and Flipbook companion copies synchronized in My Library
    if (id.endsWith('-flipbook')) {
      const originalId = id.replace('-flipbook', '');
      const originalIsPresent = updated.myLibraryResourceIds.includes(originalId);
      const flipbookIsPresent = updated.myLibraryResourceIds.includes(id);
      if (originalIsPresent !== flipbookIsPresent) {
        updated = toggleBookInMyLibrary(currentUser?.id, originalId);
      }
    } else {
      const flipbookId = `${id}-flipbook`;
      const hasFlipbook = resources.some(r => r.id === flipbookId);
      if (hasFlipbook) {
        const originalIsPresent = updated.myLibraryResourceIds.includes(id);
        const flipbookIsPresent = updated.myLibraryResourceIds.includes(flipbookId);
        if (originalIsPresent !== flipbookIsPresent) {
          updated = toggleBookInMyLibrary(currentUser?.id, flipbookId);
        }
      }
    }

    setUserPersonalData(updated);

    if (currentUser) {
      saveUserPersonalDataToFirestore(currentUser.id, updated);
    }

    const book = resources.find(r => r.id === id);
    const isNowInLibrary = updated.myLibraryResourceIds.includes(id);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isNowInLibrary ? 'Added to My Bookshelf' : 'Removed from My Bookshelf',
      message: `"${book?.title || 'Book'}" and its companion format are ${isNowInLibrary ? 'now saved in your personal library' : 'removed from your personal library'}.`,
      time: 'Just now',
      isRead: false,
      type: 'curriculum',
      linkResourceId: id,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated = toggleBookmarkInUserData(currentUser?.id, id);

    // Keep both PDF and Flipbook companion copies synchronized for Bookmarks
    if (id.endsWith('-flipbook')) {
      const originalId = id.replace('-flipbook', '');
      const originalIsPresent = updated.bookmarkedResourceIds.includes(originalId);
      const flipbookIsPresent = updated.bookmarkedResourceIds.includes(id);
      if (originalIsPresent !== flipbookIsPresent) {
        updated = toggleBookmarkInUserData(currentUser?.id, originalId);
      }
    } else {
      const flipbookId = `${id}-flipbook`;
      const hasFlipbook = resources.some(r => r.id === flipbookId);
      if (hasFlipbook) {
        const originalIsPresent = updated.bookmarkedResourceIds.includes(id);
        const flipbookIsPresent = updated.bookmarkedResourceIds.includes(flipbookId);
        if (originalIsPresent !== flipbookIsPresent) {
          updated = toggleBookmarkInUserData(currentUser?.id, flipbookId);
        }
      }
    }

    setUserPersonalData(updated);

    if (currentUser) {
      saveUserPersonalDataToFirestore(currentUser.id, updated);
    }
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated = toggleFavoriteInUserData(currentUser?.id, id);

    // Keep both PDF and Flipbook companion copies synchronized for Favorites
    if (id.endsWith('-flipbook')) {
      const originalId = id.replace('-flipbook', '');
      const originalIsPresent = updated.favoriteResourceIds.includes(originalId);
      const flipbookIsPresent = updated.favoriteResourceIds.includes(id);
      if (originalIsPresent !== flipbookIsPresent) {
        updated = toggleFavoriteInUserData(currentUser?.id, originalId);
      }
    } else {
      const flipbookId = `${id}-flipbook`;
      const hasFlipbook = resources.some(r => r.id === flipbookId);
      if (hasFlipbook) {
        const originalIsPresent = updated.favoriteResourceIds.includes(id);
        const flipbookIsPresent = updated.favoriteResourceIds.includes(flipbookId);
        if (originalIsPresent !== flipbookIsPresent) {
          updated = toggleFavoriteInUserData(currentUser?.id, flipbookId);
        }
      }
    }

    setUserPersonalData(updated);

    if (currentUser) {
      saveUserPersonalDataToFirestore(currentUser.id, updated);
    }
  };

  const handleOpenResource = (resource: Resource) => {
    // Record in user personal data
    const updated = recordBookOpenedInUserData(currentUser?.id, resource.id);
    setUserPersonalData(updated);

    if (currentUser) {
      saveUserPersonalDataToFirestore(currentUser.id, updated);
    }

    setActiveReaderResource(resource);
  };

  const handleAddResource = async (newRes: Resource, openImmediately?: boolean) => {
    // If the uploaded resource format is 'pdf', we also convert it to a Flipbook copy and keep both
    if (newRes.format === 'pdf') {
      const flipbookRes: Resource = {
        ...newRes,
        id: `${newRes.id}-flipbook`,
        title: `${newRes.title} (Flipbook)`,
        format: 'flipbook',
        fileType: 'application/epub+zip', // Flipbook format
        coverTheme: {
          bg: 'from-blue-900 via-indigo-900 to-slate-950',
          text: 'text-white',
          accent: '#3b82f6',
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white'
        }
      };

      // Save both to Firestore for persistent multi-device syncing in real time
      await saveResourceToFirestore(newRes);
      await saveResourceToFirestore(flipbookRes);

      // Save both to user's personal bookshelf automatically
      let updatedUser = toggleBookInMyLibrary(currentUser?.id, newRes.id);
      if (!updatedUser.myLibraryResourceIds.includes(flipbookRes.id)) {
        updatedUser = toggleBookInMyLibrary(currentUser?.id, flipbookRes.id);
      }
      setUserPersonalData(updatedUser);
      if (currentUser) {
        saveUserPersonalDataToFirestore(currentUser.id, updatedUser);
      }

      // Log both activities
      if (currentUser) {
        await logSystemActivityToFirestore({
          id: `act-${Date.now()}-pdf`,
          action: 'upload',
          title: 'Resource Uploaded (PDF)',
          description: `Published PDF "${newRes.title}" for Grade ${newRes.grade}.`,
          userName: currentUser.name,
          userRole: currentUser.role,
          userEmail: currentUser.email,
          timestamp: new Date().toISOString(),
          resourceId: newRes.id
        });

        await logSystemActivityToFirestore({
          id: `act-${Date.now()}-flipbook`,
          action: 'upload',
          title: 'Resource Auto-Converted to Flipbook',
          description: `Automatically converted PDF "${newRes.title}" to standard 3D Flipbook copy.`,
          userName: currentUser.name,
          userRole: currentUser.role,
          userEmail: currentUser.email,
          timestamp: new Date().toISOString(),
          resourceId: flipbookRes.id
        });
      }

      setRawResources(prev => {
        const updated = [newRes, flipbookRes, ...prev.filter(r => r.id !== newRes.id && r.id !== flipbookRes.id)];
        try {
          const customItems = updated.filter(r => r.id.startsWith('res-custom-'));
          localStorage.setItem('dewey_custom_uploaded_resources', JSON.stringify(customItems));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
        return updated;
      });

      // Auto-select uploaded resource grade so it immediately appears in the featured carousel on Dashboard
      setSelectedGrade(newRes.grade);

      // Create dual format system notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'PDF & Converted Flipbook Published',
        message: `"${newRes.title}" has been successfully published as both a PDF and a Flipbook copy.`,
        time: 'Just now',
        isRead: false,
        type: 'curriculum',
        linkResourceId: flipbookRes.id
      };
      setNotifications(prev => [newNotif, ...prev]);

      // Open immediately if requested (default to interactive Flipbook copy)
      if (openImmediately) {
        handleOpenResource(flipbookRes);
      }
    } else {
      // Save to Firestore for persistent multi-device syncing in real time
      await saveResourceToFirestore(newRes);

      // Save to user's personal bookshelf automatically
      const updatedUser = toggleBookInMyLibrary(currentUser?.id, newRes.id);
      setUserPersonalData(updatedUser);
      if (currentUser) {
        saveUserPersonalDataToFirestore(currentUser.id, updatedUser);
      }

      // Log activity
      if (currentUser) {
        await logSystemActivityToFirestore({
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          action: 'upload',
          title: 'Resource Uploaded',
          description: `Published new ${newRes.format.toUpperCase()} "${newRes.title}" for Grade ${newRes.grade}.`,
          userName: currentUser.name,
          userRole: currentUser.role,
          userEmail: currentUser.email,
          timestamp: new Date().toISOString(),
          resourceId: newRes.id
        });
      }

      setRawResources(prev => {
        const updated = [newRes, ...prev.filter(r => r.id !== newRes.id)];
        try {
          const customItems = updated.filter(r => r.id.startsWith('res-custom-'));
          localStorage.setItem('dewey_custom_uploaded_resources', JSON.stringify(customItems));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
        return updated;
      });

      // Auto-select uploaded resource grade so it immediately appears in the featured carousel on Dashboard
      setSelectedGrade(newRes.grade);

      // Create system notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Curriculum Resource Published',
        message: `"${newRes.title}" is saved to your personal library and synced in real time across the domain.`,
        time: 'Just now',
        isRead: false,
        type: 'curriculum',
        linkResourceId: newRes.id
      };
      setNotifications(prev => [newNotif, ...prev]);

      // Open immediately if requested
      if (openImmediately) {
        handleOpenResource(newRes);
      }
    }
  };

  const handleOpenShareModal = (resource: Resource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShareTargetResource(resource);
  };

  const handleConfirmShare = async (
    resourceId: string,
    targetType: 'school' | 'grade' | 'email',
    targetValue: string,
    note: string
  ) => {
    const book = resources.find(r => r.id === resourceId);
    const sharedItem = shareResourceWithAudience(
      currentUser?.id,
      resourceId,
      currentUser?.name || 'Educator',
      currentUser?.role,
      targetType,
      targetValue,
      note
    );

    // Sync to Firestore in real time
    await saveSharedResourceToFirestore(sharedItem);

    if (currentUser) {
      await logSystemActivityToFirestore({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        action: 'share',
        title: 'Resource Shared',
        description: `Shared "${book?.title || 'Resource'}" with ${targetType === 'school' ? 'All School Faculty' : targetValue}.`,
        userName: currentUser.name,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        resourceId
      });
    }

    // Add notification
    const shareNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Resource Shared Dynamically',
      message: `"${book?.title || 'Resource'}" has been shared in real time across the domain with ${
        targetType === 'school'
          ? 'all school faculty'
          : targetType === 'grade'
          ? `Grade ${targetValue} teachers`
          : targetValue
      }.`,
      time: 'Just now',
      isRead: false,
      type: 'system',
      linkResourceId: resourceId
    };
    setNotifications(prev => [shareNotif, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSelectCategory = (cat: SubjectCategory) => {
    setActiveTab('library');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-[#1e293b] flex flex-col lg:flex-row antialiased font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        bookmarkCount={bookmarkCount}
        favoriteCount={favoriteCount}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Search & Profile Header */}
        <TopHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resources={resources}
          onOpenResource={handleOpenResource}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onSignOut={handleSignOut}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />

        {/* Dynamic Content View Router */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-10 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
              {/* Welcome Header & 3 Stats Cards */}
              <WelcomeHeader
                totalCount={totalCount}
                flipbookCount={flipbookCount}
                pdfCount={pdfCount}
                otherCount={otherCount}
                myLibraryCount={myLibraryCount}
                activeFormat={formatFilter}
                onFilterFormat={setFormatFilter}
                currentUser={currentUser}
                onOpenAuthModal={handleOpenAuthModal}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenCreateLessonPlanModal={() => setIsCreateLessonPlanOpen(true)}
                onOpenCreateWorksheetModal={() => setIsCreateWorksheetOpen(true)}
                onOpenCreateQuizModal={() => setIsCreateQuizOpen(true)}
                onViewMyLibrary={() => setActiveTab('library')}
              />

              {/* Grade Selector Row (Found, Prep through 12) */}
              <GradeSelector
                selectedGrade={selectedGrade}
                onSelectGrade={setSelectedGrade}
              />

              {/* Featured Resources Carousel (Top Section) */}
              <FeaturedResources
                resources={featuredResources}
                onOpenResource={handleOpenResource}
                onToggleBookmark={handleToggleBookmark}
                onToggleMyLibrary={handleToggleMyLibrary}
                onOpenShareModal={handleOpenShareModal}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenCreateLessonPlanModal={() => setIsCreateLessonPlanOpen(true)}
                onOpenCreateWorksheetModal={() => setIsCreateWorksheetOpen(true)}
                onViewAll={() => setActiveTab('library')}
                currentUser={currentUser}
                onDeleteResource={handleDeleteResource}
              />

              {/* Bottom Two Columns: Recently Viewed (Left) + Resource Categories (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 pt-2">
                {/* Recently Viewed (approx 4.5 cols on desktop) */}
                <div className="lg:col-span-5 flex flex-col">
                  <RecentlyViewed
                    recentResources={recentResources.slice(0, 3)}
                    onOpenResource={handleOpenResource}
                    onViewAll={() => setActiveTab('recent')}
                  />
                </div>

                {/* Resource Categories (approx 7.5 cols on desktop) */}
                <div className="lg:col-span-7 flex flex-col">
                  <ResourceCategories
                    onSelectCategory={handleSelectCategory}
                    onViewAll={() => setActiveTab('library')}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <GradesView
              resources={resources}
              onOpenResource={handleOpenResource}
              onSelectGradeFilter={(g) => {
                setSelectedGrade(g);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              resources={resources}
              onOpenResource={handleOpenResource}
              onToggleBookmark={handleToggleBookmark}
              onToggleMyLibrary={handleToggleMyLibrary}
              onOpenShareModal={handleOpenShareModal}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              currentUser={currentUser}
              onDeleteResource={handleDeleteResource}
            />
          )}

          {activeTab === 'worksheets' && (
            <WorksheetsView
              resources={resources}
              customLessonPlans={customLessonPlans}
              onOpenResource={handleOpenResource}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenCreateLessonPlanModal={() => setIsCreateLessonPlanOpen(true)}
              onOpenCreateWorksheetModal={() => setIsCreateWorksheetOpen(true)}
              onOpenCreateQuizModal={() => setIsCreateQuizOpen(true)}
              currentUser={currentUser}
              onDeleteLessonPlan={handleDeleteLessonPlan}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksView
              resources={resources}
              onOpenResource={handleOpenResource}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {activeTab === 'recent' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <h1 className="text-2xl font-extrabold text-slate-900">Recent Reading History</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Pick up right where you left off across all your curriculum textbooks and laboratory manuals.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <RecentlyViewed
                  recentResources={recentResources}
                  onOpenResource={handleOpenResource}
                />
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <BookmarksView
              resources={resources.filter(r => r.isFavorite)}
              onOpenResource={handleOpenResource}
              onToggleBookmark={handleToggleFavorite}
            />
          )}

          {activeTab === 'shared' && (
            <SharedWithMeView
              resources={resources}
              onOpenResource={handleOpenResource}
              onToggleMyLibrary={handleToggleMyLibrary}
              sharedItemsList={userPersonalData.sharedWithMe}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView resources={resources} />
          )}

          {activeTab === 'admin' && (
            <AdminConsoleView
              currentUser={currentUser}
              onSwitchUser={(u) => handleLoginSuccess(u, 'admin')}
              onUserUpdated={handleUserUpdated}
              onOpenAuthModal={handleOpenAuthModal}
              resources={resources}
              lessonPlans={customLessonPlans}
              onDeleteResource={handleDeleteResource}
              onDeleteLessonPlan={handleDeleteLessonPlan}
              onDeleteAllUploadedResources={handleDeleteAllUploadedResources}
              onDeleteMultipleResources={handleDeleteMultipleResources}
              onOpenResource={handleOpenResource}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onOpenAuthModal={handleOpenAuthModal}
              onSignOut={handleSignOut}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'help' && (
            <HelpSupportView />
          )}
        </div>
      </main>

      {/* Interactive 3D Flipbook / PDF Modal Viewer */}
      <FlipbookReaderModal
        resource={activeReaderResource}
        onClose={() => setActiveReaderResource(null)}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
        currentUser={currentUser}
        onDeleteResource={handleDeleteResource}
      />

      {/* Upload/Add Resource Modal */}
      <UploadResourceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddResource={handleAddResource}
        onNavigateToLibrary={() => setActiveTab('library')}
        currentUser={currentUser}
      />

      {/* Create Custom Multi-Scope Lesson Plan Modal */}
      <CreateLessonPlanModal
        isOpen={isCreateLessonPlanOpen}
        onClose={() => setIsCreateLessonPlanOpen(false)}
        onSavePlan={handleSaveCustomLessonPlan}
        currentUser={currentUser}
        initialGrade={selectedGrade || '9'}
      />

      {/* Create Interactive Student Worksheet Modal */}
      <CreateWorksheetModal
        isOpen={isCreateWorksheetOpen}
        onClose={() => setIsCreateWorksheetOpen(false)}
        onAddResource={handleAddResource}
        currentUser={currentUser}
        initialGrade={selectedGrade || '6'}
      />

      {/* Generate Interactive Student Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        onAddResource={handleAddResource}
        currentUser={currentUser}
        initialGrade={selectedGrade || '9'}
      />

      {/* Share Resource Modal */}
      <ShareResourceModal
        resource={shareTargetResource}
        isOpen={!!shareTargetResource}
        onClose={() => setShareTargetResource(null)}
        onShare={handleConfirmShare}
        currentUser={currentUser}
      />

      {/* Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        mandatory={!currentUser}
        onClose={() => {
          if (currentUser) {
            setIsAuthModalOpen(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
