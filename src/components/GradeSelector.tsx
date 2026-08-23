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
  const grades: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

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

      {/* Grade Buttons Row matching the image */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
        {grades.map((grade) => {
          const colorConfig = GRADE_COLORS[grade];
          const isSelected = selectedGrade === grade;

          return (
            <button
              key={grade}
              id={`grade-pill-${grade}`}
              onClick={() => onSelectGrade(isSelected ? null : grade)}
              className={`flex-1 min-w-[42px] sm:min-w-[48px] h-10 sm:h-11 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 ${
                colorConfig.bg
              } ${colorConfig.text} ${
                isSelected
                  ? 'ring-3 ring-offset-2 ring-blue-600 shadow-lg scale-105'
                  : 'opacity-95 hover:opacity-100 hover:shadow-md'
              }`}
              title={`Filter Grade ${grade}`}
            >
              <span>{grade}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
