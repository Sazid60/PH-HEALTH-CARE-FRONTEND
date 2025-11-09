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