'use client';

function GoogleMapsLogo({ className = 'h-6 sm:h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#ea4335" />
      </svg>
      <span className="text-white font-semibold">Google Maps</span>
    </div>
  );
}

function GoogleSearchLogo({ className = 'h-6 sm:h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
      <span className="text-white font-semibold">Busca Google</span>
    </div>
  );
}

function InstagramLogo({ className = 'h-6 sm:h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="#E1306C" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#E1306C" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#E1306C" />
      </svg>
      <span className="text-white font-semibold">Instagram</span>
    </div>
  );
}

function WhatsAppLogo({ className = 'h-6 sm:h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor">
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.476-.15-.677.15-.2.301-.776.979-.952 1.18-.175.201-.351.226-.652.075-.301-.151-1.272-.469-2.423-1.496-.897-.8-1.503-1.788-1.68-2.089-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.175.201-.301.301-.501.101-.201.05-.377-.025-.527-.075-.151-.677-1.632-.928-2.233-.244-.585-.492-.506-.677-.515-.175-.009-.377-.01-.577-.01-.2 0-.527.075-.803.376-.276.301-1.053 1.029-1.053 2.508 0 1.48 1.079 2.91 1.229 3.111.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.229 1.379.197 1.9-.12.58-.354 1.78-1.289 2.03-1.815.25-.526.25-.978.175-1.079-.075-.1-.275-.15-.576-.301zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.98-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
      </svg>
      <span className="text-white font-semibold">WhatsApp</span>
    </div>
  );
}

function AppleMapsLogo({ className = 'h-6 sm:h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-2 0.6-2.65 1.36-.58.67-1.08 1.74-0.95 2.76 1 .08 2.06-.53 2.68-1.28z" fill="#A2AAAD"/>
      </svg>
      <span className="text-white font-semibold">Apple Maps</span>
    </div>
  );
}

const PLATFORMS = [
  { id: 'google-maps', renderLogo: () => <GoogleMapsLogo /> },
  { id: 'google-search', renderLogo: () => <GoogleSearchLogo /> },
  { id: 'instagram', renderLogo: () => <InstagramLogo /> },
  { id: 'whatsapp', renderLogo: () => <WhatsAppLogo /> },
  { id: 'apple-maps', renderLogo: () => <AppleMapsLogo /> },
] as const;

export default function GlassLogosMarquee({ className = '' }: { className?: string }) {
  const marqueeItems = [
    ...PLATFORMS,
    ...PLATFORMS,
    ...PLATFORMS,
    ...PLATFORMS,
  ];

  return (
    <div
      className={`group relative w-full overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] ${className}`}
      aria-label="Plataformas de presença digital e descoberta"
    >
      <div className="flex w-max animate-[marquee_52s_linear_infinite] items-center gap-4 sm:gap-6 group-hover:[animation-play-state:paused]">
        {marqueeItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex h-13 min-w-[150px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.035] px-5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[0_0_24px_rgba(255,255,255,0.08)] sm:h-14 sm:min-w-[165px]"
          >
            {item.renderLogo()}
          </div>
        ))}
      </div>
    </div>
  );
}
