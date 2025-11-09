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