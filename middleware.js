import { NextResponse } from 'next/server';

export function middleware(request) {
  // Log request information
  console.log(`Middleware: Processing request for ${request.nextUrl.pathname}`);
  
  // Allow the request to continue to the destination
  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 