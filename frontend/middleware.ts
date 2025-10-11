import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// List of static assets that should be cached aggressively
const STATIC_ASSETS = ['/fonts', '/images', '/_next/static', '/_next/image'];

// List of API routes that should not be cached
const API_ROUTES = ['/api', '/auth'];

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Handle stale Server Action requests (from old builds)
  if (req.method === 'POST' && req.headers.get('next-action')) {
    // Don't redirect - let Next.js handle it with proper error
    // Just add a header to indicate stale action
    const response = NextResponse.next();
    response.headers.set('X-Stale-Action', 'true');
    return response;
  }
  
  // Create response with performance optimizations
  const response = NextResponse.next();
  
  // Apply security headers globally
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Optimize static assets caching
  if (STATIC_ASSETS.some(path => pathname.startsWith(path))) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  
  // Prevent API routes from being cached
  if (API_ROUTES.some(path => pathname.startsWith(path))) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }
  
  // Add performance timing header for monitoring
  const startTime = Date.now();
  response.headers.set('Server-Timing', `middleware;dur=${Date.now() - startTime}`);
  
  // Enable compression hints
  response.headers.set('Accept-Encoding', 'gzip, compress, br');
  
  // Optimize prefetch for better performance
  if (req.headers.get('purpose') === 'prefetch') {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  }
  
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
