import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
  iconOnly?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  showTagline = false,
  light = false,
  iconOnly = false,
}: BrandLogoProps) {
  // Height constraints based on size
  const heights = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className={`flex items-center gap-2 ${light ? 'bg-white/95 rounded-xl px-2.5 py-1 shadow-sm' : ''}`}>
        <img
          src="/LekòlWeb.png"
          alt="LekòlWeb"
          className={`${heights[size]} w-auto object-contain rounded-lg transition-transform duration-200`}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src.indexOf('logo.png') === -1) {
              target.src = '/logo.png';
            }
          }}
        />
      </div>

      {showTagline && (
        <span
          className={`font-semibold tracking-normal mt-1 pl-1 ${taglineSizes[size]} ${
            light ? 'text-teal-100' : 'text-slate-500'
          }`}
        >
          Plateforme des Écoles d'Haïti
        </span>
      )}
    </div>
  );
}
