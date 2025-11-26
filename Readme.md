# PH-HEALTH CARE PART-8

Frontend GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-8



Backend GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/dev



## 72-1 Completing Admin, Patient, Schedule, Appointment Pages

- aLL THE RELEVANT PAGE AND COMPONENTS AND SERVICES ARE ADDED. CHECKOUT CODE 


## 72-2 Completing Get Me And My Profile Page With Caching

- Earlier we were fetching the user data from token now wer are going to fetch from out backend get me route.

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { UserInfo } from "@/types/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandlers";

export const getUserInfo = async (): Promise<UserInfo | any> => {
    let userInfo: UserInfo | any;
    try {

        const response = await serverFetch.get("/auth/me", {
            cache: "force-cache",
            next: { tags: ["user-info"] }
        })

        const result = await response.json();

        if (result.success) {
            const accessToken = await getCookie("accessToken");

            if (!accessToken) {
                throw new Error("No access token found");
            }

            const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;

            userInfo = {
                name: verifiedToken.name || "Unknown User",
                email: verifiedToken.email,
                role: verifiedToken.role,
            }
        }

        userInfo = {
            name: result.data.admin?.name || result.data.doctor?.name || result.data.patient?.name || result.data.name || "Unknown User",
            ...result.data
        };



        return userInfo;
    } catch (error: any) {
        console.log(error);
        return {
            id: "",
            name: "Unknown User",
            email: "",
            role: "PATIENT",
        };
    }

}
```

- component -> modules -> MyProfile -> MyProfile.tsx

```tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/formatters";
import { updateMyProfile } from "@/services/auth/auth.service";
import { UserInfo } from "@/types/user.interface";
import { Camera, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface MyProfileProps {
  userInfo: UserInfo;
}

const MyProfile = ({ userInfo }: MyProfileProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getProfilePhoto = () => {
    if (userInfo.role === "ADMIN") {
      return userInfo.admin?.profilePhoto;
    } else if (userInfo.role === "DOCTOR") {
      return userInfo.doctor?.profilePhoto;
    } else if (userInfo.role === "PATIENT") {
      return userInfo.patient?.profilePhoto;
    }
    return null;
  };

  const getProfileData = () => {
    if (userInfo.role === "ADMIN") {
      return userInfo.admin;
    } else if (userInfo.role === "DOCTOR") {
      return userInfo.doctor;
    } else if (userInfo.role === "PATIENT") {
      return userInfo.patient;
    }
    return null;
  };

  const profilePhoto = getProfilePhoto();
  const profileData = getProfileData();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateMyProfile(formData);

      if (result.success) {
        setSuccess(result.message);
        setPreviewImage(null);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  {previewImage || profilePhoto ? (
                    <AvatarImage
                      src={previewImage || (profilePhoto as string)}
                      alt={userInfo.name}
                    />
                  ) : (
                    <AvatarFallback className="text-3xl">
                      {getInitials(userInfo.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="file"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <Input
                    type="file"
                    id="file"
                    name="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isPending}
                  />
                </label>
              </div>

              <div className="text-center">
                <p className="font-semibold text-lg">{userInfo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {userInfo.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {userInfo.role.replace("_", " ")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Common Fields for All Roles */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profileData?.name || userInfo.name}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    defaultValue={profileData?.contactNumber || ""}
                    required
                    disabled={isPending}
                  />
                </div>

                {/* Doctor-Specific Fields */}
                {userInfo.role === "DOCTOR" && userInfo.doctor && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        defaultValue={userInfo.doctor.address || ""}
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">
                        Registration Number
                      </Label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        defaultValue={userInfo.doctor.registrationNumber || ""}
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (Years)</Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        defaultValue={userInfo.doctor.experience || ""}
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointmentFee">Appointment Fee</Label>
                      <Input
                        id="appointmentFee"
                        name="appointmentFee"
                        type="number"
                        defaultValue={userInfo.doctor.appointmentFee || ""}
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        defaultValue={userInfo.doctor.qualification || ""}
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentWorkingPlace">
                        Current Working Place
                      </Label>
                      <Input
                        id="currentWorkingPlace"
                        name="currentWorkingPlace"
                        defaultValue={userInfo.doctor.currentWorkingPlace || ""}
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        name="designation"
                        defaultValue={userInfo.doctor.designation || ""}
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        defaultValue={userInfo.doctor.gender || "MALE"}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Patient-Specific Fields */}
                {userInfo.role === "PATIENT" && userInfo.patient && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={userInfo.patient.address || ""}
                      disabled={isPending}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;

```

- services -> auth -> auth.service.ts

```ts
"use server";
import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { verifyAccessToken } from "@/lib/jwtHanlders";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { resetPasswordSchema } from "@/zod/auth.validation";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getUserInfo } from "./getUserInfo";
import { deleteCookie, getCookie, setCookie } from "./tokenHandlers";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function updateMyProfile(formData: FormData) {
    try {
        // Create a new FormData with the data property
        const uploadFormData = new FormData();

        // Get all form fields except the file
        const data: any = {};
        formData.forEach((value, key) => {
            if (key !== 'file' && value) {
                data[key] = value;
            }
        });

        // Add the data as JSON string
        uploadFormData.append('data', JSON.stringify(data));

        // Add the file if it exists
        const file = formData.get('file');
        if (file && file instanceof File && file.size > 0) {
            uploadFormData.append('file', file);
        }

        const response = await serverFetch.patch(`/user/update-my-profile`, {
            body: uploadFormData,
        });

        const result = await response.json();

        revalidateTag("user-info", { expire: 0 }); // we can set max here because it shows shows previous data while new data coming and finally shows new data 
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

// Reset Password
export async function resetPassword(_prevState: any, formData: FormData) {

    const redirectTo = formData.get('redirect') || null;

    // Build validation payload
    const validationPayload = {
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate
    const validatedPayload = zodValidator(validationPayload, resetPasswordSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {

        const accessToken = await getCookie("accessToken");

        if (!accessToken) {
            throw new Error("User not authenticated");
        }

        const verifiedToken = jwt.verify(accessToken as string, process.env.JWT_SECRET!) as jwt.JwtPayload;
        console.log(verifiedToken)

        const userRole: UserRole = verifiedToken.role;

        const user = await getUserInfo();
        // API Call
        const response = await serverFetch.post("/auth/reset-password", {
            body: JSON.stringify({
                id: user?.id,
                password: validationPayload.newPassword,
            }),
            headers: {
                "Authorization": accessToken,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Reset password failed");
        }

        if (result.success) {
            // await get
            revalidateTag("user-info", { expire: 0 });
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
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}

export async function getNewAccessToken() {
    try {
        const accessToken = await getCookie("accessToken");
        const refreshToken = await getCookie("refreshToken");

        //Case 1: Both tokens are missing - user is logged out
        if (!accessToken && !refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        // Case 2 : Access Token exist- and need to verify
        if (accessToken) {
            const verifiedToken = await verifyAccessToken(accessToken);

            if (verifiedToken.success) {
                return {
                    tokenRefreshed: false,
                }
            }
        }

        //Case 3 : refresh Token is missing- user is logged out
        if (!refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        //Case 4: Access Token is invalid/expired- try to get a new one using refresh token
        // This is the only case we need to call the API

        // Now we know: accessToken is invalid/missing AND refreshToken exists
        // Safe to call the API
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;

        // API Call - serverFetch will skip getNewAccessToken for /auth/refresh-token endpoint
        const response = await serverFetch.post("/auth/refresh-token", {
            headers: {
                Cookie: `refreshToken=${refreshToken}`,
            },
        });

        const result = await response.json();

        console.log("access token refreshed!!");

        const setCookieHeaders = response.headers.getSetCookie();

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

        await deleteCookie("accessToken");
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await deleteCookie("refreshToken");
        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });

        if (!result.success) {
            throw new Error(result.message || "Token refresh failed");
        }


        return {
            tokenRefreshed: true,
            success: true,
            message: "Token refreshed successfully"
        };


    } catch (error: any) {
        return {
            tokenRefreshed: false,
            success: false,
            message: error?.message || "Something went wrong",
        };
    }

}
```

- (DashboardLayout) -> (commonProtectedLayout) -> (my-profile) -> page.tsx

```tsx 
import MyProfile from "@/components/modules/MyProfile/MyProfile";
import { getUserInfo } from "@/services/auth/getUserInfo";

const MyProfilePage = async () => {
  const userInfo = await getUserInfo();
  return <MyProfile userInfo={userInfo} />;
};

export default MyProfilePage;

```

## 72-3 Reset Password Pages For Admin and Doctor Role

- (commonLayout) -> (auth) -> reset-password -> page.tsx

```tsx
import ResetPasswordForm from "@/components/ResetPasswordForm";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) => {
  const params = (await searchParams) || {};
  const redirect = params.redirect;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below to reset your account password
          </p>
        </div>
        <ResetPasswordForm redirect={redirect} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;

```

- components -> ResetPasswordForm.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/services/auth/auth.service";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const ResetPasswordForm = ({ redirect }: { redirect?: string }) => {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
      console.log(state)
    }
  }, [state]);

  return (
    <form action={formAction}>
      {redirect && <Input type="hidden" name="redirect" value={redirect} />}
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4">
          {/* New Password */}
          <Field>
            <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <InputFieldError field="newPassword" state={state as any} />
          </Field>

          {/* Confirm Password */}
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <InputFieldError field="confirmPassword" state={state as any} />
          </Field>
        </div>

        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Resetting..." : "Reset Password"}
            </Button>

            <FieldDescription className="px-6 text-center mt-4">
              Remember your password?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
};

export default ResetPasswordForm;

```

- services -> auth -> auth.service.ts

```ts
"use server";
import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { verifyAccessToken } from "@/lib/jwtHanlders";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { resetPasswordSchema } from "@/zod/auth.validation";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getUserInfo } from "./getUserInfo";
import { deleteCookie, getCookie, setCookie } from "./tokenHandlers";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function updateMyProfile(formData: FormData) {
    try {
        // Create a new FormData with the data property
        const uploadFormData = new FormData();

        // Get all form fields except the file
        const data: any = {};
        formData.forEach((value, key) => {
            if (key !== 'file' && value) {
                data[key] = value;
            }
        });

        // Add the data as JSON string
        uploadFormData.append('data', JSON.stringify(data));

        // Add the file if it exists
        const file = formData.get('file');
        if (file && file instanceof File && file.size > 0) {
            uploadFormData.append('file', file);
        }

        const response = await serverFetch.patch(`/user/update-my-profile`, {
            body: uploadFormData,
        });

        const result = await response.json();

        revalidateTag("user-info", { expire: 0 });
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

// Reset Password
export async function resetPassword(_prevState: any, formData: FormData) {

    const redirectTo = formData.get('redirect') || null;

    // Build validation payload
    const validationPayload = {
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate
    const validatedPayload = zodValidator(validationPayload, resetPasswordSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {

        const accessToken = await getCookie("accessToken");

        if (!accessToken) {
            throw new Error("User not authenticated");
        }

        const verifiedToken = jwt.verify(accessToken as string, process.env.JWT_SECRET!) as jwt.JwtPayload;
        console.log(verifiedToken)

        const userRole: UserRole = verifiedToken.role;

        const user = await getUserInfo();
        // API Call
        const response = await serverFetch.post("/auth/reset-password", {
            body: JSON.stringify({
                id: user?.id,
                password: validationPayload.newPassword,
            }),
            headers: {
                "Authorization": accessToken,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Reset password failed");
        }

        if (result.success) {
            // await get
            revalidateTag("user-info", { expire: 0 });
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
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}

export async function getNewAccessToken() {
    try {
        const accessToken = await getCookie("accessToken");
        const refreshToken = await getCookie("refreshToken");

        //Case 1: Both tokens are missing - user is logged out
        if (!accessToken && !refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        // Case 2 : Access Token exist- and need to verify
        if (accessToken) {
            const verifiedToken = await verifyAccessToken(accessToken);

            if (verifiedToken.success) {
                return {
                    tokenRefreshed: false,
                }
            }
        }

        //Case 3 : refresh Token is missing- user is logged out
        if (!refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        //Case 4: Access Token is invalid/expired- try to get a new one using refresh token
        // This is the only case we need to call the API

        // Now we know: accessToken is invalid/missing AND refreshToken exists
        // Safe to call the API
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;

        // API Call - serverFetch will skip getNewAccessToken for /auth/refresh-token endpoint
        const response = await serverFetch.post("/auth/refresh-token", {
            headers: {
                Cookie: `refreshToken=${refreshToken}`,
            },
        });

        const result = await response.json();

        console.log("access token refreshed!!");

        const setCookieHeaders = response.headers.getSetCookie();

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

        await deleteCookie("accessToken");
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await deleteCookie("refreshToken");
        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });

        if (!result.success) {
            throw new Error(result.message || "Token refresh failed");
        }


        return {
            tokenRefreshed: true,
            success: true,
            message: "Token refreshed successfully"
        };


    } catch (error: any) {
        return {
            tokenRefreshed: false,
            success: false,
            message: error?.message || "Something went wrong",
        };
    }

}
```

## 72-4 Adding Needs Password Change Block From Proxy File

- while login check if password needed. If Password needed take to reset password change

- services -> auth -> loginUser.ts 

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { loginValidationZodSchema } from "@/zod/auth.validation";
import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import { setCookie } from "./tokenHandlers";



export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    try {
        const redirectTo = formData.get('redirect') || null;
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;
        const payload = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        if (zodValidator(payload, loginValidationZodSchema).success === false) {
            return zodValidator(payload, loginValidationZodSchema);
        }

        const validatedPayload = zodValidator(payload, loginValidationZodSchema).data;

        const res = await serverFetch.post("/auth/login", {
            body: JSON.stringify(validatedPayload),
            headers: {
                "Content-Type": "application/json",
            }
        });

        const result = await res.json();

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

        if (redirectTo && result.data.needPasswordChange) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(`/reset-password?redirect=${requestedPath}`);
            } else {
                redirect("/reset-password");
            }
        }

        if (result.data.needPasswordChange) {
            redirect("/reset-password");
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
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.log(error);
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : "Login Failed. You might have entered incorrect email or password."}` };
    }
}
```

- lets make a functionality that prevents user from accessing reset password page after one time reset 
- proxy.ts 

```ts 
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';
import { getUserInfo } from './services/auth/getUserInfo';
import { deleteCookie, getCookie } from './services/auth/tokenHandlers';
import { getNewAccessToken } from './services/auth/auth.service';



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const hasTokenRefreshedParam = request.nextUrl.searchParams.has('tokenRefreshed');

    // If coming back after token refresh, remove the param and continue
    if (hasTokenRefreshedParam) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('tokenRefreshed');
        return NextResponse.redirect(url);
    }

    const tokenRefreshResult = await getNewAccessToken();

    // If token was refreshed, redirect to same page to fetch with new token
    if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone();
        url.searchParams.set('tokenRefreshed', 'true');
        return NextResponse.redirect(url);
    }

    // const accessToken = request.cookies.get("accessToken")?.value || null;

    const accessToken = await getCookie("accessToken") || null;

    let userRole: UserRole | null = null;
    if (accessToken) {
        const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            await deleteCookie("accessToken");
            await deleteCookie("refreshToken");
            return NextResponse.redirect(new URL('/login', request.url));
        }

        userRole = verifiedToken.role;
    }

    const routerOwner = getRouteOwner(pathname);
    //path = /doctor/appointments => "DOCTOR"
    //path = /my-profile => "COMMON"
    //path = /login => null

    const isAuth = isAuthRoute(pathname)

    // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
    if (accessToken && isAuth) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
    }


    // Rule 2 : User is trying to access open public route
    if (routerOwner === null) {
        return NextResponse.next();
    }

    // Rule 1 & 2 for open public routes and auth routes

    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 3 : User need password change

    if (accessToken) {
        const userInfo = await getUserInfo();
        if (userInfo.needPasswordChange) {
            if (pathname !== "/reset-password") {
                const resetPasswordUrl = new URL("/reset-password", request.url);
                resetPasswordUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(resetPasswordUrl);
            }
            return NextResponse.next();
        }

        if (userInfo && !userInfo.needPasswordChange && pathname === '/reset-password') {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }
    }

    // Rule 4 : User is trying to access common protected route
    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    // Rule 5 : User is trying to access role based protected route
    if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }
    }

    return NextResponse.next();
}



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

## 72-5 Analysing How Refresh Token Will Work In NextJS


- To Provide a user better experience and to prevent user from unexpect logout while doing a work if the access token expired. we will implement a monitoring system that will; monitor and while routing in page (in proxy file) or button api call(server action server fetch ) if access token it will re revive the logged in state by doing refreshing token using refresh token.

## 72-6 Getting New Access Token With Refresh Token Functionality

- lib -> jwtHandlers.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import jwt from "jsonwebtoken";

export const verifyAccessToken = async (token: string) => {
    try {
        const verifiedAccessToken = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as jwt.JwtPayload;

        return {
            success: true,
            message: "Token is valid",
            payload: verifiedAccessToken,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Invalid token",
        };
    }
};

```

- services -> auth -> auth.service.ts

```ts
"use server";
import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { verifyAccessToken } from "@/lib/jwtHanlders";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { resetPasswordSchema } from "@/zod/auth.validation";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getUserInfo } from "./getUserInfo";
import { deleteCookie, getCookie, setCookie } from "./tokenHandlers";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function updateMyProfile(formData: FormData) {
    try {
        // Create a new FormData with the data property
        const uploadFormData = new FormData();

        // Get all form fields except the file
        const data: any = {};
        formData.forEach((value, key) => {
            if (key !== 'file' && value) {
                data[key] = value;
            }
        });

        // Add the data as JSON string
        uploadFormData.append('data', JSON.stringify(data));

        // Add the file if it exists
        const file = formData.get('file');
        if (file && file instanceof File && file.size > 0) {
            uploadFormData.append('file', file);
        }

        const response = await serverFetch.patch(`/user/update-my-profile`, {
            body: uploadFormData,
        });

        const result = await response.json();

        revalidateTag("user-info", { expire: 0 });
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

// Reset Password
export async function resetPassword(_prevState: any, formData: FormData) {

    const redirectTo = formData.get('redirect') || null;

    // Build validation payload
    const validationPayload = {
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate
    const validatedPayload = zodValidator(validationPayload, resetPasswordSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {

        const accessToken = await getCookie("accessToken");

        if (!accessToken) {
            throw new Error("User not authenticated");
        }

        const verifiedToken = jwt.verify(accessToken as string, process.env.JWT_SECRET!) as jwt.JwtPayload;
        console.log(verifiedToken)

        const userRole: UserRole = verifiedToken.role;

        const user = await getUserInfo();
        // API Call
        const response = await serverFetch.post("/auth/reset-password", {
            body: JSON.stringify({
                id: user?.id,
                password: validationPayload.newPassword,
            }),
            headers: {
                "Authorization": accessToken,
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Reset password failed");
        }

        if (result.success) {
            // await get
            revalidateTag("user-info", { expire: 0 });
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
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}

export async function getNewAccessToken() {
    try {
        const accessToken = await getCookie("accessToken");
        const refreshToken = await getCookie("refreshToken");

        //Case 1: Both tokens are missing - user is logged out
        if (!accessToken && !refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        // Case 2 : Access Token exist- and need to verify
        if (accessToken) {
            const verifiedToken = await verifyAccessToken(accessToken);

            if (verifiedToken.success) {
                return {
                    tokenRefreshed: false,
                }
            }
        }

        //Case 3 : refresh Token is missing- user is logged out
        if (!refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        //Case 4: Access Token is invalid/expired- try to get a new one using refresh token
        // This is the only case we need to call the API

        // Now we know: accessToken is invalid/missing AND refreshToken exists
        // Safe to call the API
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;

        // API Call - serverFetch will skip getNewAccessToken for /auth/refresh-token endpoint
        const response = await serverFetch.post("/auth/refresh-token", {
            headers: {
                Cookie: `refreshToken=${refreshToken}`,
            },
        });

        const result = await response.json();

        console.log("access token refreshed!!");

        const setCookieHeaders = response.headers.getSetCookie();

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

        await deleteCookie("accessToken");
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await deleteCookie("refreshToken");
        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });

        if (!result.success) {
            throw new Error(result.message || "Token refresh failed");
        }


        return {
            tokenRefreshed: true,
            success: true,
            message: "Token refreshed successfully"
        };


    } catch (error: any) {
        return {
            tokenRefreshed: false,
            success: false,
            message: error?.message || "Something went wrong",
        };
    }

}
```

- lib -> jwtHandlers.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import jwt from "jsonwebtoken";

export const verifyAccessToken = async (token: string) => {
    try {
        const verifiedAccessToken = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as jwt.JwtPayload;

        return {
            success: true,
            message: "Token is valid",
            payload: verifiedAccessToken,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Invalid token",
        };
    }
};

```

- proxy.ts

```ts
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';
import { getUserInfo } from './services/auth/getUserInfo';
import { deleteCookie, getCookie } from './services/auth/tokenHandlers';
import { getNewAccessToken } from './services/auth/auth.service';



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const hasTokenRefreshedParam = request.nextUrl.searchParams.has('tokenRefreshed');

    // If coming back after token refresh, remove the param and continue
    if (hasTokenRefreshedParam) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('tokenRefreshed');
        return NextResponse.redirect(url);
    }

    const tokenRefreshResult = await getNewAccessToken();

    // If token was refreshed, redirect to same page to fetch with new token
    if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone(); // as we are in server action we can not directly redirect we have to clone and then redirect 
        url.searchParams.set('tokenRefreshed', 'true');
        return NextResponse.redirect(url);
    }

    // const accessToken = request.cookies.get("accessToken")?.value || null;

    const accessToken = await getCookie("accessToken") || null;

    let userRole: UserRole | null = null;
    if (accessToken) {
        const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            await deleteCookie("accessToken");
            await deleteCookie("refreshToken");
            return NextResponse.redirect(new URL('/login', request.url));
        }

        userRole = verifiedToken.role;
    }

    const routerOwner = getRouteOwner(pathname);
    //path = /doctor/appointments => "DOCTOR"
    //path = /my-profile => "COMMON"
    //path = /login => null

    const isAuth = isAuthRoute(pathname)

    // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
    if (accessToken && isAuth) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
    }


    // Rule 2 : User is trying to access open public route
    if (routerOwner === null) {
        return NextResponse.next();
    }

    // Rule 1 & 2 for open public routes and auth routes

    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 3 : User need password change

    if (accessToken) {
        const userInfo = await getUserInfo();
        if (userInfo.needPasswordChange) {
            if (pathname !== "/reset-password") {
                const resetPasswordUrl = new URL("/reset-password", request.url);
                resetPasswordUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(resetPasswordUrl);
            }
            return NextResponse.next();
        }

        if (userInfo && !userInfo.needPasswordChange && pathname === '/reset-password') {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }
    }

    // Rule 4 : User is trying to access common protected route
    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    // Rule 5 : User is trying to access role based protected route
    if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }
    }

    return NextResponse.next();
}



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

## 72-7 Implementing Refresh Token In Server Fetch Function

- for checking access token in server fetch 

```ts
import { getNewAccessToken } from "@/services/auth/auth.service";
import { getCookie } from "@/services/auth/tokenHandlers";


const BACKEND_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

// /auth/login
const serverFetchHelper = async (endpoint: string, options: RequestInit): Promise<Response> => {
    const { headers, ...restOptions } = options;
    const accessToken = await getCookie("accessToken");

    //to stop recursion loop
    if (endpoint !== "/auth/refresh-token") {
        await getNewAccessToken();
    }

    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        headers: {
            Cookie: accessToken ? `accessToken=${accessToken}` : "",
            ...headers,
            // ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
            // ...(accessToken ? { "Authorization": accessToken } : {}),

        },
        ...restOptions,
    })

    return response;
}

export const serverFetch = {
    get: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "GET" }),

    post: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "POST" }),

    put: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PUT" }),

    patch: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PATCH" }),

    delete: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "DELETE" }),

}

/**
 * 
 * serverFetch.get("/auth/me")
 * serverFetch.post("/auth/login", { body: JSON.stringify({}) })
 */
```


## 72-8 Creating Server Actions And Components For Doctors Schedule

- services -> doctor -> doctorSchedule.services.ts

```ts
"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";

export async function getDoctorOwnSchedules(queryString?: string) {
    try {
        // const response = await serverFetch.get(`/doctor-schedule/my-schedule${queryString ? `?${queryString}` : ""}`);
        const response = await serverFetch.get(`/doctor-schedule${queryString ? `?${queryString}` : ""}`);
        const result = await response.json();
        return {
            success: result.success,
            data: Array.isArray(result.data) ? result.data : [],
            meta: result.meta,
        };
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            data: [],
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

export async function getAvailableSchedules() {
    try {
        const response = await serverFetch.get(`/schedule`);
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

export async function createDoctorSchedule(scheduleIds: string[]) {
    try {
        const response = await serverFetch.post(`/doctor-schedule`, {
            body: JSON.stringify({ scheduleIds }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

export async function deleteDoctorOwnSchedule(scheduleId: string) {
    try {
        const response = await serverFetch.delete(`/doctor-schedule/${scheduleId}`);
        const result = await response.json();

        return {
            success: result.success,
            message: result.message || "Schedule removed successfully",
        };
    } catch (error: any) {
        console.error("Delete schedule error:", error);
        return {
            success: false,
            message: error.message || "Failed to remove schedule",
        };
    }
}
```

- components -> doctor -> BookScheduleDialog.tsx

```tsx 
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  createDoctorSchedule,
  getAvailableSchedules,
} from "@/services/doctor/doctorScedule.services";
import { ISchedule } from "@/types/schedule.interface";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BookScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableSchedules: ISchedule[];
}

export default function BookScheduleDialog({
  open,
  onClose,
  onSuccess,
  availableSchedules: initialAvailableSchedules = [],
}: BookScheduleDialogProps) {
  const [availableSchedules, setAvailableSchedules] = useState<ISchedule[]>(
    initialAvailableSchedules
  );
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadAvailableSchedules();
    } else {
      setSelectedSchedules([]);
    }
  }, [open]);

  const loadAvailableSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const response = await getAvailableSchedules();
      console.log("response:", response);
      setAvailableSchedules(response?.data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load available schedules");
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSelectedSchedules((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleSubmit = async () => {
    if (selectedSchedules.length === 0) {
      toast.error("Please select at least one schedule");
      return;
    }

    try {
      setIsLoading(true);
      await createDoctorSchedule(selectedSchedules);
      toast.success(
        `Successfully booked ${selectedSchedules.length} schedule${
          selectedSchedules.length > 1 ? "s" : ""
        }`
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      onClose();
    } catch (error) {
      console.error("Error booking schedules:", error);
      toast.error("Failed to book schedules");
    } finally {
      setIsLoading(false);
    }
  };

  const groupSchedulesByDate = () => {
    const grouped: Record<string, ISchedule[]> = {};

    if (availableSchedules.length > 0) {
      availableSchedules.forEach((schedule) => {
        const date = format(new Date(schedule.startDateTime), "yyyy-MM-dd");
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(schedule);
      });
    }

    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  };

  const groupedSchedules = groupSchedulesByDate();

  console.log({ availableSchedules, groupedSchedules });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Schedules</DialogTitle>
          <DialogDescription>
            Select time slots from available schedules to add to your calendar
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingSchedules ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading schedules...</p>
            </div>
          ) : availableSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No available schedules found
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedSchedules.map(([date, daySchedules]) => (
                <div key={date}>
                  <h3 className="font-medium mb-3">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleToggleSchedule(schedule.id)}
                      >
                        <Checkbox
                          id={schedule.id}
                          checked={selectedSchedules.includes(schedule.id)}
                          onCheckedChange={() =>
                            handleToggleSchedule(schedule.id)
                          }
                        />
                        <Label
                          htmlFor={schedule.id}
                          className="flex-1 cursor-pointer"
                        >
                          {format(new Date(schedule.startDateTime), "h:mm a")} -{" "}
                          {format(new Date(schedule.endDateTime), "h:mm a")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedSchedules.length} schedule
              {selectedSchedules.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedSchedules.length === 0 || isLoading}
              >
                {isLoading ? "Booking..." : "Book Schedules"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

- components -> doctor -> myScheduleColumns.tsx

```tsx
"use client";

import { Column } from "@/components/shared/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { IDoctorSchedule } from "@/types/schedule.interface";
import { format, isBefore, startOfDay } from "date-fns";

const isPastSchedule = (schedule: IDoctorSchedule) => {
  return isBefore(
    new Date(schedule.schedule?.startDateTime || ""),
    startOfDay(new Date())
  );
};

export const myScheduleColumns: Column<IDoctorSchedule>[] = [
  {
    header: "Date",
    accessor: (schedule) => (
      <span className="font-medium">
        {schedule.schedule?.startDateTime &&
          format(new Date(schedule.schedule.startDateTime), "MMM d, yyyy")}
      </span>
    ),
    sortKey: "schedule.startDateTime",
  },
  {
    header: "Time Slot",
    accessor: (schedule) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {schedule.schedule?.startDateTime &&
            format(new Date(schedule.schedule.startDateTime), "h:mm a")}{" "}
          -{" "}
          {schedule.schedule?.endDateTime &&
            format(new Date(schedule.schedule.endDateTime), "h:mm a")}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    accessor: (schedule) => {
      const isPast = isPastSchedule(schedule);
      return isPast ? (
        <Badge variant="secondary">Past</Badge>
      ) : (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Upcoming
        </Badge>
      );
    },
  },
  {
    header: "Booking Status",
    accessor: (schedule) =>
      schedule.isBooked ? (
        <Badge variant="default" className="bg-blue-600">
          Booked
        </Badge>
      ) : (
        <Badge variant="outline">Available</Badge>
      ),
  },
];

```
- components -> doctor -> MyScheduleFilters.tsx

```tsx
"use client";

import ClearFiltersButton from "@/components/shared/ClearFiltersButton";
import RefreshButton from "@/components/shared/RefreshButton";
import SelectFilter from "@/components/shared/SelectFilter";

const MySchedulesFilters = () => {
  return (
    <div className="space-y-3">
      {/* Row 1: Refresh Button */}
      <div className="flex items-center gap-3">
        <RefreshButton />
      </div>

      {/* Row 2: Filter Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Booking Status Filter */}
        <SelectFilter
          paramName="isBooked"
          placeholder="Booking Status"
          defaultValue="All Schedules"
          options={[
            { label: "Available", value: "false" },
            { label: "Booked", value: "true" },
          ]}
        />

        {/* Clear All Filters */}
        <ClearFiltersButton />
      </div>
    </div>
  );
};

export default MySchedulesFilters;

```
- components -> doctor -> MyScheduleHeader.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ManagementPageHeader from "@/components/shared/ManagementPageHeader";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import BookScheduleDialog from "./BookScheduleDialog";

interface MySchedulesHeaderProps {
  availableSchedules: any[];
}

const MySchedulesHeader = ({ availableSchedules }: MySchedulesHeaderProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <BookScheduleDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        availableSchedules={availableSchedules}
      />

      <ManagementPageHeader
        title="My Schedules"
        description="Manage your availability and time slots for patient consultations"
        action={{
          label: "Book Schedule",
          icon: Plus,
          onClick: handleOpenDialog,
        }}
      />
    </>
  );
};

export default MySchedulesHeader;

```
- components -> doctor -> MyScheduleTable.tsx

```tsx
"use client";

import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import ManagementTable from "@/components/shared/ManagementTable";
import { deleteDoctorOwnSchedule } from "@/services/doctor/doctorScedule.services";
import { IDoctorSchedule } from "@/types/schedule.interface";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { myScheduleColumns } from "./myScheduleColumns";

interface MySchedulesTableProps {
  schedules: IDoctorSchedule[];
}

export default function MySchedulesTable({
  schedules = [],
}: MySchedulesTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingSchedule, setDeletingSchedule] =
    useState<IDoctorSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = (schedule: IDoctorSchedule) => {
    // Only allow deletion of unbooked schedules
    if (!schedule.isBooked) {
      setDeletingSchedule(schedule);
    } else {
      toast.error("Cannot delete booked schedule");
    }
  };

  const confirmDelete = async () => {
    if (!deletingSchedule) return;

    setIsDeleting(true);
    const result = await deleteDoctorOwnSchedule(deletingSchedule.scheduleId);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message || "Schedule deleted successfully");
      setDeletingSchedule(null);
      handleRefresh();
    } else {
      toast.error(result.message || "Failed to delete schedule");
    }
  };

  return (
    <>
      <ManagementTable
        data={schedules}
        columns={myScheduleColumns}
        onDelete={handleDelete}
        getRowKey={(schedule) => schedule.scheduleId}
        emptyMessage="No schedules found. Try adjusting your filters or book new schedules."
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingSchedule}
        onOpenChange={(open) => !open && setDeletingSchedule(null)}
        onConfirm={confirmDelete}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule slot? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
}

```


## 72-9 Completing Doctor Schedule Page For Doctor Role

- app ->(dashboardLayout) doctor -> my-schedules -> page.tsx

```tsx
import MySchedulesFilters from "@/components/modules/Doctor/MyScheduleFilters";
import MySchedulesHeader from "@/components/modules/Doctor/MyScheduleHeader";
import MySchedulesTable from "@/components/modules/Doctor/MyScheduleTable";
import TablePagination from "@/components/shared/TablePagination";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { queryStringFormatter } from "@/lib/formatters";
import {
  getAvailableSchedules,
  getDoctorOwnSchedules,
} from "@/services/doctor/doctorScedule.services";
import { Suspense } from "react";

interface DoctorMySchedulesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    isBooked?: string;
  }>;
}

const DoctorMySchedulesPage = async ({
  searchParams,
}: DoctorMySchedulesPageProps) => {
  const params = await searchParams;

  const queryString = queryStringFormatter(params);
  const myDoctorsScheduleResponse = await getDoctorOwnSchedules(queryString);
  const availableSchedulesResponse = await getAvailableSchedules();

  console.log({
    myDoctorsScheduleResponse,
    availableSchedulesResponse,
  });

  const schedules = myDoctorsScheduleResponse?.data || [];
  const meta = myDoctorsScheduleResponse?.meta;
  const totalPages = Math.ceil((meta?.total || 1) / (meta?.limit || 1));

  return (
    <div className="space-y-6">
      <MySchedulesHeader
        availableSchedules={availableSchedulesResponse?.data || []}
      />

      <MySchedulesFilters />

      <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
        <MySchedulesTable schedules={schedules} />
        <TablePagination
          currentPage={meta?.page || 1}
          totalPages={totalPages || 1}
        />
      </Suspense>
    </div>
  );
};

export default DoctorMySchedulesPage;

```

## 72-10 Creating Components For Consultation Page And AI Suggestion

- (commonLayout) -> consultation -> page.tsx 

```tsx 
import AIDoctorSuggestion from "@/components/modules/Consultation/AIDoctorSuggestion";
import DoctorGrid from "@/components/modules/Consultation/DoctorGrid";
import DoctorSearchFilters from "@/components/modules/Consultation/DoctorSearchFilter";
import TablePagination from "@/components/shared/TablePagination";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { queryStringFormatter } from "@/lib/formatters";
import { getDoctors } from "@/services/admin/doctorManagement";
import { getSpecialities } from "@/services/admin/specialitiesManagement";
import { Suspense } from "react";

// ISR: Revalidate every 10 minutes for doctor listings
export const revalidate = 600;

const ConsultationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);

  // Fetch doctors and specialties in parallel
  const [doctorsResponse, specialtiesResponse] = await Promise.all([
    getDoctors(queryString),
    getSpecialities(),
  ]);

  const doctors = doctorsResponse?.data || [];
  const specialties = specialtiesResponse?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
          <p className="text-muted-foreground mt-2">
            Search and book appointments with our qualified healthcare
            professionals
          </p>
        </div>

        {/* AI Doctor Suggestion */}
        <AIDoctorSuggestion />

        {/* Filters */}
        <DoctorSearchFilters specialties={specialties} />

        {/* Doctor Grid */}
        <Suspense fallback={<TableSkeleton columns={3} />}>
          <DoctorGrid doctors={doctors} />
        </Suspense>

        {/* Pagination */}
        <TablePagination
          currentPage={doctorsResponse?.meta?.page || 1}
          totalPages={doctorsResponse?.meta?.totalPage || 1}
        />
      </div>
    </div>
  );
};

export default ConsultationPage;

```

- src\components\modules\Consultation\BookAppointmentDialog.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IDoctor } from "@/types/doctor.interface";
import { IDoctorSchedule } from "@/types/schedule.interface";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";

interface BookAppointmentDialogProps {
  doctor: IDoctor;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookAppointmentDialog({
  doctor,
  isOpen,
  onClose,
}: BookAppointmentDialogProps) {
  const doctorSchedules = doctor.doctorSchedules || [];
  const [selectedSchedule, setSelectedSchedule] =
    useState<IDoctorSchedule | null>(null);

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    onClose();
  };

  const groupSchedulesByDate = () => {
    const grouped: Record<string, IDoctorSchedule[]> = {};

    doctorSchedules.forEach((schedule) => {
      if (!schedule.schedule?.startDateTime) return;

      const startDate = new Date(schedule.schedule.startDateTime)
        .toISOString()
        .split("T")[0];

      if (startDate) {
        if (!grouped[startDate]) {
          grouped[startDate] = [];
        }
        grouped[startDate].push(schedule);
      }
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const groupedSchedules = groupSchedulesByDate();

  // Check if we have schedules but no schedule data (API issue)
  const hasSchedulesWithoutData =
    doctorSchedules.length > 0 && groupedSchedules.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <>
          <DialogHeader>
            <DialogTitle>Book Appointment with Dr. {doctor.name}</DialogTitle>
            <DialogDescription>
              Select an available time slot for your consultation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Doctor Info */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{doctor.designation}</p>
                <p className="text-sm text-muted-foreground">
                  Consultation Fee: ${doctor.appointmentFee}
                </p>
              </div>
            </div>

            {/* Schedules */}
            {hasSchedulesWithoutData ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Schedule data not available
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The doctor has {doctorSchedules.length} schedule
                  {doctorSchedules.length !== 1 ? "s" : ""}, but detailed
                  information is not loaded.
                </p>
              </div>
            ) : groupedSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No available slots at the moment
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check back later
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {groupedSchedules.map(([date, dateSchedules]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {dateSchedules.map((schedule) => {
                          const startTime = schedule.schedule?.startDateTime
                            ? new Date(schedule.schedule.startDateTime)
                            : null;

                          return (
                            <Button
                              key={schedule.scheduleId}
                              variant={
                                selectedSchedule?.scheduleId ===
                                schedule.scheduleId
                                  ? "default"
                                  : "outline"
                              }
                              className="justify-start h-auto py-2"
                              onClick={() => setSelectedSchedule(schedule)}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                {startTime
                                  ? format(startTime, "h:mm a")
                                  : "N/A"}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  );
}

```
- src\components\modules\Consultation\DoctorCard.tsx

```tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInitials } from "@/lib/formatters";
import { IDoctor } from "@/types/doctor.interface";
import { Clock, DollarSign, Eye, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookAppointmentDialog from "./BookAppointmentDialog";

interface DoctorCard {
  doctor: IDoctor;
}

export default function DoctorCard({ doctor }: DoctorCard) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profilePhoto || ""} alt={doctor.name} />
              <AvatarFallback className="text-lg">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                Dr. {doctor.name}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {doctor.designation}
              </CardDescription>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {doctor.averageRating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                {doctor.doctorSpecialties &&
                  doctor.doctorSpecialties.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {doctor.doctorSpecialties[0].specialties?.title}
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{doctor.experience} years exp</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-foreground">
                ${doctor.appointmentFee}
              </span>
            </div>
          </div>

          {doctor.currentWorkingPlace && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{doctor.currentWorkingPlace}</span>
            </div>
          )}

          <div className="text-sm">
            <p className="font-medium mb-1">Qualification:</p>
            <p className="text-muted-foreground line-clamp-2">
              {doctor.qualification}
            </p>
          </div>

          {doctor.doctorSpecialties && doctor.doctorSpecialties.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {doctor.doctorSpecialties.slice(1, 3).map((specialty) => (
                <Badge
                  key={specialty.specialitiesId}
                  variant="outline"
                  className="text-xs"
                >
                  {specialty.specialties?.title}
                </Badge>
              ))}
              {doctor.doctorSpecialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{doctor.doctorSpecialties.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t flex gap-2">
          <Link className="flex-1" href={`/consultation/doctor/${doctor.id}`}>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          <Button onClick={() => setShowScheduleModal(true)} className="flex-1">
            Book Appointment
          </Button>
        </CardFooter>
      </Card>

      <BookAppointmentDialog
        doctor={doctor}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </>
  );
}

```
- src\components\modules\Consultation\DoctorGrid.tsx

```tsx
import { IDoctor } from "@/types/doctor.interface";
import DoctorCard from "./DoctorCard";

interface DoctorGridProps {
  doctors: IDoctor[];
}

export default function DoctorGrid({ doctors }: DoctorGridProps) {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No doctors found matching your criteria.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}

```
- src\components\modules\Consultation\DoctorSearchFilter.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface DoctorSearchFiltersProps {
  specialties: Array<{ id: string; title: string }>;
}

export default function DoctorSearchFilters({
  specialties,
}: DoctorSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state once from URL, but don't re-sync on every searchParams change
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        new URLSearchParams(window.location.search).get("searchTerm") || ""
      );
    }
    return "";
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);

      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      params.delete("page");

      router.push(`/consultation?${params.toString()}`);
    },
    [router]
  );

  // Trigger search when debounced value changes
  useEffect(() => {
    const urlSearchTerm =
      new URLSearchParams(window.location.search).get("searchTerm") || "";
    if (debouncedSearch !== urlSearchTerm) {
      updateFilters("searchTerm", debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleClearFilters = () => {
    setSearchTerm("");
    router.push("/consultation");
  };

  const hasActiveFilters =
    searchParams.get("searchTerm") || searchParams.get("specialties");

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Specialty Filter */}
        <Select
          value={searchParams.get("specialties") || "all"}
          onValueChange={(value) => updateFilters("specialties", value)}
        >
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty.id} value={specialty.title}>
                {specialty.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender Filter */}
        <Select
          value={searchParams.get("gender") || "all"}
          onValueChange={(value) => updateFilters("gender", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full md:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

```

- src\components\modules\Consultation\AIDoctorSuggestion.tsx

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AIDoctorSuggestion() {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleGetSuggestion = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      toast.error("Please describe your symptoms (at least 5 characters)");
      return;
    }

    setIsLoading(true);
    setSuggestion("");
    setShowSuggestion(false);

    try {
      //   const response = await getDoctorSuggestion(symptoms);
      //   if (response.success) {
      //     setSuggestion(response.data || "No suggestion available");
      //     setShowSuggestion(true);
      //   } else {
      //     toast.error(response.message || "Failed to get AI suggestion");
      //   }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast.error("Failed to get AI suggestion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-linear-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-900">
            AI Doctor Suggestion
          </CardTitle>
        </div>
        <CardDescription>
          Describe your symptoms and get AI-powered doctor specialty
          recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe your symptoms in detail (e.g., headache, fever, cough, etc.)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="resize-none bg-white"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {symptoms.length} characters
          </p>
        </div>

        <Button
          onClick={handleGetSuggestion}
          disabled={isLoading || symptoms.trim().length < 5}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting AI Suggestion...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Recommendation
            </>
          )}
        </Button>

        {showSuggestion && suggestion && (
          <div className="space-y-3 p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700"
              >
                AI Recommendation
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {suggestion}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

```

## 72-11 Completing Doctors Detail Page