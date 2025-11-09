## PH-HEALTHCARE-FRONTEND-PART-3

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-3


## 67-1 Setting Token in Cookies Using NextJS Cookies

- we will grab the cookie and set in header 
- we will use a package named `cookie`

```
npm install cookie
```
- `const setCookieHeaders = res.headers.getSetCookie();` using this we get a array of string of acces token and many other things . `cookie` take the string and converts it into object 

- src -> services -> auth -> loginUser.ts 

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import z from "zod";

import { parse } from "cookie"
import { cookies } from "next/headers";

/**
 * Validation schema for login form fields.
 * Using zod to validate that email and password meet basic requirements.
 * - email: required and must be a valid email string
 * - password: required, minimum 6 characters, maximum 100 characters
 */
const loginValidationZodSchema = z.object({
    email: z.email({
        message: "Email is required",
    }),
    password: z.string("Password is required").min(6, {
        error: "Password is required and must be at least 6 characters long",
    }).max(100, {
        error: "Password must be at most 100 characters long",
    }),
});


/**
 * Server action that handles user login.
 *
 * This function expects form data (from a Next.js form action) containing
 * the 'email' and 'password' fields. It validates the fields, sends a
 * POST request to the authentication API, parses Set-Cookie headers from
 * the response to extract access and refresh tokens, and then sets those
 * tokens into the Next.js server-side cookie store.
 *
 * Notes / contract:
 * - Inputs: _currentState (unused, kept for signature compatibility), formData (FormData)
 * - Outputs: the parsed JSON response from the auth API on success, or an
 *   object with error information on failure.
 * - Error modes: returns validation errors when input invalid, or { error: "Login failed" }
 *   on unexpected failures.
 *
 * Edge cases considered:
 * - Missing/invalid form fields (returns structured validation errors)
 * - Missing Set-Cookie headers from upstream (throws and returns login failed)
 * - Missing access or refresh tokens in cookies (throws and returns login failed)
 *
 * @param _currentState - placeholder param (kept for compatibility)
 * @param formData - FormData object containing 'email' and 'password'
 */
export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    // We'll populate these once we parse the Set-Cookie headers from the API response
    let accessTokenObject: null | any = null;
    let refreshTokenObject: null | any = null;

    try {
        // Collect the posted form values into a plain object for validation + request
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        // Validate inputs using zod. safeParse returns success=false on validation errors
        const validatedFields = loginValidationZodSchema.safeParse(loginData);

        if (!validatedFields.success) {
            // Convert zod issues into a small errors array consumable by the client
            return {
                success: false,
                errors: validatedFields.error.issues.map(issue => {
                    return {
                        field: issue.path[0],
                        message: issue.message,
                    }
                })
            }
        }

        // Send login request to auth API. Note: URL is currently pointing to localhost.
        const res = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: {
                "Content-Type": "application/json",
            },
        })

        // Read JSON response body (could contain status, user info, etc.)
        const result = await res.json();

        // Some servers return cookies via multiple Set-Cookie headers. Next's fetch
        // provides getSetCookie() which returns an array of cookie header strings.
        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            // Parse each Set-Cookie header string into a simple object using 'cookie'
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie)
                // parsedCookie is a simple key->value map of cookie name to cookie value

                // The upstream server is expected to set cookies named 'accessToken' and 'refreshToken'
                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie
                }

                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie
                }
            })
        } else {
            // No Set-Cookie headers at all -> cannot obtain tokens
            throw new Error("No Set-Cookie header found");
        }

        // Ensure we found both tokens
        if (!accessTokenObject) {
            throw new Error("Access Token not found in cookie")
        }
        if (!refreshTokenObject) {
            throw new Error("Refresh Token not found in cookie")
        }

        // Obtain Next.js server cookie store and write tokens server-side
        const cookieStore = await cookies()

        // Set access token cookie on the server-side cookie store. The properties
        // here (httpOnly, maxAge, path, secure) can be adjusted to match your
        // security requirements and upstream cookie attributes.
        cookieStore.set("accessToken", accessTokenObject.accessToken, {
            httpOnly: true,
            // parsed cookie attributes may use different keys (e.g. 'Max-Age' vs 'MaxAge')
            // The code uses whichever key your upstream sets—adjust if needed.
            maxAge: parseInt(accessTokenObject.MaxAge),
            path: accessTokenObject.path || "/",
            secure: true

        })

        // Same for refresh token
        cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject.MaxAge),
            path: refreshTokenObject.path || "/",
            secure: true

        })

        // Return the original API JSON result so the caller can handle navigation / messaging
        return result;

    } catch (error) {
        // Log error server-side for debugging. Return a simple object for the client.
        console.log(error);
        return { error: "Login failed" };
    }
}
```

## 67-2 Introducing Proxy file in NextJS

- fixing tokens 

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import z from "zod";

import { parse } from "cookie"
import { cookies } from "next/headers";

const loginValidationZodSchema = z.object({
    email: z.email({
        message: "Email is required",
    }),
    password: z.string("Password is required").min(6, {
        error: "Password is required and must be at least 6 characters long",
    }).max(100, {
        error: "Password must be at most 100 characters long",
    }),
});

export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    let accessTokenObject: null | any = null;
    let refreshTokenObject: null | any = null;
    try {
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        const validatedFields = loginValidationZodSchema.safeParse(loginData);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.issues.map(issue => {
                    return {
                        field: issue.path[0],
                        message: issue.message,
                    }
                })
            }
        }

        const res = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: {
                "Content-Type": "application/json",
            },
        })

        const result = await res.json();

        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                // console.log(cookie, "For each Cookie")
                const parsedCookie = parse(cookie)
                console.log(parsedCookie, "parsed cookie")

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie
                }

                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        console.log({
            accessTokenObject, refreshTokenObject
        })


        if (!accessTokenObject) {
            throw new Error("Access Token not found in cookie")
        }
        if (!refreshTokenObject) {
            throw new Error("Refresh Token not found in cookie")
        }

        const cookieStore = await cookies()

        cookieStore.set("accessToken", accessTokenObject.accessToken, {
            httpOnly : true,
            maxAge : parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path : accessTokenObject.path ||"/",
            secure : true,
            sameSite : accessTokenObject['SameSite'] || "none"

        })
        cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
            httpOnly : true,
            maxAge : parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path : refreshTokenObject.path ||"/",
            secure : true,
            sameSite : refreshTokenObject['SameSite'] || "none"

        })

        console.log({
            res,
            result
        })

        return result;

    } catch (error) {
        console.log(error);
        return { error: "Login failed" };
    }
}
```
### how will the middleware will work? 
- suppose we want to hit /dashboard route
- so the request will first go to middleware.ts(match where supposed to go and what is required) file then it will hit the root layout then will hit the sub layout and finally then the page. 
- Proxy allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.


- the proxy file will be inside src folder root. if we do not maintain the src then the proxy file will be in root directory.

- proxy.ts template 

```ts 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
}
```

## 67-3 Planning On Route Protection & Authorization

#### types of routing 
- `public routes` 
  - `open public routes` : /, /about /contact /services , /doctors/doctorId
  - `auth related public routes`: /login /register /forgot-password /reset-password
- `protected routes` 
  - `common protected routes` : /my-profile , /settings, /change-password, /my-profile/*
  - `role based protected routes` : /dashboard/* (patient) , /admin/dashboard* (admin) , /doctor/dashboard* (doctor), /doctor/routine*, /assistant (doctor)

#### the patter will be like 
- exact path match 
- Router Pattern Match (/doctor/*)


- proxy.ts 

```ts 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
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
```

## 67-4 Type Definitions & Route Configuration in Proxy File

- install jsonwebtoken 

```
npm install jsonwebtoken
```

- proxy.ts 

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

// exact : ["/my-profile", "settings"]
// patterns  : [/^\/dashboard/, /^\/patient/] // routes starting with /dashboard/* and /admin/*
type RouteConfig ={
  exact : string[],
  patterns : RegExp[]
}

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const commonProtectedRoutes : RouteConfig = {
  exact : ["/my-profile", "/settings"],
  patterns :[] // [password/change-password, /password/reset-password => /password/*]
}

const doctorProtectedRoutes : RouteConfig = {
  patterns : [/^\/doctor/], //routes starting with /doctor/*
  exact : [] // /assistants
}

const adminProtectedRoutes : RouteConfig = {
  patterns : [/^\/admin/], // routes starting with /admin/*
  exact : []
}

const patientProtectedRoutes : RouteConfig = {
  patterns : [/^\/dashboard/], // routes starting with /dashboard/*
  exact : []
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
```

- the structure of Routes will be like this 

## 67-5 Helper Functions For Route Protections in Proxy File

- JavaScript Array some() The some() method checks if any array elements pass a test (provided as a callback function). The some() method executes the callback function once for each array element. The some() method returns true (and stops) if the function returns true for one of the array elements.
- lets make the helper functions 

```ts 
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
```