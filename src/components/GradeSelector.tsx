import React from 'react';
import { GradeLevel } from '../types';
import { GRADE_COLORS } from '../data/mockData';

interface GradeSelectorProps {
  selectedGrade: GradeLevel | null;
  onSelectGrade: (grade: GradeLevel | null) => void;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({
  selectedGrade,
  onSelectGrade,
}) => {
  const grades: GradeLevel[] = [
    'Foundation',
    'Preparatory',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
  ];

  const getGradeShortLabel = (g: GradeLevel) => {
    if (g === 'Foundation') return 'Found';
    if (g === 'Preparatory') return 'Prep';
    return g;
  };

  const getGradeFullTitle = (g: GradeLevel) => {
    if (g === 'Foundation') return 'Filter Foundation Curriculum';
    if (g === 'Preparatory') return 'Filter Preparatory Curriculum';
    return `Filter Grade ${g} Curriculum`;
  };

  return (
    <div className="mt-4 select-none">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Grade
        </h3>
        {selectedGrade && (
          <button
            id="clear-grade-filter-btn"
            onClick={() => onSelectGrade(null)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Show All Grades (Clear filter)
          </button>
        )}
      </div>

      {/* Grade Buttons Row */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
        {grades.map((grade) => {
          const colorConfig = GRADE_COLORS[grade] || { bg: 'bg-blue-600', text: 'text-white' };
          const isSelected = selectedGrade === grade;
          const isNamedGrade = grade === 'Preparatory' || grade === 'Foundation';

          return (
            <button
              key={grade}
              id={`grade-pill-${grade}`}
              onClick={() => onSelectGrade(isSelected ? null : grade)}
              className={`flex-1 px-2.5 ${
                isNamedGrade ? 'min-w-[56px] sm:min-w-[62px]' : 'min-w-[40px] sm:min-w-[46px]'
              } h-10 sm:h-11 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 whitespace-nowrap ${
                colorConfig.bg
              } ${colorConfig.text} ${
                isSelected
                  ? 'ring-3 ring-offset-2 ring-blue-600 shadow-lg scale-105'
                  : 'opacity-95 hover:opacity-100 hover:shadow-md'
              }`}
              title={getGradeFullTitle(grade)}
            >
              <span>{getGradeShortLabel(grade)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
