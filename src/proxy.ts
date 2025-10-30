import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {

    const token = request.cookies.get('accessToken')?.value;

    console.log(token)

    const { pathname } = request.nextUrl;

    const protectedPaths = ['/dashboard/*', '/profile', '/settings', '/appointments'];

    const authRoutes = ['/login', '/register', '/forgot-password'];

    const isProtectedPath = protectedPaths.some((path) => {
        pathname.startsWith(path);
    })

    // current path auth route or not
    const isAuthRoute = authRoutes.some((route)=>
        pathname === route
    )

    console.log(isAuthRoute)

    if(isProtectedPath && !token){
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if(isAuthRoute && token){
        console.log('hitting the correct block')
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/forgot-password'],
}