import React, { useState } from 'react';
import { Settings, Bell, BookOpen, Lock, Globe, Moon, Check, Save, User, LogIn, UserPlus, LogOut, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { UserProfile, ActiveNavTab } from '../../types';

interface SettingsViewProps {
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  onNavigateToTab?: (tab: ActiveNavTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenAuthModal,
  onSignOut,
  onNavigateToTab
}) => {
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [defaultZoom, setDefaultZoom] = useState('100%');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [curriculumSync, setCurriculumSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Settings size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Portal Settings & Preferences</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Customize your Dewey flipbook reader environment, notification feeds, and curriculum preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Profile Details */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Academic Account & Profile
            </h3>
            {currentUser && onSignOut && (
              <button
                id="settings-signout-btn"
                onClick={onSignOut}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {currentUser ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white font-bold flex items-center justify-center text-sm shadow-xs ring-2 ring-blue-500/20 overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentUser.initials
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{currentUser.name}</h4>
                    <p className="text-xs text-blue-600 font-medium">{currentUser.email}</p>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 mt-1 inline-block">
                      {currentUser.department || currentUser.role}
                    </span>
                  </div>
                </div>

                {onOpenAuthModal && (
                  <button
                    id="settings-switch-account-btn"
                    onClick={() => onOpenAuthModal('signin')}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw size={13} className="text-blue-500" />
                    <span>Switch Profile</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 block font-semibold">User Role</span>
                  <span className="font-bold text-slate-800">{currentUser.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Institution</span>
                  <span className="font-bold text-slate-800">Dewey International School</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Authentication Status</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>Active Session</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-blue-50/60 rounded-2xl border border-blue-200 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Guest Visitor Mode</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                  Sign in or create an account to save custom resources, bookmark textbooks, and download answer keys.
                </p>
              </div>
              {onOpenAuthModal && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    id="settings-guest-signin-btn"
                    onClick={() => onOpenAuthModal('signin')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </button>
                  <button
                    id="settings-guest-signup-btn"
                    onClick={() => onOpenAuthModal('signup')}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Credential Vault Quick Card */}
        <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-950 rounded-2xl border border-purple-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Administrator Password & Credential Vault</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                  Firebase Firestore
                </span>
              </h4>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Access all faculty, student, and admin login details, revealed passwords, and user account management.
              </p>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              id="settings-goto-admin-console-btn"
              onClick={() => onNavigateToTab('admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <Key size={14} />
              <span>Open Admin Console</span>
            </button>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Reader Preferences */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
            Flipbook & PDF Reader Options
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Automatic Real-Time Sync</span>
                <span className="text-[11px] text-slate-500">Resume textbooks at your exact last-read page across devices</span>
              </div>
              <input
                type="checkbox"
                checked={curriculumSync}
                onChange={(e) => setCurriculumSync(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Email Curriculum Updates</span>
                <span className="text-[11px] text-slate-500">Receive notifications when new unit lab guides are published</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check size={16} />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
