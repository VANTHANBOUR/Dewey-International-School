import React from 'react';
import {
  LayoutGrid,
  GraduationCap,
  BookOpen,
  Bookmark,
  Clock,
  Heart,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  Quote,
  X,
  Sparkles,
  FileSpreadsheet,
  LogIn,
  UserPlus,
  ShieldCheck,
  Key
} from 'lucide-react';
import { ActiveNavTab, UserProfile } from '../types';
import { DisLogo } from './DisLogo';

interface SidebarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  bookmarkCount?: number;
  favoriteCount?: number;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen = false,
  setMobileOpen,
  bookmarkCount = 0,
  favoriteCount = 0,
  currentUser,
  onOpenAuthModal,
}) => {
  const isAdmin = currentUser?.role === 'Administrator';

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; badge?: number | string; highlight?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'grades', label: 'Grades', icon: GraduationCap },
    { id: 'library', label: 'My Library', icon: BookOpen },
    { id: 'worksheets', label: 'Worksheets & Plans', icon: FileSpreadsheet },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, badge: bookmarkCount },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoriteCount },
    { id: 'shared', label: 'Shared with Me', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck, badge: isAdmin ? 'Admin' : 'Vault', highlight: isAdmin },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-[#0a0f24] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800/80 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } min-h-screen select-none`}
      >
        {/* Brand / Logo Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div
              className="w-full cursor-pointer group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0c1432] border border-slate-800/90 hover:border-emerald-500/40 hover:from-slate-900 hover:to-[#0f1b44] transition-all flex items-center justify-center shadow-md"
              onClick={() => setActiveTab('dashboard')}
              title="Dewey International School Curriculum Portal"
            >
              {/* Official Dewey International School First Logo */}
              <DisLogo variant="full" theme="dark" height={36} />
            </div>

            {/* Close button for mobile */}
            {setMobileOpen && (
              <button
                id="close-mobile-menu-btn"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden ml-2 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/60"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#3b66ff] text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={19}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Optional notification or counter pill */}
                {item.badge !== undefined && item.badge !== 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-purple-900/80 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-blue-900/60 group-hover:text-blue-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Auth prompt if logged out */}
        {!currentUser && onOpenAuthModal && (
          <div className="px-3.5 pb-3">
            <div className="bg-gradient-to-br from-blue-900/60 to-indigo-950/80 border border-blue-500/30 rounded-2xl p-3.5 text-center shadow-md">
              <p className="text-xs font-bold text-white mb-1">Faculty & Student Portal</p>
              <p className="text-[11px] text-blue-200/80 mb-3">Sign in to sync bookmarks and custom resources</p>
              <div className="flex gap-2">
                <button
                  id="sidebar-signin-btn"
                  onClick={() => {
                    onOpenAuthModal('signin');
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
                <button
                  id="sidebar-signup-btn"
                  onClick={() => {
                    onOpenAuthModal('signup');
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1"
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quote Card (Matching bottom left of the screenshot) */}
        <div className="p-3.5 pt-0 pb-4">
          <div className="bg-[#121936] border border-slate-800/80 rounded-2xl p-4 text-slate-300 relative overflow-hidden shadow-inner">
            {/* Subtle background glow */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none"></div>

            {/* Quote Mark */}
            <div className="text-blue-400 mb-1.5 opacity-80">
              <span className="text-2xl font-serif leading-none select-none font-black tracking-tighter">“</span>
            </div>

            <p className="text-[12.5px] leading-relaxed text-slate-300 font-normal">
              Education is the most powerful weapon which you can use to change the world.
            </p>

            <div className="mt-2.5 text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>– Nelson Mandela</span>
              <Sparkles size={13} className="text-amber-400/80" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
