import React from 'react';

interface DisLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'symbol' | 'crest';
  theme?: 'default' | 'dark' | 'light' | 'white';
  height?: number | string;
  className?: string;
  showText?: boolean;
}

export const DisLogo: React.FC<DisLogoProps> = ({
  variant = 'full',
  theme = 'default',
  height = 36,
  className = '',
  showText = true
}) => {
  const isDarkTheme = theme === 'dark';
  
  // Official Dewey International School brand palette
  const greenColor = theme === 'white' 
    ? '#ffffff' 
    : isDarkTheme 
    ? '#22c55e' // Vibrant green on dark backgrounds
    : '#00823b'; // Official DIS Emerald Green

  const orangeColor = theme === 'white' 
    ? '#ffffff' 
    : '#f37021'; // Official DIS Amber/Orange for the pillar "i" & Globe

  // School name text color: Green
  const textColor = theme === 'white' 
    ? '#ffffff' 
    : isDarkTheme 
    ? '#22c55e' // Green school name on dark
    : '#00823b'; // Green school name on light

  const dividerColor = theme === 'white' 
    ? 'rgba(255, 255, 255, 0.4)' 
    : isDarkTheme 
    ? '#22c55e' 
    : '#00823b';

  // Standalone Symbol (D - [Globe Pillar] - S with Open Book base)
  const SymbolSVG = (
    <svg
      viewBox="0 0 100 70"
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block select-none drop-shadow-2xs"
      aria-label="DIS Emblem"
    >
      {/* 1. Bold Emerald Letter 'D' */}
      <path
        d="M 12 12 H 28 C 39 12 46 19 46 31 C 46 43 39 50 28 50 H 12 V 12 Z M 21 21 V 41 H 27 C 33 41 36 37 36 31 C 36 25 33 21 27 21 H 21 Z"
        fill={greenColor}
      />

      {/* 2. Central Orange Column / Pedestal for "i" */}
      <g id="dis-pillar-i">
        {/* Pillar capital */}
        <rect x="47" y="24" width="8" height="2.5" rx="0.8" fill={orangeColor} />
        {/* Pillar shaft */}
        <rect x="48.5" y="26.5" width="5" height="20.5" fill={orangeColor} />
        {/* Column fluting grooves */}
        <line x1="50" y1="28" x2="50" y2="45" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
        <line x1="52" y1="28" x2="52" y2="45" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
        {/* Pillar base */}
        <rect x="47" y="47" width="8" height="2.5" rx="0.8" fill={orangeColor} />
        
        {/* Globe dot on top of "i" */}
        <circle cx="51" cy="14" r="7.5" fill={orangeColor} />
        {/* Globe meridians & equator highlights */}
        <circle cx="51" cy="14" r="7.5" stroke="#ffffff" strokeWidth="0.75" opacity="0.9" fill="none" />
        <ellipse cx="51" cy="14" rx="4" ry="7.5" stroke="#ffffff" strokeWidth="0.65" opacity="0.9" fill="none" />
        <line x1="43.5" y1="14" x2="58.5" y2="14" stroke="#ffffff" strokeWidth="0.65" opacity="0.9" />
      </g>

      {/* 3. Bold Emerald Letter 'S' */}
      <path
        d="M 78 12 C 86 12 90 16 90 22 H 81 C 81 19 78 18 75 18 C 71 18 68 20 68 23 C 68 31 89 27 89 40 C 89 47 83 51 74 51 C 65 51 60 46 60 40 H 69 C 69 43 72 45 75 45 C 78 45 80 43 80 40 C 80 32 59 35 59 23 C 59 16 65 12 78 12 Z"
        fill={greenColor}
      />

      {/* 4. Open Book Underline Foundation */}
      <g id="dis-open-book" transform="translate(0, 52)">
        {/* Left Book Page */}
        <path
          d="M 12 4 Q 30 7 50 1 L 50 5 Q 30 11 12 8 Z"
          fill={greenColor}
        />
        {/* Right Book Page */}
        <path
          d="M 52 1 Q 72 7 90 4 L 90 8 Q 72 11 52 5 Z"
          fill={greenColor}
        />
        {/* Center Spine highlight */}
        <circle cx="51" cy="4" r="1.5" fill={orangeColor} />
      </g>
    </svg>
  );

  // If only symbol or compact requested
  if (variant === 'symbol' || variant === 'compact' || (!showText && variant !== 'full' && variant !== 'horizontal')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {SymbolSVG}
      </div>
    );
  }

  // Full Logo: DIS Symbol + Vertical Divider + DEWEY INTERNATIONAL SCHOOL in Green
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* DIS Symbol */}
      <div className="shrink-0 flex items-center">
        {SymbolSVG}
      </div>

      {/* Vertical Brand Divider Line */}
      <div
        className="w-[2px] h-[34px] rounded-full shrink-0"
        style={{ backgroundColor: dividerColor }}
      />

      {/* Stacked Official Typography (Green) */}
      <div className="flex flex-col justify-center leading-none text-left tracking-tight">
        <span
          className="font-black text-[14px] uppercase leading-none tracking-wider"
          style={{ color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          DEWEY
        </span>
        <span
          className="font-extrabold text-[9.5px] uppercase leading-tight tracking-[0.14em] my-[1.5px]"
          style={{ color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          INTERNATIONAL
        </span>
        <span
          className="font-black text-[11.5px] uppercase leading-none tracking-wider"
          style={{ color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          SCHOOL
        </span>
      </div>
    </div>
  );
};
