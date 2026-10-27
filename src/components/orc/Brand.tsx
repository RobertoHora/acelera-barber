import type { SVGProps } from 'react';

type MarkProps = SVGProps<SVGSVGElement> & {
  monochrome?: boolean;
};

export function ORCMark({ monochrome = false, className, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Eleva ORC"
      className={className}
      {...props}
    >
      <circle cx="32" cy="32" r="27" fill={monochrome ? 'currentColor' : '#2B2B29'} />
      <path
        d="M47.8 18.8A21 21 0 1 0 51.5 39"
        fill="none"
        stroke={monochrome ? '#19181D' : '#62aae5'}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="7" fill={monochrome ? '#19181D' : '#EFECE5'} />
      <circle cx="51" cy="17" r="5" fill={monochrome ? '#19181D' : '#F59A2F'} />
    </svg>
  );
}

export function ORCWordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-baseline gap-1.5 ${className || ''}`} aria-label="Eleva ORC">
      {!compact ? (
        <span className="truncate text-[0.72em] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
          Eleva
        </span>
      ) : null}
      <span className="studio-body-type font-black tracking-[-0.045em] text-[#EFECE5]">ORC</span>
    </span>
  );
}

export function ORCBrand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className || ''}`}>
      <ORCMark className="size-8 sm:size-9 shrink-0" aria-hidden="true" />
      <ORCWordmark compact={compact} className="text-lg" />
    </span>
  );
}
