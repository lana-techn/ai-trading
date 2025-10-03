import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default clerkMiddleware((auth, req: NextRequest) => {
  // Handle Server Action errors more gracefully
  if (req.method === 'POST' && req.nextUrl.pathname === '/') {
    // Check if this might be a stale Server Action request
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('text/plain') || req.headers.get('next-action')) {
      // This looks like a stale Server Action, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Continue with normal Clerk processing
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
