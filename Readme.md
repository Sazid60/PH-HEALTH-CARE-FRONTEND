## PH-HEALTHCARE-FRONTEND-PART-2

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/part-2


## 66-1 Login flow and discussion about cookies

- for token the ip address should be same .
- we use `samesite : none`. This means site is different and the token is passed using `https` or other protocol.
- when  `samesite : lax` this means site is different but the token is passed using `http` protocol. and its customizable.
- when `samesite : strict` this means site is same and the token is passed using `http` protocol.
- when we use `http` protocol the token is not secure.
- when we use `https` protocol the token is secure.
- We are dealing the cookie from the backend. we have to get and use the cookie in frontend.
- `We can easily grab the cookie easily when frontend and backend uses the similar server.` but next.js backend is not perfect enough.there is some issues in scalability and it will be bit slower and further upgradation in micro service will not be available.
- `We can not grab the cookie easily when frontend and backend uses different server.` there are some extra layer like cors.
- we can solve this cookie will be handled by backend no much lingering in frontend. we will just send from frontend and backend will verify the cookie token.

## 66-2 Why do you have to use ‘use client’

- install 

```
npm install react-hook-form
```

```
npm install @hookform/resolvers zod
```

```
npx shadcn@latest add form
```

## 66-3 Login component and functionality part-1

- src -> utils -> login.ts 

```ts 
const loginUser = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials : "include"
    });

    console.log(res)
    return res
};

export default loginUser;
```
- src -> components -> modules -> Auth -> Login.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import loginUser from "@/utils/login";




const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log(data);
        setIsLoading(true);
        setError(null);

        try {
            const res = await loginUser(data.email, data.password)
            console.log("Login Successful :", res)
        } catch (error: any) {
            setError(error.message || "Something went wrong check Your Credentials and Try again");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-12 px-4">
            <div className="text-center mb-4">
                <Link href="/">
                    <span className="text-3xl font-bold text-primary cursor-pointer">
                        PH Health Care
                    </span>
                </Link>
            </div>

            <Card className="w-full max-w-md">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                            <CardDescription>
                                Sign in to access your dashboard.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-4">
                            {error && (
                                <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
                                    {error}
                                </p>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="m@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground"
                                                    aria-label={
                                                        showPassword ? "Hide password" : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 mt-2">
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/register" className="underline">
                                    Sign up
                                </Link>
                            </div>
                            <button className="text-center text-sm text-muted-foreground">
                                <Link href="/" className="underline">
                                    back to home
                                </Link>
                            </button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
```

## 66-4 Login component and functionality part-2
- Now Lets make the functionality to send the cookie in frontend

- src -> utils -> login.ts

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
const loginUser = async (email: string, password: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });

        console.log(res)
        const data = await res.json();
        return data
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    }
};

export default loginUser;
```

- src -> utils -> login.ts 

```ts 

    const onSubmit = async (data: LoginFormData) => {
        console.log(data);
        setIsLoading(true);
        setError(null);

        try {
            const res = await loginUser(data.email, data.password)
            console.log("Login Successful :", res)

            if (res.success) {
                // window.location.href = "/dashboard";

                router.push("/dashboard")
            } else {
                setError(res.message || "Login Failed, Please Try Again")
            }

        } catch (error: any) {
            setError(error.message || "Something went wrong check Your Credentials and Try again");
        } finally {
            setIsLoading(false);
        }
    };
```

- full version 

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import loginUser from "@/utils/login";
import { useRouter } from "next/navigation";




const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter() // as we are using "use client" we are using this if its "use server" we have to use redirect 

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log(data);
        setIsLoading(true);
        setError(null);

        try {
            const res = await loginUser(data.email, data.password)
            console.log("Login Successful :", res)

            if (res.success) {
                // window.location.href = "/dashboard";

                router.push("/dashboard")
            } else {
                setError(res.message || "Login Failed, Please Try Again")
            }

        } catch (error: any) {
            setError(error.message || "Something went wrong check Your Credentials and Try again");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-12 px-4">
            <div className="text-center mb-4">
                <Link href="/">
                    <span className="text-3xl font-bold text-primary cursor-pointer">
                        PH Health Care
                    </span>
                </Link>
            </div>

            <Card className="w-full max-w-md">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                            <CardDescription>
                                Sign in to access your dashboard.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-4">
                            {error && (
                                <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
                                    {error}
                                </p>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="m@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground"
                                                    aria-label={
                                                        showPassword ? "Hide password" : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 mt-2">
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/register" className="underline">
                                    Sign up
                                </Link>
                            </div>
                            <button className="text-center text-sm text-muted-foreground">
                                <Link href="/" className="underline">
                                    back to home
                                </Link>
                            </button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
```

- now we have to use middleware to check the login status and check the auth status and preventing from accessing unauthorized page   

## 66-5 middleware.ts renamed as proxy.ts in nextjs 16


