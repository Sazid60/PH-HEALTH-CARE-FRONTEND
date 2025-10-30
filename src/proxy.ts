import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {

    const token = request.cookies.get('token')?.value

    const { pathname } = request.nextUrl;

    const protectedPaths = ['/dashboard', '/profile', '/appointments']

    const authRoutes = ['/login', '/register', '/forgot-password']

    //   return NextResponse.redirect(new URL('/', request.url))

    const isProtectedPath = protectedPaths.some((path) => {
        pathname.startsWith(path);

    })

    const isAuthRoute = authRoutes.some((path) => {
        pathname.startsWith(path);
    })


    if(isProtectedPath && !token){
        return NextResponse.redirect(new URL("/login", request.nextUrl))
    }

    if(isAuthRoute && token ){
        return NextResponse.redirect(new URL("/", request.nextUrl))
    }

}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/dashboard/:path*', "/login", "/register", "/forgot-password"],
}