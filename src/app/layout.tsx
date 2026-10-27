import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Poppins } from 'next/font/google';
import './globals.css';

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-studio-display',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-studio-sans',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#19181D' },
    { media: '(prefers-color-scheme: dark)', color: '#19181D' },
  ],
};

export const metadata: Metadata = {
  title: 'Eleva ORC • Diagnóstico e Presença Digital no Google Maps para Barbearias',
  description:
    'Diagnóstico de presença digital, catálogo de serviços e display para avaliações no Google Maps para barbearias.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSerifDisplay.variable} ${poppins.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#19181D] text-white selection:bg-[#3D3C3A] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
