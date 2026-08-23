import React, { useState } from 'react';
import {
  X,
  Share2,
  Users,
  Copy,
  CheckCircle2,
  Send,
  Mail,
  GraduationCap,
  Globe,
  Sparkles,
  Link as LinkIcon,
  BookOpen
} from 'lucide-react';
import { Resource, UserProfile, GradeLevel } from '../types';
import { BookCoverIllustration } from './BookCoverIllustration';
import { shareResourceWithAudience } from '../lib/userLibraryService';

interface ShareResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  currentUser: UserProfile | null;
  onShare?: (
    resourceId: string,
    targetType: 'school' | 'grade' | 'email',
    targetValue: string,
    note: string
  ) => void;
  onShareSuccess?: (message: string) => void;
}

export const ShareResourceModal: React.FC<ShareResourceModalProps> = ({
  isOpen,
  onClose,
  resource,
  currentUser,
  onShare,
  onShareSuccess,
}) => {
  const [shareTarget, setShareTarget] = useState<'grade' | 'school' | 'colleague'>('grade');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(resource?.grade || '6');
  const [colleagueEmail, setColleagueEmail] = useState('');
  const [note, setNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen || !resource) return null;

  const directStudyUrl = `${window.location.origin}/#book-${resource.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directStudyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const authorName = currentUser?.name || 'Educator';
      const targetType: 'school' | 'grade' | 'email' =
        shareTarget === 'school' ? 'school' : shareTarget === 'grade' ? 'grade' : 'email';
      const targetValue =
        shareTarget === 'grade' ? selectedGrade : shareTarget === 'school' ? 'all' : colleagueEmail.trim();
      const shareNote = note.trim() || `Recommended study module for ${resource.title} (${resource.subject}).`;

      if (onShare) {
        onShare(resource.id, targetType, targetValue, shareNote);
      } else {
        shareResourceWithAudience(
          currentUser?.id,
          resource.id,
          authorName,
          currentUser?.role,
          targetType,
          targetValue,
          shareNote
        );
      }

      setSuccessToast(true);
      if (onShareSuccess) {
        onShareSuccess(
          `Successfully shared "${resource.title}" with ${
            shareTarget === 'school' ? 'Entire School' : shareTarget === 'grade' ? `Grade ${selectedGrade}` : targetValue
          }!`
        );
      }

      setTimeout(() => {
        setSuccessToast(false);
        setIsSubmitting(false);
        onClose();
        setNote('');
        setColleagueEmail('');
      }, 1400);
    } catch (err) {
      console.warn('Share error:', err);
      setIsSubmitting(false);
    }
  };

  const gradesList: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Share Curriculum Book</h3>
              <p className="text-xs text-slate-400">Share with students, colleagues, or publish school-wide</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        {successToast ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h4 className="font-black text-xl text-slate-900">Resource Shared Successfully!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                Your peers and students can now access this book in their "Shared with Me" and Grade portals.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendShare} className="p-6 space-y-5">
            {/* Book Mini Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3.5">
              <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                <BookCoverIllustration resource={resource} className="scale-75 -my-2" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded text-white ${
                  resource.format === 'flipbook' ? 'bg-blue-600' : 'bg-rose-600'
                }`}>
                  {resource.format}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                  {resource.title}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  Grade {resource.grade} • {resource.subject} • {resource.totalPages} Pages
                </p>
              </div>
            </div>

            {/* Direct Study Link Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Direct Study Link</span>
                {copiedLink && <span className="text-emerald-600 font-extrabold normal-case text-[11px] flex items-center gap-1"><CheckCircle2 size={12} /> Copied to Clipboard!</span>}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono truncate flex items-center gap-2">
                  <LinkIcon size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{directStudyUrl}</span>
                </div>
                <button
                  type="button"
                  id="copy-share-link-btn"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl font-bold text-xs border border-blue-200/70 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Sharing Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Share Destination
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShareTarget('grade')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    shareTarget === 'grade'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap size={16} />
                  <span>By Grade Class</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareTarget('colleague')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    shareTarget === 'colleague'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Mail size={16} />
                  <span>Colleague Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareTarget('school')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    shareTarget === 'school'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe size={16} />
                  <span>All School</span>
                </button>
              </div>
            </div>

            {/* Target Details */}
            {shareTarget === 'grade' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Target Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {gradesList.map((g) => (
                    <option key={g} value={g}>
                      Grade {g} Students & Faculty
                    </option>
                  ))}
                </select>
              </div>
            )}

            {shareTarget === 'colleague' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Colleague Dewey Email *</label>
                <input
                  type="email"
                  required
                  value={colleagueEmail}
                  onChange={(e) => setColleagueEmail(e.target.value)}
                  placeholder="e.g. colleague@diu.edu.kh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {shareTarget === 'school' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                <span className="font-bold">Public Dewey Library:</span> This book will be featured across all Grade K-12 dashboards for every student and faculty member.
              </div>
            )}

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Study Note / Instruction for Recipients</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Please review Chapter 3 exercises before Monday lab session..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                id="submit-share-resource-btn"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Sharing...' : 'Send & Share Resource'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
