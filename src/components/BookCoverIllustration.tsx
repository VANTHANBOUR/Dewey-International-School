import React from 'react';
import { Resource } from '../types';

interface BookCoverProps {
  resource: Resource;
  className?: string;
}

export const BookCoverIllustration: React.FC<BookCoverProps> = ({ resource, className = '' }) => {
  if (!resource) {
    return (
      <div className={`relative w-full h-full bg-slate-800 flex items-center justify-center p-2 text-white/50 text-xs font-semibold ${className}`}>
        Dewey Curriculum
      </div>
    );
  }

  // Render high-fidelity cover based on resource id / properties
  switch (resource.id) {
    case 'res-g6-sci':
      return (
        <div className={`relative w-full h-full bg-[#0a1b33] overflow-hidden flex flex-col justify-between p-4 ${className}`}>
          {/* Biology leaves & cellular grid graphics */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/20 rounded-full blur-xl" />
          
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">Dewey Science</span>
            <h4 className="text-lg font-black text-white leading-tight mt-0.5">Grade 6<br/>Science</h4>
            <p className="text-xs font-semibold text-emerald-300/90 mt-1">Life & Living</p>
          </div>

          <div className="relative z-10 flex justify-center py-2">
            <svg viewBox="0 0 100 100" className="w-20 h-20 text-emerald-400 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Stylized leaf & DNA double helix */}
              <path d="M50 85 C30 70 20 40 50 15 C80 40 70 70 50 85 Z" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="2.5" />
              <path d="M50 20 L50 80" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M38 40 C45 42 55 42 62 40" stroke="#a7f3d0" />
              <path d="M35 55 C45 58 55 58 65 55" stroke="#a7f3d0" />
              <path d="M40 70 C45 72 55 72 60 70" stroke="#a7f3d0" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[9px] text-slate-400 font-semibold border-t border-slate-700/60 pt-2">
            <span>Dewey Curriculum</span>
            <span>Ed. 2025</span>
          </div>
        </div>
      );

    case 'res-g7-math':
      return (
        <div className={`relative w-full h-full bg-[#fef3c7] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          {/* Orange geometric triangle composition matching image */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 clip-triangle opacity-90" 
               style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-600 opacity-90"
               style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-600 opacity-70"
               style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />

          <div className="relative z-10 flex justify-between items-start">
            <span className="text-[10px] font-black text-orange-950 uppercase tracking-widest">Dewey Math</span>
            <span className="text-4xl font-black text-amber-950/80 -mt-1 font-mono">7</span>
          </div>

          <div className="relative z-10 my-auto text-left py-2">
            <h4 className="text-base font-black text-slate-900 tracking-wider uppercase font-mono">MATHEMATICS</h4>
            <p className="text-[10px] font-bold text-slate-700">Grade 7 • Core Algebra</p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-800 font-bold bg-white/60 backdrop-blur-xs px-2 py-1 rounded">
            <span>UNIT 2: ALGEBRA</span>
            <span>f(x) = ax + b</span>
          </div>
        </div>
      );

    case 'res-g3-eng':
      return (
        <div className={`relative w-full h-full bg-gradient-to-b from-[#60a5fa] via-[#93c5fd] to-[#dbeafe] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="relative z-10 text-center pt-1">
            <h4 className="text-lg font-black text-[#1e3a8a] leading-tight drop-shadow-xs">English<br/>Workbook</h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-yellow-400 text-amber-950 text-[10px] font-black rounded-full shadow-xs">
              Grade 3
            </span>
          </div>

          {/* Cheerful characters reading illustration */}
          <div className="relative z-10 flex justify-center items-center py-2">
            <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none">
              {/* Boy */}
              <circle cx="45" cy="30" r="14" fill="#fbbf24" />
              <path d="M35 22 C38 16 52 16 55 22 C55 22 52 26 45 26 C38 26 35 22 35 22 Z" fill="#78350f" />
              <circle cx="41" cy="29" r="1.5" fill="#1e293b" />
              <circle cx="49" cy="29" r="1.5" fill="#1e293b" />
              <path d="M43 35 Q45 37 47 35" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M32 45 C32 40 58 40 58 45 L58 65 L32 65 Z" fill="#ef4444" rx="4" />

              {/* Girl */}
              <circle cx="75" cy="30" r="14" fill="#fed7aa" />
              <path d="M62 25 C65 14 85 14 88 25 C88 25 85 36 88 42 C82 38 68 38 62 42 C65 36 62 25 62 25 Z" fill="#3b0764" />
              <circle cx="71" cy="29" r="1.5" fill="#1e293b" />
              <circle cx="79" cy="29" r="1.5" fill="#1e293b" />
              <path d="M73 35 Q75 37 77 35" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M62 45 C62 40 88 40 88 45 L88 65 L62 65 Z" fill="#3b82f6" rx="4" />

              {/* Shared Open Book */}
              <path d="M40 55 L60 62 L80 55 L80 72 L60 78 L40 72 Z" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
              <line x1="60" y1="62" x2="60" y2="78" stroke="#334155" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="relative z-10 bg-white/80 rounded-lg p-1.5 text-center text-[10px] font-bold text-slate-700 shadow-xs">
            Unit 4: Our Community
          </div>
        </div>
      );

    case 'res-g10-chem':
      return (
        <div className={`relative w-full h-full bg-[#070b14] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          {/* Chemistry flasks with glowing liquid */}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-teal-500/15 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase">Lab Manual</span>
              <h4 className="text-base font-black text-white tracking-wide uppercase font-mono">CHEMISTRY</h4>
            </div>
            <span className="text-xs font-black text-teal-300 font-mono px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800/80">
              Grade 10
            </span>
          </div>

          {/* Chemical Glassware SVG */}
          <div className="relative z-10 flex justify-center items-center py-2">
            <svg viewBox="0 0 100 80" className="w-24 h-20" fill="none">
              {/* Beaker & Erlenmeyer flask */}
              <path d="M30 25 L30 35 L18 65 C16 70 20 74 25 74 L45 74 C50 74 54 70 52 65 L40 35 L40 25 Z" fill="#0d9488" fillOpacity="0.3" stroke="#2dd4bf" strokeWidth="2" />
              <path d="M22 60 L48 60 C46 68 24 68 22 60 Z" fill="#2dd4bf" fillOpacity="0.8" />
              
              {/* Round flask */}
              <path d="M68 20 L68 32 C78 38 82 52 76 62 C70 72 55 72 50 62 C46 54 48 40 58 32 L58 20 Z" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="63" cy="55" r="10" fill="#38bdf8" fillOpacity="0.7" />
              
              {/* Floating reaction bubbles */}
              <circle cx="32" cy="45" r="2.5" fill="#a7f3d0" />
              <circle cx="38" cy="38" r="1.5" fill="#a7f3d0" />
              <circle cx="65" cy="40" r="2" fill="#bae6fd" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-1.5">
            <span>EXPERIMENT PROTOCOLS</span>
            <span className="text-teal-400 font-bold">2025-26</span>
          </div>
        </div>
      );

    case 'res-g9-hist':
      return (
        <div className={`relative w-full h-full bg-[#2b1f13] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          {/* Classical Colosseum architecture visual */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#180f08] via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-500/20 rounded-full blur-xl" />

          <div className="relative z-10">
            <span className="text-[10px] font-bold text-amber-400/90 tracking-widest uppercase">Ancient Studies</span>
            <h4 className="text-lg font-black text-amber-100 font-serif leading-tight">World<br/>History</h4>
          </div>

          {/* Colosseum / Roman Arch SVG */}
          <div className="relative z-10 flex justify-center items-center py-1.5">
            <svg viewBox="0 0 100 60" className="w-24 h-16 text-amber-300 drop-shadow" fill="none" stroke="currentColor" strokeWidth="1.8">
              {/* Colosseum arches */}
              <path d="M10 50 C10 30 90 30 90 50 Z" fill="#78350f" fillOpacity="0.4" stroke="#d97706" />
              <path d="M20 50 C20 40 30 40 30 50" stroke="#fcd34d" strokeWidth="2" />
              <path d="M35 50 C35 38 45 38 45 50" stroke="#fcd34d" strokeWidth="2" />
              <path d="M50 50 C50 36 60 36 60 50" stroke="#fcd34d" strokeWidth="2" />
              <path d="M65 50 C65 38 75 38 75 50" stroke="#fcd34d" strokeWidth="2" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#fcd34d" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="relative z-10 bg-black/40 backdrop-blur-xs rounded px-2 py-1 text-center">
            <p className="text-[10px] font-serif text-amber-200 font-bold">Chapter 5: Ancient Civilizations</p>
          </div>
        </div>
      );

    case 'res-g8-phys':
      return (
        <div className={`relative w-full h-full bg-[#090d24] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:10px_10px] opacity-25" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Physics Core</span>
            <h4 className="text-base font-extrabold text-white leading-tight">Grade 8<br/>Physics</h4>
          </div>
          <div className="relative z-10 flex justify-center py-2">
            <svg viewBox="0 0 80 80" className="w-16 h-16 text-indigo-400" fill="none">
              <ellipse cx="40" cy="40" rx="32" ry="12" stroke="#6366f1" strokeWidth="1.5" transform="rotate(-25 40 40)" />
              <circle cx="40" cy="40" r="10" fill="#4338ca" stroke="#818cf8" strokeWidth="2" />
              <circle cx="62" cy="30" r="4" fill="#a5b4fc" />
            </svg>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-indigo-200 truncate">Forces & Motion</div>
        </div>
      );

    case 'res-g11-bio':
      return (
        <div className={`relative w-full h-full bg-[#3b0712] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase">AP / IB Prep</span>
            <h4 className="text-base font-extrabold text-white leading-tight">Grade 11<br/>Biology</h4>
          </div>
          <div className="relative z-10 flex justify-center py-1">
            <svg viewBox="0 0 80 60" className="w-16 h-12 text-rose-400" fill="none">
              <path d="M15 15 C30 30 50 10 65 25 C50 40 30 20 15 35" stroke="#fb7185" strokeWidth="2" />
              <circle cx="40" cy="30" r="8" fill="#e11d48" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-rose-200 truncate">Cell Structure</div>
        </div>
      );

    case 'res-g5-math':
      return (
        <div className={`relative w-full h-full bg-[#064e3b] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">Elementary Math</span>
            <h4 className="text-base font-extrabold text-white leading-tight">Grade 5<br/>Mathematics</h4>
          </div>
          <div className="relative z-10 flex justify-center py-1">
            <div className="text-2xl font-black text-emerald-300 font-mono tracking-tighter">
              ¾ + ½
            </div>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-emerald-200 truncate">Unit 3: Fractions</div>
        </div>
      );

    case 'res-prep-early-steam':
      return (
        <div className={`relative w-full h-full bg-[#881337] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="absolute -top-4 -right-4 w-28 h-28 bg-rose-500/30 rounded-full blur-lg" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-rose-300 tracking-wider uppercase">Preparatory STEAM</span>
            <h4 className="text-base font-black text-white leading-tight mt-0.5">Early Science<br/>Discovery</h4>
          </div>
          <div className="relative z-10 flex justify-center py-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/30 flex items-center justify-center text-white text-xl font-bold shadow-inner">
              🌱
            </div>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-rose-200 truncate">5 Senses & Colors</div>
        </div>
      );

    case 'res-found-numbers':
      return (
        <div className={`relative w-full h-full bg-[#155e75] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-cyan-400/30 rounded-full blur-lg" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase">Foundation Math</span>
            <h4 className="text-base font-black text-white leading-tight mt-0.5">Numbers &<br/>Patterns</h4>
          </div>
          <div className="relative z-10 flex justify-center py-1">
            <div className="text-2xl font-black text-cyan-200 font-mono tracking-wider">
              1 • 2 • 3
            </div>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-cyan-200 truncate">Counting to 20</div>
        </div>
      );

    case 'res-gk-foundations':
      return (
        <div className={`relative w-full h-full bg-[#2e1065] overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="absolute -top-4 -left-4 w-28 h-28 bg-purple-500/30 rounded-full blur-lg" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-purple-300 tracking-wider uppercase">Foundation English</span>
            <h4 className="text-base font-black text-white leading-tight mt-0.5">Phonics &<br/>Alphabet</h4>
          </div>
          <div className="relative z-10 flex justify-center py-1">
            <div className="text-2xl font-black text-purple-200 font-mono tracking-wider">
              A • B • C
            </div>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-purple-200 truncate">Sounds & Rhymes</div>
        </div>
      );

    default:
      // Generic high-quality fallback based on resource subject
      return (
        <div className={`relative w-full h-full bg-gradient-to-br ${resource.coverTheme?.bg || 'from-slate-800 to-slate-950'} overflow-hidden flex flex-col justify-between p-3.5 ${className}`}>
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-white/70 uppercase">
              {resource.grade === 'Preparatory' ? 'Preparatory' : resource.grade === 'Foundation' ? 'Foundation' : `Grade ${resource.grade}`} • {resource.subject}
            </span>
            <h4 className="text-base font-extrabold text-white leading-tight mt-1">{resource.title}</h4>
          </div>
          <div className="relative z-10 text-center py-2">
            <span className="text-3xl font-black text-white/30 font-mono">
              {resource.grade === 'Preparatory' ? 'Prep' : resource.grade === 'Foundation' ? 'Found' : resource.grade}
            </span>
          </div>
          <div className="relative z-10 text-[10px] font-medium text-white/80 truncate">{resource.subtitle}</div>
        </div>
      );
  }
};
