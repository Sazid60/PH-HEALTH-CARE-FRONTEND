## PH-HEALTHCARE-FRONTEND-PART-2 

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-2

## 66-1 Planning The Routing Architecture Of Ph Healthcare

- In this project we have 3 category users. 
  1. Admin
  2. Doctor
  3. Patient

- `Public Pages` - These pages can be accessed by any user without authentication.
  - Home Page (/)
  - About Page (/about)
  - Contact Page
- `Public Auth pages` - These pages can be accessed by any user for authentication purposes.
  - Login Page (/login)
  - Register Page(/register)
  -  Forget Password Page
  -  Reset Password Page

- `Protected Patient pages` - These pages can only be accessed by authenticated patients.
  - Patient Dashboard (/dashboard)
  - My Appointment Page (/dashboard/my-appointment)
  - My Profile Page (/dashboard/my-profile)

- `Protected Doctor pages` - These pages can only be accessed by authenticated doctors.
  - Doctor Dashboard (/doctor/dashboard)
  - Appointments Page (/doctor/dashboard/appointments)
  - My Profile Page (/doctor/dashboard/my-profile)
  - My Schedule Page (/doctor/dashboard/my-schedule)

- `Protected Admin pages` - These pages can only be accessed by authenticated admins.
  - Admin Dashboard (/admin/dashboard)
  - Manage Doctors (/admin/dashboard/manage-doctors)
  - Mange Patients (/admin/dashboard/manage-patients)
  - Statistics Managements (/admin/dashboard/statistics)
  - My profile (/admin/dashboard/my-profile)

## 66-2 Routing Setup In The Project

- see the folder structure and code files for routing setup.

## 66-3 Creating Login And Register Forms

- Next.js is fullstack framework . It has its own backend system. But we are using our own backend for the project. In react The backend api are consumed in component level. In next.js we can consume in component level but it is better to consume in `app/api` folder that means we will use next.js backend help to consume api. That means there will be communication between next.js backend and our backend system . From frontend a request will come in next.js backend then then next.js backend will communicate with our backend system. After getting response from our backend system next.js backend will send response to frontend. the purpose is to keep our api secret from frontend. its more secure. because the next.js backend api calls will not reach in browser end. 

- There are two types of component in next.js 
  1. Server Component (by default every component is server component)
  2. Client Component (if we want to use react hooks or any library that works in browser only like `react-toastify` etc we have to make that component as client component by adding `"use client"` in top of the file.) client component is fully a react component. ()

- majority time we will use server component but when we need to use react hooks or any library that works in browser only we will use client component.

- install fields 

```
npx shadcn@latest add field
```

- commonLayout  -> auth -> login -> page.tsx

```tsx 
import LoginForm from "@/components/login-form";


const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">
            Enter your credentials to access your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
```
- components -> login-form.tsx

```tsx 

"use client";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
const LoginForm = () => {


  return (
    <form >
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

          </Field>
        </div>
        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" >
              Login
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
- commonLayout  -> auth -> register -> page.tsx

```tsx 

import RegisterForm from "@/components/register-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const RegisterPage = () => {
    return (
        <>
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create an account</CardTitle>
                            <CardDescription>
                                Enter your information below to create your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RegisterForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
```
- components -> register-form.tsx

```tsx 

"use client";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";


const RegisterForm = () => {
    return (
        <form>
            <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input id="name" name="name" type="text" placeholder="John Doe" />
    
                    </Field>
                    {/* Address */}
                    <Field>
                        <FieldLabel htmlFor="address">Address</FieldLabel>
                        <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder="123 Main St"
                        />

                    </Field>
                    {/* Email */}
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                        />

                    </Field>
                    {/* Password */}
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" name="password" type="password" />

                    </Field>
                    {/* Confirm Password */}
                    <Field className="md:col-span-2">
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                        />

                    </Field>
                </div>
                <FieldGroup className="mt-4">
                    <Field>
                        <Button type="submit">
                            Create Account
                        </Button>

                        <FieldDescription className="px-6 text-center">
                            Already have an account?{" "}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Sign in
                            </a>
                        </FieldDescription>
                    </Field>
                </FieldGroup>
            </FieldGroup>
        </form>
    );
};

export default RegisterForm;
```