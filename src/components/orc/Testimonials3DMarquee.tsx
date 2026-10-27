'use client';

import React from 'react';

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  [key: string]: unknown;
}

export function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  style,
  ...props
}: MarqueeProps) {
  return (
    <>
      <style>{`
        @keyframes marquee-horizontal {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
      <div
        {...props}
        className={`marquee-container flex overflow-hidden ${
          vertical ? 'flex-col h-full' : 'flex-row w-full'
        } ${className}`}
        style={{
          maskImage: vertical
            ? 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
            : 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: vertical
            ? 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
            : 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          ...style,
        }}
      >
        {Array.from({ length: repeat }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 pointer-events-auto"
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              gap: '24px',
              paddingBottom: vertical ? '24px' : '0px',
              paddingRight: !vertical ? '24px' : '0px',
              animation: `${vertical ? 'marquee-vertical' : 'marquee-horizontal'} var(--duration, 40s) linear infinite`,
              animationDirection: reverse ? 'reverse' : 'normal',
            }}
          >
            {children}
          </div>
        ))}
      </div>
    </>
  );
}

export default Marquee;
