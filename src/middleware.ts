import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Ignora assets estáticos, _next e rotas de API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const isAgendaHost =
    host.startsWith('agenda.') ||
    host === 'agenda.oracio.uk' ||
    host.includes('agenda.localhost');

  // 1. ROTEAMENTO DO DOMÍNIO AGENDA ORC (agenda.oracio.uk)
  if (isAgendaHost) {
    // Redireciona a raiz para o painel ou apresentação da agenda
    if (pathname === '/' || pathname === '') {
      url.pathname = '/agenda';
      return NextResponse.rewrite(url);
    }

    // Rotas do painel operacional do dono
    if (pathname.startsWith('/painel')) {
      url.pathname = `/agenda${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Link privado de cancelamento/reagendamento (/b/{token})
    if (pathname.startsWith('/b/')) {
      url.pathname = `/agenda${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Página pública da barbearia (/{slug})
    // Se não for rota reservada, reescreve para a página de agendamento público (/agenda/s/{slug})
    const slug = pathname.replace(/^\//, '');
    if (slug && !slug.includes('/')) {
      url.pathname = `/agenda/s/${slug}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // 2. ROTEAMENTO DO DOMÍNIO ELEVA ORC (eleva.oracio.uk / default)
  // Redirecionamento canônico 308 se acessarem links de agenda no domínio do Eleva
  if (pathname.startsWith('/agenda/s/')) {
    const slug = pathname.replace('/agenda/s/', '');
    const agendaBase = process.env.NEXT_PUBLIC_AGENDA_URL || 'https://agenda.oracio.uk';
    return NextResponse.redirect(`${agendaBase}/${slug}`, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
