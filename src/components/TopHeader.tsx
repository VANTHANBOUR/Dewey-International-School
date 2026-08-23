import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  BookOpen,
  FileText,
  User,
  LogIn,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  LogOut,
  SlidersHorizontal,
  Bookmark,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Resource, NotificationItem, UserProfile } from '../types';
import { DisLogo } from './DisLogo';

interface TopHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onOpenMobileMenu: () => void;
  onOpenUploadModal: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  resources,
  onOpenResource,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenMobileMenu,
  onOpenUploadModal,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  onNavigateToTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filtered search results for quick autocomplete dropdown
  const searchResults = searchQuery.trim() === '' ? [] : resources.filter(res =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.grade.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-transparent py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none">
      {/* Mobile Menu Trigger & Logo on small screens */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-xl shadow-xs border border-slate-200"
          aria-label="Open sidebar navigation"
        >
          <Menu size={20} />
        </button>
        <div className="bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-xs flex items-center">
          <DisLogo variant="compact" height={24} />
        </div>
      </div>

      {/* Center/Right Search Bar (Matching screenshot pill search input) */}
      <div className="flex-1 max-w-xl mx-auto lg:mx-0 lg:ml-auto flex items-center justify-end">
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search resources..."
              className="w-full pl-4 pr-10 py-2 rounded-full bg-white border border-slate-200/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Search size={17} />
            </div>
          </div>

          {/* Real-time search dropdown results */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Resources ({searchResults.length})</span>
                <span className="text-[10px] text-blue-600 font-normal">Instant Search</span>
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  id={`search-result-${res.id}`}
                  onClick={() => {
                    onOpenResource(res);
                    setIsSearchFocused(false);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-blue-50/60 transition-colors text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold ${
                      res.format === 'flipbook' ? 'bg-blue-600' : 'bg-rose-500'
                    }`}
                  >
                    {res.format === 'flipbook' ? <BookOpen size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                      {res.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Grade {res.grade} • {res.subject} • {res.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                    {res.format}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Upload, Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Upload Resource Quick Action */}
        <button
          id="top-upload-resource-btn"
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs shadow-blue-600/30"
          title="Upload new curriculum resource"
        >
          <Sparkles size={14} className="text-amber-300" />
          <span className="hidden sm:inline">Upload Resource</span>
          <span className="sm:hidden">Upload</span>
        </button>

        {/* Notifications Icon with Red Badge (Matching image) */}
        <div ref={notifRef} className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Notifications"
          >
            <Bell size={20} className="stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  id="mark-all-read-btn"
                  onClick={onClearAllNotifications}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkNotificationRead(notif.id);
                      if (notif.linkResourceId) {
                        const target = resources.find(r => r.id === notif.linkResourceId);
                        if (target) {
                          onOpenResource(target);
                          setShowNotifications(false);
                        }
                      }
                    }}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                      notif.isRead ? 'bg-slate-50/70 hover:bg-slate-100/70' : 'bg-blue-50/60 hover:bg-blue-100/60 border-l-3 border-blue-600'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" style={{ opacity: notif.isRead ? 0 : 1 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Authentication: Sign In / Sign Up buttons OR User Profile Pill */}
        {currentUser ? (
          <div ref={profileRef} className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full hover:bg-slate-200/60 bg-white/80 border border-slate-200/80 transition-all focus:outline-none shadow-xs"
            >
              {/* Avatar with gradient fallback or image */}
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/20 bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center shadow-xs">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="text-white text-xs font-bold absolute">{currentUser.initials}</span>
              </div>

              {/* Name & Role */}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium text-slate-500 leading-tight truncate max-w-[120px]">
                  {currentUser.role}
                </p>
              </div>

              {/* Chevron */}
              <ChevronDown size={14} className="text-slate-500 ml-0.5" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-slate-50 rounded-xl mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-600 font-medium truncate">{currentUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/80 inline-flex">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="truncate">{currentUser.department || currentUser.role}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    id="profile-dropdown-admin"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onNavigateToTab) onNavigateToTab('admin');
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-800 hover:bg-purple-50 rounded-lg font-bold text-left group"
                  >
                    <ShieldCheck size={15} className="text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="text-purple-900">Admin Console & Passwords</span>
                  </button>
                  <button
                    id="profile-dropdown-library"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onNavigateToTab) onNavigateToTab('bookmarks');
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-left"
                  >
                    <Bookmark size={15} className="text-slate-400" />
                    <span>My Saved Curricula</span>
                  </button>
                  <button
                    id="profile-dropdown-switch-account"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuthModal('signin');
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-left"
                  >
                    <RefreshCw size={15} className="text-blue-500" />
                    <span>Switch Account</span>
                  </button>
                  <button
                    id="profile-dropdown-preferences"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onNavigateToTab) onNavigateToTab('settings');
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-left"
                  >
                    <SlidersHorizontal size={15} className="text-slate-400" />
                    <span>Portal Settings</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    id="profile-dropdown-logout"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 rounded-lg font-medium text-left"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Sign In Button */}
            <button
              id="header-signin-btn"
              onClick={() => onOpenAuthModal('signin')}
              className="px-3.5 py-1.5 text-xs font-extrabold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full transition-all shadow-2xs flex items-center gap-1.5"
            >
              <LogIn size={14} className="text-slate-500" />
              <span>Sign In</span>
            </button>

            {/* Sign Up Button */}
            <button
              id="header-signup-btn"
              onClick={() => onOpenAuthModal('signup')}
              className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-xs shadow-blue-600/30 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
