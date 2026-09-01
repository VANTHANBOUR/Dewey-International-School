import React from 'react';
import { Users, FileText, BookOpen, Share2, ArrowRight, Plus, Check } from 'lucide-react';
import { Resource, SharedResourceItem, UserProfile } from '../../types';
import { BookCoverIllustration } from '../BookCoverIllustration';

interface SharedWithMeViewProps {
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onToggleMyLibrary?: (id: string, e: React.MouseEvent) => void;
  sharedItemsList?: SharedResourceItem[];
  currentUser?: UserProfile | null;
}

export const SharedWithMeView: React.FC<SharedWithMeViewProps> = ({
  resources,
  onOpenResource,
  onToggleMyLibrary,
  sharedItemsList,
  currentUser,
}) => {
  const defaultSharedItems = (resources && resources.length > 0) ? [
    {
      resourceId: resources[0]?.id || 'res-g6-sci',
      resource: resources[0],
      sharedBy: 'Dr. Evelyn Martinez (Science Dept Head)',
      date: 'Aug 18, 2026',
      note: 'Please review Unit 1 cellular diagrams for next week’s inter-school STEAM exhibition.'
    },
    ...(resources.length > 3 ? [{
      resourceId: resources[3]?.id || 'res-g8-chem',
      resource: resources[3],
      sharedBy: 'Marcus Vance (Senior Lab Instructor)',
      date: 'Aug 15, 2026',
      note: 'Updated safety measures for titration lab.'
    }] : []),
    ...(resources.length > 5 ? [{
      resourceId: resources[5]?.id || 'res-g10-eng',
      resource: resources[5],
      sharedBy: 'Elena Rostova (Physics Coordinator)',
      date: 'Aug 12, 2026',
      note: 'Newtonian mechanics interactive module.'
    }] : [])
  ] : [];

  // Merge any dynamically shared items
  const dynamicItems = (sharedItemsList || []).map(item => {
    const matchedRes = (resources || []).find(r => r && r.id === item.resourceId);
    return {
      resourceId: item.resourceId,
      resource: matchedRes || (resources && resources[0]),
      sharedBy: `${item.sharedByName} (${item.sharedByRole || 'Faculty'})`,
      date: new Date(item.sharedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      note: item.note || 'Shared for curriculum review.'
    };
  });

  const combinedItems = [...dynamicItems, ...defaultSharedItems.filter(def => !dynamicItems.some(d => d.resourceId === def.resourceId))].filter(i => !!i.resource);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Shared with Me</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Curriculum syllabi, lab guides, and teaching flipbooks shared by Dewey faculty peers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {combinedItems.map((item, idx) => {
          const res = item.resource;
          if (!res) return null;
          return (
            <div
              key={idx}
              onClick={() => onOpenResource(res)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl overflow-hidden shadow-xs shrink-0 border border-slate-200/70">
                  <BookCoverIllustration resource={res} className="p-1 scale-90" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white ${
                      res.format === 'flipbook' ? 'bg-blue-600' : 'bg-rose-500'
                    }`}>
                      {res.format}
                    </span>
                    {res.isMyLibrary && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check size={11} className="stroke-[3]" />
                        <span>In My Library</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mt-1">
                    {res.title}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">
                    Shared by {item.sharedBy} • {item.date}
                  </p>
                  <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                    "{item.note}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {onToggleMyLibrary && (
                  <button
                    onClick={(e) => onToggleMyLibrary(res.id, e)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      res.isMyLibrary
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {res.isMyLibrary ? (
                      <>
                        <Check size={13} className="stroke-[3]" />
                        <span>In My Library</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Add to My Library</span>
                      </>
                    )}
                  </button>
                )}

                <button className="px-4 py-2 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white rounded-xl font-bold text-xs transition-colors shrink-0 flex items-center gap-1">
                  <span>View</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
