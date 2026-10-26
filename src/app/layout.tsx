import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eleva ORC • Guia de Presença Digital e Google Maps',
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
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#19181D] text-white selection:bg-[#3D3C3A]">
        {children}
      </body>
    </html>
  );
}
