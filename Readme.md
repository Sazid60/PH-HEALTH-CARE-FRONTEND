## PH-HEALTHCARE-FRONTEND-PART-4

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-4


## 68-1 Logging In User Automatically After Register

- the auto login will be only for patient as admin or doctor will be created by the admin only they will just login . 

- service -> auth -> loginUser.ts

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

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
    try {
        const redirectTo = formData.get('redirect') || null;
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;
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
        });

        const result = await res.json()

        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie;
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        if (!refreshTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        const cookieStore = await cookies();

        cookieStore.set("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });
        const verifiedToken: JwtPayload | string = jwt.verify(accessTokenObject.accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            throw new Error("Invalid token");

        }

        const userRole: UserRole = verifiedToken.role;


        if(!result.success){
            throw new Error("Login failed");
        }


        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(requestedPath);
            } else {
                redirect(getDefaultDashboardRoute(userRole));
            }
        } else{
            redirect(getDefaultDashboardRoute(userRole));
        }

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them this is because of when we use redirect in a try catch 
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.log(error);
        return { error: "Login failed" };
    }
}
```

- registerPatient.ts 

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import z from "zod";
import { loginUser } from "./loginUser";

const registerValidationZodSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    address: z.string().optional(),
    email: z.email({ message: "Valid email is required" }),
    password: z.string().min(6, {
        error: "Password is required and must be at least 6 characters long",
    }).max(100, {
        error: "Password must be at most 100 characters long",
    }),
    confirmPassword: z.string().min(6, {
        error: "Confirm Password is required and must be at least 6 characters long",
    }),
}).refine((data: any) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
});


export const registerPatient = async (_currentState: any, formData: any): Promise<any> => {
    try {
        console.log(formData.get("address"));
        const validationData = {
            name: formData.get('name'),
            address: formData.get('address'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        }

        const validatedFields = registerValidationZodSchema.safeParse(validationData);

        console.log(validatedFields, "val");

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.issues.map(issue => {
                    return {
                        field: issue.path[0],
                        message: issue.message,
                    }
                }
                )
            }
        }

        const registerData = {
            password: formData.get('password'),
            patient: {
                name: formData.get('name'),
                address: formData.get('address'),
                email: formData.get('email'),
            }
        }

        const newFormData = new FormData();

        newFormData.append("data", JSON.stringify(registerData));

        const res = await fetch("http://localhost:5000/api/v1/user/create-patient", {
            method: "POST",
            body: newFormData,
        })

        console.log(res, "res");

        const result = await res.json();

        //  for auto login after register
        if (result.success) {
            await loginUser(_currentState, formData);
        }

        return result;



    } catch (error: any) {
        console.log(error);
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them this is because of when we use redirect in a try catch 
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        return { error: "Registration failed" };
    }
}
```

## 68-2 Making Token Handlers For NextJS Cookie

- leta make the next.js cookie reuseable 

- services - > auth -> tokenHandler.ts

```ts
"use server"

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { cookies } from "next/headers"

export const setCookie = async (key: string, value: string, options: Partial<ResponseCookie>) => {
    const cookieStore = await cookies()
    cookieStore.set(key, value, options)

}

export const getCookie = async (key: string) => {
    const cookieStore = await cookies()
    return cookieStore.get(key)
}

export const deleteCookie = async (key: string) => {
    const cookieStore = await cookies()
    cookieStore.delete(key)
}
```

- using the reuseable function from the tokenHandler.ts file in loginUser.ts 

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { setCookie } from "./tokenHandler";

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
    try {
        const redirectTo = formData.get('redirect') || null;
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;
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
        });

        const result = await res.json()

        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie;
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        if (!refreshTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        // const cookieStore = await cookies();

        // cookieStore.set("accessToken", accessTokenObject.accessToken, {
        //     secure: true,
        //     httpOnly: true,
        //     maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
        //     path: accessTokenObject.Path || "/",
        //     sameSite: accessTokenObject['SameSite'] || "none",
        // });

        // cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
        //     secure: true,
        //     httpOnly: true,
        //     maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
        //     path: refreshTokenObject.Path || "/",
        //     sameSite: refreshTokenObject['SameSite'] || "none",
        // });
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });
        const verifiedToken: JwtPayload | string = jwt.verify(accessTokenObject.accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            throw new Error("Invalid token");

        }

        const userRole: UserRole = verifiedToken.role;


        if(!result.success){
            throw new Error("Login failed");
        }


        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(requestedPath);
            } else {
                redirect(getDefaultDashboardRoute(userRole));
            }
        } else{
            redirect(getDefaultDashboardRoute(userRole));
        }

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them this is because of when we use redirect in a try catch 
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.log(error);
        return { error: "Login failed" };
    }
}
```

- using the deleteCookie function from the tokenHandler.ts file in proxy.ts  for deleting cookies 

```ts

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
```

## 68-3 Creating Logout Component and Functionality with NextJS Cookie

- components -> shared -> LogoutButton.tsx

```tsx
"use client"

import { logoutUser } from "@/services/auth/logoutUser";
import { Button } from "../ui/button";

const LogoutButton = () => {
    const handleLogout = async () => {
        await logoutUser()
    }
    return (
        <div>
            <Button variant={"destructive"} onClick={handleLogout}>Logout</Button>
        </div>
    );
};

export default LogoutButton;
```

- services -> auth -> logoutUser.ts 

```ts 
"use server"

import { redirect } from "next/navigation";
import { deleteCookie } from "./tokenHandler"

export const logoutUser = async () =>{
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");

    redirect("/login")
}
```

- publicNavbar.tsx 

```tsx 
import Link from "next/link";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import { getCookie } from "@/services/auth/tokenHandler";
import LogoutButton from "./LogoutButton";

const PublicNavbar = async () => {
  const navItems = [
    { href: "#", label: "Consultation" },
    { href: "#", label: "Health Plans" },
    { href: "#", label: "Medicine" },
    { href: "#", label: "Diagnostics" },
    { href: "#", label: "NGOs" },
  ];

  const accessToken = await getCookie("accessToken");



  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur  dark:bg-background/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">PH Doc</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          {
            accessToken ? (
              <LogoutButton />
            ) : (
              <Link href="/login" className="text-lg font-medium">
                <Button>Login</Button>
              </Link>
            )
          }
        </div>

        {/* Mobile Menu */}

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline"> <Menu /> </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-4">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-4 flex flex-col space-y-4">
                  <div className="flex justify-center"></div>
                  <Link href="/login" className="text-lg font-medium">
                    <Button>Login</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;

```

## 68-4 Adding Error Toast For Login Form Page

- install sonner 

```
npm i sonner
```
- use the toaster in main layout.tsx

```tsx 
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PH-Health-Care",
  description: "A healthcare application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors/>
      </body>
    </html>
  );
}

```

- setting dynamic error message for development and production in loginUser.ts

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { setCookie } from "./tokenHandler";

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
    try {
        const redirectTo = formData.get('redirect') || null;
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;
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
        });

        const result = await res.json()

        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie;
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        if (!refreshTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        // const cookieStore = await cookies();

        // cookieStore.set("accessToken", accessTokenObject.accessToken, {
        //     secure: true,
        //     httpOnly: true,
        //     maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
        //     path: accessTokenObject.Path || "/",
        //     sameSite: accessTokenObject['SameSite'] || "none",
        // });

        // cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
        //     secure: true,
        //     httpOnly: true,
        //     maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
        //     path: refreshTokenObject.Path || "/",
        //     sameSite: refreshTokenObject['SameSite'] || "none",
        // });
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });
        const verifiedToken: JwtPayload | string = jwt.verify(accessTokenObject.accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            throw new Error("Invalid token");

        }

        const userRole: UserRole = verifiedToken.role;


        if (!result.success) {
            throw new Error(result.message || "Login failed");
        }


        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(requestedPath);
            } else {
                redirect(getDefaultDashboardRoute(userRole));
            }
        } else {
            redirect(getDefaultDashboardRoute(userRole));
        }

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them this is because of when we use redirect in a try catch 
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.log(error);
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : "Login Failed. You might have entered incorrect email or password."}` };
    }
}
```

- showing toast while error 

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { loginUser } from "@/services/auth/loginUser";
import { useActionState, useEffect } from "react";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { toast } from "sonner";

const LoginForm = ({ redirect }: { redirect?: string }) => {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  const getFieldError = (fieldName: string) => {
    if (state && state.errors) {
      const error = state.errors.find((err: any) => err.field === fieldName);
      return error.message;
    } else {
      return null;
    }
  };
  console.log("state",state);

  useEffect(() => {
    if (state && !state.success && state.message) {
      // Show error message to user
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      {redirect && <input type="hidden" name="redirect" value={redirect} />}
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4">
          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              //   required
            />

            {getFieldError("email") && (
              <FieldDescription className="text-red-600">
                {getFieldError("email")}
              </FieldDescription>
            )}
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              //   required
            />
            {getFieldError("password") && (
              <FieldDescription className="text-red-600">
                {getFieldError("password")}
              </FieldDescription>
            )}
          </Field>
        </div>
        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>

            <FieldDescription className="px-6 text-center">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </FieldDescription>
            <FieldDescription className="px-6 text-center">
              <a
                href="/forget-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
```

## 68-5 Adding Error And Success Toasts For Register, Login And Logout

- for registration the toast showing mechanism is similar to login error toast. see the code .
- setting the search params `loggedIn = true` from the login mechanism in loginUser.ts file 

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { setCookie } from "./tokenHandler";

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
    try {
        const redirectTo = formData.get('redirect') || null;
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;
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
        });

        const result = await res.json()

        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie;
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        if (!refreshTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        // const cookieStore = await cookies();

        // cookieStore.set("accessToken", accessTokenObject.accessToken, {
        //     secure: true,
        //     httpOnly: true,
        //     maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
        //     path: accessTokenObject.Path || "/",
        //     sameSite: accessTokenObject['SameSite'] || "none",
        // });

        // cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
        //     secure: true,
        //     httpOnly: true,
        //     maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
        //     path: refreshTokenObject.Path || "/",
        //     sameSite: refreshTokenObject['SameSite'] || "none",
        // });
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });
        const verifiedToken: JwtPayload | string = jwt.verify(accessTokenObject.accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            throw new Error("Invalid token");

        }

        const userRole: UserRole = verifiedToken.role;


        if (!result.success) {
            throw new Error(result.message || "Login failed");
        }


        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(`${requestedPath}?loggedIn=true`);
            } else {
                redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
            }
        } else {
            redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
        }

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them this is because of when we use redirect in a try catch 
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.log(error);
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : "Login Failed. You might have entered incorrect email or password."}` };
    }
}
```
- login success toast 

```tsx 
"use client"

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const LoginSuccessToast = () => {
    const searchParams = useSearchParams()



    useEffect(() => {
        console.log(searchParams.get("loggedIn"))

        if (searchParams.get("loggedIn") === "true") {
            console.log("Logged in successful toast");
            toast.success("You have been logged in successfully.");

        }
    }, [searchParams]);

    return null
};

export default LoginSuccessToast;
```
- do not forget to wrap in the main layout so that it can be accessible globally

- after showing toast remove the search param from the url. lets do it 

- loginSuccessToast.tsx file 

```tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const LoginSuccessToast = () => {
    const searchParams = useSearchParams()

    const router = useRouter()



    useEffect(() => {
        console.log(searchParams.get("loggedIn"))

        if (searchParams.get("loggedIn") === "true") {
            console.log("Logged in successful toast");
            toast.success("You have been logged in successfully.");
            // Remove the query parameter from the URL after showing the toast
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("loggedIn");
            router.replace(newUrl.toString());

        }
    }, [searchParams, router]);

    return null
};

export default LoginSuccessToast;
```

## 68-6 Setting Up The Dashboard Layout Structure

- role based nav items will be shown from the common dashboard layout file. 
- for extra role based things we will touch the specific layout files later .
- src -> app -> (dashboardLayout) -> layout.tsx

```tsx 

import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";

const CommonDashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* <h1>Dashboard Sidebar</h1> */}
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* <h1>Dashboard Navbar</h1> */}
                <DashboardNavbar />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                    <div className="max-w-7xl">{children}</div>
                </main>

            </div>
        </div>
    );
};



export default CommonDashboardLayout;
```

## 68-7 Making DashboardNavbar Component

- type -> user.interface.ts

```ts 
import { UserRole } from "@/lib/auth-utils";

export interface UserInfo {
    name: string;
    email: string;
    role: UserRole;
}                                           
```

- servicer -> auth -> getUserInfo.ts 

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { UserInfo } from "@/types/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandler";


export const getUserInfo = async (): Promise<UserInfo | null> => {

    try {
        const accessToken = await getCookie("accessToken");

        if (!accessToken) {
            return null;
        }

        const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;

        if (!verifiedToken) {
            return null;
        }

        const userInfo: UserInfo = {
            name: verifiedToken.name || "Unknown User",
            email: verifiedToken.email,
            role: verifiedToken.role,
        };

        return userInfo;
    } catch (error: any) {
        console.log(error);
        return null;
    }

}
```

- components -> modules -> Dashboard -> DashboardNavbarContent.tsx

```tsx
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserInfo } from "@/types/user.interface";
import { Bell, Search } from "lucide-react";
import UserDropdown from "./UserDropDown";

interface DashboardNavbarContentProps {
    userInfo: UserInfo 
}


const DashboardNavbarContent = ({ userInfo }: DashboardNavbarContentProps) => {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
                {/* search bar */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="search" placeholder="Search...." className="pl-9" />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                    </Button>

                    {/* User Dropdown */}
                    <UserDropdown userInfo={userInfo} />
                </div>
            </div>
        </header>
    );
};

export default DashboardNavbarContent;
```

- components -> modules -> Dashboard -> DashboardNavbar.tsx

```tsx

import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;


  return (
    <DashboardNavbarContent
      userInfo={userInfo}
    />
  );
};

export default DashboardNavbar;
```

- components -> modules -> Dashboard -> UserDropDown.tsx

```tsx
"use client";

import LogoutButton from "@/components/shared/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserInfo } from "@/types/user.interface";
import { Settings, User } from "lucide-react";
import Link from "next/link";

interface UserDropdownProps {
  userInfo: UserInfo;
}

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <span className="text-sm font-semibold">
            {userInfo.name.charAt(0).toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userInfo.name}</p>
            <p className="text-xs text-muted-foreground">{userInfo.email}</p>
            <p className="text-xs text-primary capitalize">
              {userInfo.role.toLowerCase()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/my-profile"} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/change-password"} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Change Password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600"
        >
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
```

## 68-8 Making DashboardSidebar Component

- types -> dashboard.interface.ts 

```ts 
import { UserRole } from '@/lib/auth-utils';

export interface NavItem {
    title: string;
    href : string;
    icon : string;
    badge ?: string | number;
    description ?: string;
    roles : UserRole[]
}

export interface NavSection {
    title: string;
    items: NavItem[];
}
```

- components -> modules -> Dashboard -> DashboardSidebar.tsx

```tsx
import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";
import DashboardSidebarContent from "./DashboardSidebarContent";
import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { NavSection } from "@/types/dashboard.interface";

const DashboardSidebar = async () => {
    const userInfo = (await getUserInfo()) as UserInfo;

    const navItems : NavSection[] = [];
    const dashboardHome = getDefaultDashboardRoute(userInfo.role);
    return (
        <div>
            <DashboardSidebarContent 
            userInfo={userInfo}
            navItems={navItems}
            dashboardHome={dashboardHome}
            />
        </div>
    );
};

export default DashboardSidebar;
```

- components -> modules -> Dashboard -> DashboardSidebarContent.tsx

```tsx
"use client";


import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/user.interface";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardSidebarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) => {
  const pathname = usePathname();
  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-card">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={dashboardHome} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">PH Healthcare</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                //   const Icon = getIconComponent(item.icon);
                  const Icon = <Bell/>

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {/* <Icon className="h-4 w-4" /> */}
                      <Bell className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "secondary" : "default"}
                          className="ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
              {sectionIdx < navItems.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info at Bottom */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {userInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{userInfo.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {userInfo.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebarContent;
```

