## PH-HEALTHCARE-FRONTEND-PART-3

- GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/part-3

## 67-1 Refactoring proxy.ts part-1, 67-2 Refactoring proxy.ts part-2

- login sets the cookie and then using the token we will fetch the user details from the backend. and we will do it like we will grab the user data and keep in a `state` and wrap everything using a provider so that everywhere accessible. 
- install jwt-decode package using `npm i jwt-decode`

- proxy.ts 

```ts 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode";

/**
 * Small interface describing the shape of the JWT payload we expect.
 * Keep this lightweight — we only rely on id, email and role here.
 */
interface userInterface {
    id: string;
    email: string;
    // Role determines which protected routes the user may access
    role: "ADMIN" | "DOCTOR" | "PATIENT";
    iat: number; // issued-at timestamp
    exp: number; // expiry timestamp
}

/**
 * A minimal role -> allowed routes mapping. If you add routes here,
 * make sure they match the paths used by your Next.js `matcher`.
 *
 * Note: patterns here are simple prefixes used with startsWith in the
 * code below — they are not full glob/regex patterns.
 */
const roleBasedRoutes = {
    "ADMIN": ['/admin/dashboard/*'],
    "DOCTOR": ['/doctor/dashboard'],
    "PATIENT": ['/patient/dashboard', '/patient/appointments', '/patient/medical-records']
};

// Public authentication routes — users should be allowed to visit these
// even when they don't have a valid access token.
const authRoutes = ['/login', '/register', '/forgot-password'];

/**
 * Middleware-like proxy function used by Next.js routing. It enforces:
 * - Redirect to `/login` when no tokens are present and the route is protected
 * - Decoding of the access token to determine user role
 * - If the access token is missing/expired but a refresh token exists,
 *   it calls the backend refresh endpoint to attempt to obtain a new access token
 * - Role-based route authorization (redirect to `/unauthorized` when not allowed)
 * - Prevent logged-in users from seeing auth pages (redirect to `/`)
 *
 * Inputs:
 * - request: NextRequest provided by Next.js
 *
 * Outputs:
 * - NextResponse.redirect(...) to move the user to login/unauthorized
 * - NextResponse.next() to allow the request through
 *
 * Error modes:
 * - On token decoding or refresh errors the user is redirected to `/login`
 */
export async function proxy(request: NextRequest) {

    // Read tokens from cookies (if present). We only read; we don't set
    // cookies here — the backend refresh endpoint should set them when applicable.
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    const { pathname } = request.nextUrl;

    // If the user is unauthenticated (no tokens) and trying to access a
    // protected route (not in authRoutes) redirect them to login with a
    // `redirect` query so they return after signing in.
    if (!accessToken && !refreshToken && !authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    let user: userInterface | null = null;

    // If we have an access token, try to decode it to extract role and other claims.
    // We catch decode errors (malformed token) and treat them as unauthenticated.
    if (accessToken) {
        try {
            // jwtDecode returns the payload — we trust it conforms to userInterface
            user = jwtDecode(accessToken);
        } catch (error) {
            // Decoding failed (token corrupted or unexpected format): force login.
            console.log("Error Decoding the Access Token", error);
            return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
        }
    }

    // If decoding failed (no user) but we still have a refresh token, attempt
    // to refresh via the backend. The backend is expected to set new cookies
    // (accessToken / refreshToken) on success. If refresh fails, clear cookies
    // and redirect to login.
    if (!user && refreshToken) {
        try {
            const refreshRes = await fetch(`${process.env.BACKEND_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                // NOTE: The backend should set cookies via Set-Cookie on the response.
                // Since this running in edge/middleware, we attempt to read the cookie
                // again from the incoming request — depending on your setup you may
                // need to proxy the backend response cookies into NextResponse here.
                const newAccessToken = request.cookies.get('accessToken')?.value;
                // Non-null assertion used because we only proceed if refresh succeeded.
                user = jwtDecode(newAccessToken!);
                return NextResponse.next();
            } else {
                // Refresh failed: remove tokens and force login
                const response = NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
                response.cookies.delete('accessToken');
                response.cookies.delete('refreshToken');
                return response;
            }
        } catch (error) {
            // Network or other error while contacting auth service — treat as auth failure
            console.log("Error refreshing token", error);
            const response = NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
            response.cookies.delete('accessToken');
            response.cookies.delete('refreshToken');
            return response;
        }
    }

    // If we have a decoded user, enforce role-based routing.
    if (user) {
        // Determine allowed routes for this role. If role is missing/unknown,
        // allowedRoutes will be undefined and user will be treated as unauthorized.
        const allowedRoutes = user ? roleBasedRoutes[user.role] : [];

        // We use startsWith to match prefixes; ensure the entries in
        // `roleBasedRoutes` are compatible with this approach.
        if (allowedRoutes && allowedRoutes.some((r) => pathname.startsWith(r))) {
            // Authorized for this route — continue to requested route.
            return NextResponse.next();
        } else {
            // User is authenticated but not authorized for this route.
            return NextResponse.redirect(new URL(`/unauthorized`, request.url));
        }
    }

    // If a logged-in user attempts to open an auth page (login/register),
    // redirect them to the home page (or dashboard) since they are already signed in.
    if (user && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(`/`));
    }

    // Default: allow the request through. This covers requests like public
    // pages or cases where token handling above did not trigger a redirect.
    return NextResponse.next()
}

// Matching paths for this proxy/middleware. Adjust as your app grows.
// See Next.js docs for `matcher` patterns when adding more protected routes.
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register', '/forgot-password'],
}