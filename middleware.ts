import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Redirect old routes to unified /file/* routes
  if (pathname.startsWith('/skills/') && !pathname.startsWith('/skills/local')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/skills/', '/file/skills/');
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/commands/') && !pathname.startsWith('/commands/local')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/commands/', '/file/commands/');
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/agents/') && !pathname.startsWith('/agents/local')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/agents/', '/file/agents/');
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/output-styles/') && !pathname.startsWith('/output-styles/local')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/output-styles/', '/file/output-styles/');
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/config-file/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/config-file/', '/file/');
    return NextResponse.redirect(url);
  }

  // Check if the request is for a .md file (both old and new paths)
  if (pathname.endsWith('.md')) {
    // Try new unified path first: /file/{type}/{name}.md
    let match = pathname.match(/^\/file\/(skills|commands|agents|output-styles)\/([^/]+)\.md$/);

    // Fallback to old path: /{type}/{name}.md
    if (!match) {
      match = pathname.match(/^\/(skills|commands|agents|output-styles)\/([^/]+)\.md$/);
    }

    if (match) {
      const [, type, name] = match;

      // Rewrite to the raw API endpoint
      const url = request.nextUrl.clone();
      url.pathname = `/api/raw/${type}/${name}`;

      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/skills/:path*',
    '/commands/:path*',
    '/agents/:path*',
    '/output-styles/:path*',
    '/config-file/:path*',
    '/file/:path*',
  ],
};
