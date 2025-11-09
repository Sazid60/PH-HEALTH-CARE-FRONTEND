import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

// exact : ["/my-profile", "settings"]
// patterns  : [/^\/dashboard/, /^\/patient/] // routes starting with /dashboard/* and /admin/*
type RouteConfig = {
  exact: string[],
  patterns: RegExp[]
}

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/settings"],
  patterns: [] // [password/change-password, /password/reset-password => /password/*]
}

const doctorProtectedRoutes: RouteConfig = {
  patterns: [/^\/doctor/], //routes starting with /doctor/*
  exact: [] // /assistants
}

const adminProtectedRoutes: RouteConfig = {
  patterns: [/^\/admin/], // routes starting with /admin/*
  exact: []
}

const patientProtectedRoutes: RouteConfig = {
  patterns: [/^\/dashboard/], // routes starting with /dashboard/*
  exact: []
}

const isAuthRoute = (pathname: string): boolean => {
  return authRoutes.some((route: string) => {
    // return route.startsWith(pathname)
    return route === pathname
  });
}

const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.patterns.some((pattern: RegExp) => {
    return pattern.test(pathname);
  })
  // if pathname === /dashboard/my-appointments => matches /^\/dashboard/ => return true
}

const getRouteOwner = (pathname: string): "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatches(pathname, doctorProtectedRoutes)) {
    return "DOCTOR";
  }
  if (isRouteMatches(pathname, patientProtectedRoutes)) {
    return "PATIENT";
  }
  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
}

const getDefaultDashboardRoute = (role: UserRole): string => {
  if(role === "ADMIN") return "/admin/dashboard";
  if(role === "DOCTOR") return "/doctor/dashboard";
  if(role === "PATIENT") return "dashboard";
  return "/"
}

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  console.log("pathname", request.nextUrl.pathname)
  return NextResponse.next()
}



// used negative matcher for this 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
  ],
}