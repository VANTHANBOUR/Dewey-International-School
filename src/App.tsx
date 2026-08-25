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
import { Resource, GradeLevel, ActiveNavTab, SubjectCategory, NotificationItem, UserProfile, UserPersonalData, LessonPlanItem } from './types';
import { 
  auth, 
  onAuthStateChanged 
} from './lib/firebase';
import { 
  mapFirebaseUserToProfile, 
  saveResourceToFirestore, 
  subscribeToCustomResources,
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
  const [formatFilter, setFormatFilter] = useState<'all' | 'flipbook' | 'pdf'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Authentication state - Pops up by default on start as requested
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

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
  const [shareTargetResource, setShareTargetResource] = useState<Resource | null>(null);

  // Custom Created Lesson Plans (Yearly, Quarter, Monthly, Weekly, Daily)
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

  // When currentUser changes, reload their isolated personal data
  useEffect(() => {
    if (currentUser) {
      const personalData = loadUserPersonalData(currentUser.id);
      setUserPersonalData(personalData);
    } else {
      setUserPersonalData(loadUserPersonalData(null));
    }
  }, [currentUser]);

  // Synchronize Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await mapFirebaseUserToProfile(fbUser);
        setCurrentUser(profile);
        try {
          localStorage.setItem('dewey_auth_user', JSON.stringify(profile));
        } catch (e) {
          console.warn('Storage sync note:', e);
        }
      }
    });

    // Real-time Firestore resources listener
    const unsubscribeResources = subscribeToCustomResources((cloudResources) => {
      if (cloudResources && cloudResources.length > 0) {
        setRawResources(prev => {
          const combined = [...cloudResources];
          INITIAL_RESOURCES.forEach(initRes => {
            if (!combined.some(r => r.id === initRes.id)) {
              combined.push(initRes);
            }
          });
          return combined;
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeResources();
    };
  }, []);

  // Compute User-Isolated Resources
  // 1. Filter out personal-only resources belonging to other users
  // 2. Map user's personal bookmarks, library status, favorites, and read dates
  const resources = useMemo(() => {
    return rawResources
      .filter((res) => {
        // If a resource is marked personal-only, only its author can see it
        if (res.isPersonalOnly && res.uploadedByUserId) {
          if (!currentUser || res.uploadedByUserId !== currentUser.id) {
            return false;
          }
        }
        return true;
      })
      .map((res) => {
        const isMyLib =
          userPersonalData.myLibraryResourceIds.includes(res.id) ||
          res.uploadedByUserId === currentUser?.id;
        const isBm = userPersonalData.bookmarkedResourceIds.includes(res.id);
        const isFav = userPersonalData.favoriteResourceIds.includes(res.id);
        const userRead = userPersonalData.recentlyRead.find(r => r.resourceId === res.id);

        return {
          ...res,
          isMyLibrary: isMyLib,
          isBookmarked: isBm,
          isFavorite: isFav,
          lastReadDate: userRead ? userRead.date : res.lastReadDate,
          lastReadTimeAgo: userRead ? 'Recently' : res.lastReadTimeAgo,
        };
      });
  }, [rawResources, userPersonalData, currentUser]);

  // Auth Handlers
  const handleOpenAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    const personalData = loadUserPersonalData(user.id);
    setUserPersonalData(personalData);

    // Navigate directly to Home Page (Dashboard)
    setActiveTab('dashboard');
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

  // Save custom lesson plan handler (Yearly, Quarter, Monthly, Weekly, Daily)
  const handleSaveCustomLessonPlan = (plan: LessonPlanItem) => {
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
      message: `"${plan.title}" (${(plan.scope || 'Plan').toUpperCase()}) has been saved to your Curriculum Center.`,
      time: 'Just now',
      isRead: false,
      type: 'curriculum'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Filtered resources for Dashboard Featured section
  const featuredResources = useMemo(() => {
    return resources.filter((res) => {
      // Grade filter
      if (selectedGrade && res.grade !== selectedGrade) return false;
      // Format filter
      if (formatFilter !== 'all' && res.format !== formatFilter) return false;
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
  const pdfCount = resources.filter(r => r.format === 'pdf').length * 115 + 420; // ~920
  const bookmarkCount = resources.filter(r => r.isBookmarked).length;
  const favoriteCount = resources.filter(r => r.isFavorite).length;
  const myLibraryCount = resources.filter(r => r.isMyLibrary).length;

  // Handlers for User-Isolated Operations
  const handleToggleMyLibrary = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleBookInMyLibrary(currentUser?.id, id);
    setUserPersonalData(updated);

    const book = resources.find(r => r.id === id);
    const isNowInLibrary = updated.myLibraryResourceIds.includes(id);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isNowInLibrary ? 'Added to My Bookshelf' : 'Removed from My Bookshelf',
      message: `"${book?.title || 'Book'}" is ${isNowInLibrary ? 'now saved in your personal library' : 'removed from your personal library'}.`,
      time: 'Just now',
      isRead: false,
      type: 'curriculum',
      linkResourceId: id,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleBookmarkInUserData(currentUser?.id, id);
    setUserPersonalData(updated);
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoriteInUserData(currentUser?.id, id);
    setUserPersonalData(updated);
  };

  const handleOpenResource = (resource: Resource) => {
    // Record in user personal data
    const updated = recordBookOpenedInUserData(currentUser?.id, resource.id);
    setUserPersonalData(updated);

    setActiveReaderResource(resource);
  };

  const handleAddResource = async (newRes: Resource, openImmediately?: boolean) => {
    // Save to Firestore for persistent multi-device syncing
    await saveResourceToFirestore(newRes);

    // Save to user's personal bookshelf automatically
    const updatedUser = toggleBookInMyLibrary(currentUser?.id, newRes.id);
    setUserPersonalData(updatedUser);

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
      message: `"${newRes.title}" is saved to your personal library and synced with Firestore Cloud.`,
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
  };

  const handleOpenShareModal = (resource: Resource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShareTargetResource(resource);
  };

  const handleConfirmShare = (
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

    // Add notification
    const shareNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Resource Shared Successfully',
      message: `"${book?.title || 'Resource'}" has been shared with ${
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
                myLibraryCount={myLibraryCount}
                activeFormat={formatFilter}
                onFilterFormat={setFormatFilter}
                currentUser={currentUser}
                onOpenAuthModal={handleOpenAuthModal}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenCreateLessonPlanModal={() => setIsCreateLessonPlanOpen(true)}
                onViewMyLibrary={() => setActiveTab('library')}
              />

              {/* Grade Selector Row (K through 12) */}
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
                onViewAll={() => setActiveTab('library')}
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
            />
          )}

          {activeTab === 'worksheets' && (
            <WorksheetsView
              resources={resources}
              customLessonPlans={customLessonPlans}
              onOpenResource={handleOpenResource}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenCreateLessonPlanModal={() => setIsCreateLessonPlanOpen(true)}
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
              onSwitchUser={(u) => handleLoginSuccess(u)}
              onUserUpdated={handleUserUpdated}
              onOpenAuthModal={handleOpenAuthModal}
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
