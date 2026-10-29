import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;
  const testAccess=process.env.E2E_ACCESS_TOKEN;
  if(process.env.E2E_RUN_ID && testAccess && !pathname.startsWith('/_next') && !pathname.startsWith('/api/internal/laura') && !pathname.startsWith('/api/webhooks/infinitepay')) {
    if(url.searchParams.get('test_access')===testAccess){
      url.searchParams.delete('test_access');
      const response=NextResponse.redirect(url);
      response.cookies.set('orc_e2e_access',testAccess,{httpOnly:true,secure:url.protocol==='https:',sameSite:'lax',path:'/',maxAge:604800});
      return response;
    }
    if(request.cookies.get('orc_e2e_access')?.value!==testAccess)return new NextResponse('Homologação privada.',{status:403});
  }
  if(process.env.E2E_RUN_ID) {
    if(pathname.startsWith('/painel')||pathname.startsWith('/b/')){url.pathname='/agenda'+pathname;return NextResponse.rewrite(url);}
    const oneSegment=pathname.replace(/^\//,'');
    if(oneSegment && !oneSegment.includes('/') && oneSegment!=='agenda' && !oneSegment.includes('.')){url.pathname='/agenda/s/'+oneSegment;return NextResponse.rewrite(url);}
  }


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
  if (pathname.startsWith('/agenda/s/') && !process.env.E2E_RUN_ID) {
    const slug = pathname.replace('/agenda/s/', '');
    const agendaBase = process.env.NEXT_PUBLIC_AGENDA_URL || 'https://agenda.oracio.uk';
    return NextResponse.redirect(`${agendaBase}/${slug}`, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
