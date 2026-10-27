'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { Marquee } from './Testimonials3DMarquee';

function InstagramIcon({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function VerifiedBadge({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.5-3.5 1.41-1.41 2.09 2.09 5.09-5.09 1.41 1.41-6.5 6.5z"
        fill="#0095f6"
      />
    </svg>
  );
}

function GridPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  className = '',
}: {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  const patternId = 'testimonials-grid-pattern';
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray="0"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
    </svg>
  );
}

function Avatar({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        width: '32px',
        height: '32px',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function AvatarImage({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      loading="lazy"
    />
  );
}

function AvatarFallback({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

const testimonials = [
  {
    name: 'Carlos Eduardo',
    handle: 'domcarlosbarber',
    role: 'Sócio-fundador',
    restaurant: 'Barbearia Dom Carlos',
    initials: 'CE',
    avatarBg: '#ea580c',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    metric: '+42 clientes pelo Maps',
    time: '2 d',
    likes: 74,
    body: 'Colocamos a plaquinha no balcão e atualizamos as fotos do Google. Já são mais de 40 clientes novos que vieram direto do Maps esse mês! 💈🔥',
  },
  {
    name: 'Rodrigo Faria',
    handle: 'navalhabarberclub',
    role: 'Proprietário',
    restaurant: 'Navalha & Cia Barber',
    initials: 'RF',
    avatarBg: '#c2410c',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    metric: 'Agenda cheia aos sábados',
    time: '4 d',
    likes: 88,
    body: 'Antes a gente quase não recebia ligação nem clique no "Como Chegar". Em 2 semanas com o perfil organizado e avaliações positivas, a agenda de sábado lotou. ✂️⭐',
  },
  {
    name: 'Thiago Henrique',
    handle: 'vintagecutbarbearia',
    role: 'Barbeiro Chefe',
    restaurant: 'Vintage Cut Barbearia',
    initials: 'TH',
    avatarBg: '#0369a1',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    metric: 'Ticket médio +28%',
    time: '1 sem',
    likes: 63,
    body: 'O pessoal do Eleva ORC organizou o catálogo de cortes e preços. O cliente já chega sabendo o que quer e nosso ticket médio aumentou bastante. 💈',
  },
  {
    name: 'Gabriel Miranda',
    handle: 'barbershopalpha',
    role: 'Fundador',
    restaurant: 'Alpha Men Barbershop',
    initials: 'GM',
    avatarBg: '#15803d',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    metric: '4.9 no Google Maps',
    time: '1 sem',
    likes: 95,
    body: 'A plaquinha QR no caixa facilitou demais. O cliente termina de cortar, aponta o celular e avalia antes de sair. Subimos nossa nota para 4.9 no Google! ⭐🙌',
  },
  {
    name: 'Felipe Santiago',
    handle: 'imperiobarber.club',
    role: 'Sócio',
    restaurant: 'Império Barber Club',
    initials: 'FS',
    avatarBg: '#db2777',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    metric: '1º lugar na busca local',
    time: '2 sem',
    likes: 81,
    body: 'Estávamos perdendo clientes pro concorrente da esquina que aparecia primeiro. Ajustamos as categorias e fotos no perfil e passamos pra frente! 🚀',
  },
  {
    name: 'Bruno Tavares',
    handle: 'confrariadabarba.oficial',
    role: 'Proprietário',
    restaurant: 'Confraria da Barba',
    initials: 'BT',
    avatarBg: '#6d28d9',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    metric: 'Economia de R$ 1.500',
    time: '2 sem',
    likes: 56,
    body: 'Achei que precisaria contratar agência cara. Com o Eleva ORC resolvi tudo em minutos por uma fração do preço. Valeu cada centavo. ✂️',
  },
  {
    name: 'Leandro Ramos',
    handle: 'classicfadebarber',
    role: 'Diretor',
    restaurant: 'Classic Fade Barbershop',
    initials: 'LR',
    avatarBg: '#b45309',
    img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    metric: '+3.8x visualizações',
    time: '3 sem',
    likes: 72,
    body: 'Muitos caras novos do bairro falaram que acharam a barbearia porque as fotos dos degradês e da fachada estavam impecáveis no Maps. 💈',
  },
  {
    name: 'Marcelo Antunes',
    handle: 'mestredanavalha',
    role: 'Mestre Barbeiro',
    restaurant: 'Mestre da Navalha',
    initials: 'MA',
    avatarBg: '#059669',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    metric: 'Retorno na 1ª semana',
    time: '3 sem',
    likes: 67,
    body: 'Simples, direto e sem mensalidade. A plaquinha física no balcão é bonita demais e chama a atenção de todo mundo que senta na cadeira. 🔥',
  },
  {
    name: 'Gustavo Peres',
    handle: 'studiobarbervip',
    role: 'Gerente Geral',
    restaurant: 'VIP Studio Barbearia',
    initials: 'GP',
    avatarBg: '#d97706',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    metric: '+74 avaliações reais',
    time: '1 m',
    likes: 89,
    body: 'Nossas avaliações estavam paradas há meses. Em 30 dias passamos de 18 para mais de 90 avaliações no Google. A confiança do cliente disparou! ⭐',
  },
  {
    name: 'André Souza',
    handle: 'dombarbudo',
    role: 'Fundador',
    restaurant: 'Barbearia Dom Barbudo',
    initials: 'AS',
    avatarBg: '#ea580c',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    metric: '+55% novos contatos',
    time: '1 m',
    likes: 64,
    body: 'O processo é zero enrolação. Gerou o catálogo, montou a plaquinha e orientou como manter o perfil no topo. Sensacional. 💈🙌',
  },
];

const CLIENT_BARBERSHOP_NAMES = [
  'Barbearia Dom Carlos',
  'Navalha & Cia Barber',
  'Vintage Cut Barbearia',
  'Alpha Men Barbershop',
  'Império Barber Club',
  'Confraria da Barba',
  'Classic Fade Barbershop',
  'Mestre da Navalha',
  'VIP Studio Barbearia',
  'Barbearia Dom Barbudo',
  'Don Corleone Barber',
  'Royal Fade Club',
];

function TestimonialCard({
  handle,
  restaurant,
  initials,
  avatarBg,
  img,
  metric,
  time,
  likes,
  body,
}: (typeof testimonials)[number]) {
  return (
    <div
      style={{
        width: '280px',
        maxWidth: '300px',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        background: 'linear-gradient(165deg, #f8fafc 0%, #edf2f8 100%)',
        borderRadius: '20px',
        padding: '16px 18px',
        boxShadow:
          '0 14px 34px rgba(0, 0, 0, 0.40), 0 2px 8px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.90)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brilho radial no canto superior direito */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background:
            'radial-gradient(circle at 100% 0%, rgba(245, 154, 47, 0.18) 0%, rgba(234, 88, 12, 0.12) 32%, rgba(220, 39, 67, 0.05) 55%, transparent 75%)',
          pointerEvents: 'none',
          borderTopRightRadius: '20px',
          zIndex: 0,
        }}
      />
      {/* Filete superior */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '56px',
          height: '2.5px',
          background: 'linear-gradient(90deg, transparent 0%, #f59a2f 30%, #ea580c 70%, #dc2626 100%)',
          borderTopRightRadius: '20px',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {/* Quadriculado sutil */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '140px',
          height: '140px',
          pointerEvents: 'none',
          opacity: 0.35,
          maskImage:
            'radial-gradient(circle at 100% 0%, black 20%, rgba(0, 0, 0, 0.4) 50%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(circle at 100% 0%, black 20%, rgba(0, 0, 0, 0.4) 50%, transparent 80%)',
          zIndex: 0,
        }}
      >
        <GridPattern
          width={16}
          height={16}
          x={0}
          y={0}
          className="stroke-[rgba(245,154,47,0.30)]"
        />
      </div>

      {/* Instagram Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Instagram Story Gradient Ring */}
          <div
            style={{
              padding: '2px',
              borderRadius: '50%',
              background:
                'linear-gradient(45deg, #f59a2f 0%, #ea580c 25%, #dc2626 50%, #db2777 75%, #9333ea 100%)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '1.5px',
                borderRadius: '50%',
                background: '#edf2f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar style={{ background: avatarBg }}>
                <AvatarImage src={img} alt={restaurant} />
                <AvatarFallback style={{ color: '#ffffff' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* User info */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
                className="truncate"
              >
                {handle}
              </span>
              <VerifiedBadge size={12} />
              <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>
                · {time}
              </span>
            </div>
            <span
              style={{
                fontSize: '10.5px',
                color: '#475569',
                lineHeight: 1.2,
                marginTop: '2px',
              }}
              className="truncate"
            >
              {restaurant}
            </span>
          </div>
        </div>

        {/* Instagram Gradient Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background:
              'linear-gradient(135deg, #f59a2f 0%, #ea580c 25%, #dc2626 50%, #db2777 75%, #9333ea 100%)',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.28)',
            flexShrink: 0,
            marginLeft: '8px',
          }}
          title="Instagram"
        >
          <InstagramIcon size={12} style={{ color: '#ffffff' }} />
        </div>
      </div>

      {/* Comment Body */}
      <p
        style={{
          fontSize: '12.5px',
          lineHeight: 1.55,
          color: '#1e293b',
          margin: '0 0 12px',
          wordBreak: 'break-word',
          fontWeight: 400,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {body}
      </p>

      {/* Instagram Actions Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(203, 213, 225, 0.55)',
          paddingTop: '8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Heart size={12} style={{ color: '#ff3040', fill: '#ff3040' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
            {likes}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginLeft: '4px' }}>
            Responder
          </span>
        </div>

        {/* Metric Pill */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2.5px 8px',
            borderRadius: '9999px',
            background: 'rgba(245, 154, 47, 0.12)',
            color: '#d97706',
            border: '1px solid rgba(245, 154, 47, 0.28)',
            letterSpacing: '0.01em',
          }}
        >
          {metric}
        </span>
      </div>
    </div>
  );
}

export default function Testimonials3D() {
  const marqueeNames = [
    ...CLIENT_BARBERSHOP_NAMES,
    ...CLIENT_BARBERSHOP_NAMES,
    ...CLIENT_BARBERSHOP_NAMES,
    ...CLIENT_BARBERSHOP_NAMES,
  ];

  return (
    <section
      id="depoimentos"
      className="scroll-mt-20 py-16 sm:py-24 relative overflow-hidden bg-transparent"
    >
      {/* Faixa rolante de nomes das barbearias clientes */}
      <div className="mb-14 sm:mb-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-[marquee_50s_linear_infinite] items-center gap-8 sm:gap-10 text-xs sm:text-sm font-medium uppercase tracking-[0.16em] text-slate-400/80">
          {marqueeNames.map((name, index) => (
            <span key={`${name}-${index}`} className="flex items-center gap-8 sm:gap-10 shrink-0">
              <span className="hover:text-white transition-colors">{name}</span>
              <span className="text-[var(--orc-amber-500)]/60 text-[10px] select-none">•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16" data-reveal="up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--orc-sky-400)]">
            Resultados Comprovados
          </p>
          <h2 className="studio-display-type mt-4 text-balance text-4xl leading-[1.04] sm:text-5xl text-white">
            +350 barbearias dominando o{' '}
            <span className="text-[var(--orc-amber-500)]">
              Google Maps e enchendo a agenda
            </span>
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--orc-text-secondary)] sm:text-lg">
            Veja quem organizou o perfil, ativou o display QR de balcão e multiplicou os novos clientes sem gastar com anúncios.
          </p>
        </div>

        {/* 3D Testimonials Stage */}
        <div
          className="relative flex h-[540px] sm:h-[620px] w-full flex-row items-center justify-center overflow-hidden [perspective:1000px] vignette-mask-responsive bg-transparent"
        >
          {/* Ambient Glowing Aurora */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(245, 154, 47, 0.12) 0%, rgba(98, 170, 229, 0.05) 45%, transparent 70%)',
            }}
          />

          {/* Radial Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background:
                'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 35%, rgba(25, 24, 29, 0.55) 75%, rgba(25, 24, 29, 0.95) 100%)',
            }}
          />

          {/* 3D Angled Grid Container */}
          <div
            className="testimonials-grid-transform flex flex-row items-center justify-center gap-5 md:gap-9"
          >
            {/* Coluna 1 - downwards */}
            <Marquee vertical repeat={4} className="[--duration:36s]">
              {testimonials.slice(0, 4).map((review) => (
                <TestimonialCard key={review.restaurant} {...review} />
              ))}
            </Marquee>

            {/* Coluna 2 - upwards (reverse) */}
            <Marquee vertical reverse repeat={4} className="[--duration:40s]">
              {testimonials.slice(4, 7).map((review) => (
                <TestimonialCard key={review.restaurant} {...review} />
              ))}
            </Marquee>

            {/* Coluna 3 - downwards */}
            <Marquee vertical repeat={4} className="[--duration:34s]">
              {testimonials.slice(7, 10).map((review) => (
                <TestimonialCard key={review.restaurant} {...review} />
              ))}
            </Marquee>

            {/* Coluna 4 - upwards (reverse) - Desktop */}
            <Marquee vertical reverse repeat={4} className="hidden md:flex [--duration:42s]">
              {[testimonials[1], testimonials[3], testimonials[5], testimonials[9]].map((review, i) => (
                <TestimonialCard key={`${review.restaurant}-col4-${i}`} {...review} />
              ))}
            </Marquee>
          </div>

          {/* Extremity Gradients: Fade suave nas 4 bordas para #19181D */}
          <div
            className="absolute top-0 left-0 right-0 h-[40px] md:h-[180px] pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(to bottom, #19181D 0%, rgba(25, 24, 29, 0.95) 30%, rgba(25, 24, 29, 0.60) 65%, transparent 100%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[40px] md:h-[180px] pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(to top, #19181D 0%, rgba(25, 24, 29, 0.95) 30%, rgba(25, 24, 29, 0.60) 65%, transparent 100%)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 left-0 w-[40px] md:w-[180px] pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(to right, #19181D 0%, rgba(25, 24, 29, 0.95) 35%, rgba(25, 24, 29, 0.50) 70%, transparent 100%)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-[40px] md:w-[180px] pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(to left, #19181D 0%, rgba(25, 24, 29, 0.95) 35%, rgba(25, 24, 29, 0.50) 70%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
