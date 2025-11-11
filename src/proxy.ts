
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken';
// import { cookies } from 'next/headers';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';
import { deleteCookie } from './services/auth/tokenHandler';



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  // const cookieStore = await cookies()

  console.log("pathname", request.nextUrl.pathname)
  const pathname = request.nextUrl.pathname;

  const accessToken = request.cookies.get("accessToken")?.value || null;

  let userRole: string | null = null;

  if (accessToken) {
    const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);
    console.log(verifiedToken)

    if (typeof verifiedToken === "string") {
      // cookieStore.delete("accessToken");
      // cookieStore.delete("refreshToken");
      await deleteCookie("accessToken");
      await deleteCookie("refreshToken");

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
  if (accessToken && isAuth) {
    return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
  }

  //  rule-2 : user not logged in and trying to access open public route
  if (routeOwner === null) {
    return NextResponse.next()
  }

  //  rule-1 and rule-2 for public route and auth routes 

    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }


  // rule-3 : user and trying to access protected route
  if (routeOwner === "COMMON") {
    return NextResponse.next()
  }

  // rule-4 : user trying to access role based protected route

  if (routeOwner === "ADMIN" || routeOwner === "DOCTOR" || routeOwner === "PATIENT") {
    if (userRole !== routeOwner) {
      return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
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