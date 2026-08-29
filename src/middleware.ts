import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all routes EXCEPT:
  // - public landing page ('/')
  // - auth pages ('/login', '/signup')
  // - public API routes ('/api/auth/*', '/api/colleges')
  // - static assets ('/_next', '/favicon.ico', '/images')
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - api/colleges (used in signup)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - signup
     * - $ (home page)
     */
    "/((?!api/auth|api/colleges|_next/static|_next/image|favicon.ico|login|signup|$).*)",
  ],
};
