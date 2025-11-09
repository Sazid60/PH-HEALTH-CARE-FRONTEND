
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()

  console.log("pathname", request.nextUrl.pathname)
  const pathname = request.nextUrl.pathname;

  const accessToken = cookieStore.get("accessToken")?.value || null;

  let userRole: string | null = null;

  if(accessToken){
    const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);
    console.log(verifiedToken)

    if(typeof verifiedToken === "string"){
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return NextResponse.redirect(new URL('/login', request.url));
    }
    userRole = verifiedToken.role 
  }

  const routeOwner = getRouteOwner(pathname); 
  // path = /doctor/appointment => DOCTOR
  // path = /my-profile => COMMON
  // path = /login => null

  const isAuth = isAuthRoute(pathname); // true | false

  // rule-1  : user logged in and trying to access auth route => redirect to dashboard
  if(accessToken && isAuth){
    return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
  }

  //  rule-2 : user not logged in and trying to access open public route
  if(routeOwner === null){
    return NextResponse.next()
  }

  // rule-3 : user and trying to access protected route
  if(routeOwner === "COMMON"){
    if(!accessToken){
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next()
  }




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