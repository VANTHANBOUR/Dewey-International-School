import React, { useState } from 'react';
import { GraduationCap, BookOpen, FileText, ChevronRight, Filter } from 'lucide-react';
import { Resource, GradeLevel } from '../../types';
import { GRADE_COLORS } from '../../data/mockData';
import { BookCoverIllustration } from '../BookCoverIllustration';

interface GradesViewProps {
  resources: Resource[];
  onOpenResource: (resource: Resource) => void;
  onSelectGradeFilter: (grade: GradeLevel) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  resources,
  onOpenResource,
  onSelectGradeFilter,
}) => {
  const [activeGrade, setActiveGrade] = useState<GradeLevel>('6');
  const gradesList: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const gradeResources = resources.filter(r => r.grade === activeGrade);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Curriculum by Grade Level</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Explore standardized learning syllabi, textbooks, and interactive flipbooks from Kindergarten through Grade 12.
            </p>
          </div>
        </div>

        {/* Grade tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {gradesList.map((g) => {
            const config = GRADE_COLORS[g];
            const isActive = activeGrade === g;

            return (
              <button
                key={g}
                id={`grades-tab-${g}`}
                onClick={() => setActiveGrade(g)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? `${config.bg} text-white shadow-lg ring-2 ring-offset-2 ring-blue-500 scale-105`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Grade {g}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {resources.filter(r => r.grade === g).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Resources Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>Grade {activeGrade} Materials</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {gradeResources.length} items
            </span>
          </h2>
        </div>

        {gradeResources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700">No resources currently filtered for Grade {activeGrade}</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a resource or select another grade above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {gradeResources.map((res) => (
              <div
                key={res.id}
                onClick={() => onOpenResource(res)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <BookCoverIllustration resource={res} />
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-md text-white ${
                    res.format === 'flipbook' ? 'bg-[#3b66ff]' : 'bg-[#e11d48]'
                  }`}>
                    {res.format}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{res.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700">{res.subject}</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      Read Now <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
