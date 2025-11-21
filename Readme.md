## PH-HEALTHCARE-FRONTEND-PART-5

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-6

Task: 

https://github.com/Apollo-Level2-Web-Dev/ph-health-care/blob/new-part-6/ADMIN_DASHBOARD_TASK.md

## 70-1 Creating Forms and Dialog (Modal) For Specialities Management Table

- isntall dialog and alert dialog from shadcn ui 

```
npx shadcn@latest add dialog
```

```
npx shadcn@latest add alert-dialog
```

- components -> modules -> Admin -> SpecialitiesManagement -> SpecialitiesFormDialog.tsx

```tsx 
"use client"
import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSpeciality } from "@/services/admin/SpecialitiesManagement";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

/*
  SpecialitiesFormDialog
  - Purpose: Modal dialog containing a form used to create a new medical specialty.
  - Behavior summary:
    * Uses `useActionState` with `createSpeciality` to get a form action, current request state, and a pending flag.
    * Submits via the `action` attribute on the form (server/action-style or framework-provided helper).
    * Displays success/error toast messages based on the returned `state` and closes the dialog on success.
    * Shows inline field errors using `InputFieldError` which reads validation errors from `state`.

  Notes about integration:
  - `createSpeciality` should be an async function (server action) that returns an object with at least
    `{ success: boolean, message?: string, errors?: Record<string, string> }` so `InputFieldError` can render errors.
  - `useActionState` is a local helper hook (imported from project utilities or a library) that wires a form
    `action` prop to the provided function and exposes the remote state and pending flag.
*/

interface ISpecialityFormDialogProps {
    // `open` controls whether the dialog is visible.
    open: boolean;
    // `onClose` is called when the dialog should be closed (e.g., Cancel button or overlay click).
    onClose: () => void;
    // `onSuccess` is a callback for parent components to refresh lists or take action after a successful create.
    onSuccess: () => void;
}

const SpecialitiesFormDialog = ({ open, onClose, onSuccess }: ISpecialityFormDialogProps) => {
    /*
      useActionState:
      - `state`: the response object returned by `createSpeciality` (or null while idle).
      - `formAction`: the value to pass to the form `action` attribute. This wires the form submission to the
        `createSpeciality` handler so the framework can post the form data to it.
      - `pending`: boolean that is true while a submission is in-flight. Used to disable controls.
    */
    const [state, formAction, pending] = useActionState(createSpeciality, null);

    /*
      Side-effect: react to server response state changes.
      - On success: show toast, call parent `onSuccess` (to refresh list), and close dialog.
      - On failure: show an error toast. Field-level errors are displayed inline by `InputFieldError`.
    */
    useEffect(() => {
        if (state && state?.success) {
            // Inform the user that the create succeeded and notify parent to update UI.
            toast.success(state.message);
            onSuccess();
            onClose();
        } else if (state && !state.success) {
            // Show a global error message when available. Detailed field errors will still appear inline.
            toast.error(state.message);
        }
    }, [state, onSuccess, onClose]);

    return (
        // `Dialog` is a composed UI primitive that handles overlay, focus trap and visibility.
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    {/* Title of the dialog; keep copy short and action-oriented. */}
                    <DialogTitle>Add New Specialty</DialogTitle>
                </DialogHeader>

                {/*
                  The form uses `action={formAction}` so submissions are handled by the provided server/client action.
                  `className="space-y-4"` is a Tailwind utility to space form rows vertically.
                */}
                <form action={formAction} className="space-y-4">
                    {/*
                      Title field
                      - `name` is required so the server action receives the value in `formData.get('title')`.
                      - `required` provides basic client-side validation before submit.
                    */}
                    <Field>
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input id="title" name="title" placeholder="Cardiology" required />
                        {/* Renders validation error for the `title` field when `state.errors` contains it. */}
                        <InputFieldError field="title" state={state} />
                    </Field>

                    {/*
                      File upload for the icon/image representing the specialty.
                      - `accept="image/*"` restricts to images. The server action should read the file from form data.
                      - If the backend expects a specific field name (e.g., `icon`) update `name` accordingly.
                    */}
                    <Field>
                        <FieldLabel htmlFor="file">Upload Icon</FieldLabel>
                        <Input id="file" name="file" type="file" accept="image/*" />
                        <InputFieldError field="file" state={state} />
                    </Field>

                    {/* Buttons row: Cancel (client-only) and Submit (form post). */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            // disable cancel while a submission is in flight to avoid race conditions.
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {/* Provide immediate feedback while saving. */}
                            {pending ? "Saving..." : "Save Specialty"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SpecialitiesFormDialog;
```

- components -> modules -> shared -> DeleteConfirmationDialog.tsx 

```tsx 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";

/*
  DeleteConfirmationDialog

  Purpose:
  - A reusable confirmation dialog for destructive actions (delete/remove).
  - Built from the project's `AlertDialog` primitives which handle overlay,
    focus management, keyboard accessibility (Esc), and animations.

  Key behaviors:
  - `open` controls visibility of the dialog.
  - `onOpenChange` is invoked when the dialog requests to change its open state
    (e.g., user clicks overlay, presses Escape, or the dialog programmatically closes).
  - `onConfirm` is the action executed when the user confirms the deletion.
  - `isDeleting` disables UI controls and updates button text while an async
    deletion operation is in progress, preventing duplicate submissions.

  Integration notes:
  - The parent component should manage the `open` state and provide `onOpenChange`.
  - `onConfirm` should typically handle the delete request and update parent
    state (e.g., refetch list or remove item locally). Provide `isDeleting` to
    reflect pending network state for UX feedback.
  - `title`, `description`, and `itemName` are optional. When `description`
    is omitted, a sensible default message is shown using `itemName`.

  Accessibility:
  - Because this composes `AlertDialog` primitives, it inherits ARIA roles and
    keyboard handling. Keep the title and description concise to help screen reader users.
*/

interface DeleteConfirmDialogProps {
    // Controls whether the dialog is visible.
    open: boolean;
    // Called when the dialog requests an open/close change (overlay click, ESC, etc.).
    onOpenChange: (open: boolean) => void;
    // Callback to execute the deletion action when the user confirms.
    onConfirm: () => void;
    // Optional: dialog title shown at the top. Keep terse (e.g., "Delete specialty").
    title?: string;
    // Optional: full description. If omitted, component will render a default message using `itemName`.
    description?: string;
    // Optional: name of the item being deleted, used in the default description.
    itemName?: string;
    // Optional: when true, disables buttons and shows a loading label on the confirm button.
    isDeleting?: boolean;
}

const DeleteConfirmationDialog = ({
    open,
    onOpenChange,
    onConfirm,
    title = "Confirm Deletion",
    description,
    itemName,
    isDeleting = false,
}: DeleteConfirmDialogProps) => {
    /*
      Component structure:
      - `AlertDialog` is the root that accepts `open` and `onOpenChange`.
      - `AlertDialogContent` contains header, description and footer actions.
      - `AlertDialogHeader` groups `AlertDialogTitle` and `AlertDialogDescription`.
      - `AlertDialogFooter` contains the cancel and confirm actions.
  
      The `AlertDialogCancel` and `AlertDialogAction` components map to the
      secondary and primary actions respectively and integrate with the dialog
      primitives to close the dialog when appropriate.
    */
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    {/* The visible title — should clearly state the intent of the dialog. */}
                    <AlertDialogTitle>{title}</AlertDialogTitle>

                    {/*
            Description text — either use an explicit `description` prop or render
            a sensible default that interpolates `itemName` (if provided).
            Use short sentences so screen readers convey the risk clearly.
          */}
                    <AlertDialogDescription>
                        {description || (
                            <>
                                This will delete <strong>{itemName}</strong>. This action cannot
                                be undone.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    {/*
            Cancel button: a non-destructive action that simply closes the dialog.
            Disabled while `isDeleting` to prevent toggling during an in-flight request.
          */}
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

                    {/*
            Confirm/Delete action:
            - Calls `onConfirm` when clicked.
            - Disabled while `isDeleting` to avoid duplicate submissions.
            - Uses utility classes for destructive styling from the design system.
          */}
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteConfirmationDialog;
```


## 70-2 Creating Page Header For Specialities Management Table

- src -> components -> shared -> ManagementPageHeader.tsx 

```tsx 
"use client"
import { LucideIcon, Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface ManagementHeaderProps {
    title: string,
    description?: string
    children?: React.ReactNode // for modal opening button 

    // purpose of this is to make the ui future proof if any other action is needed in future
    action?: {
        label: string,
        icon?: LucideIcon,
        onClick: () => void,
    }
}



const ManagementPageHeader = ({ title, description, children, action }: ManagementHeaderProps) => {
    const Icon = action?.icon || Plus;
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
            {action && (
                <Button onClick={action.onClick} >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                </Button>
            )}

            {children}

        </div>
    );
};

export default ManagementPageHeader;
```

src -> components -> modules -> Admin -> SpecialitiesManagement -> SpecialitiesFormDialog.tsx

```tsx 
"use client"
import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSpeciality } from "@/services/admin/SpecialitiesManagement";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

/*
  SpecialitiesFormDialog
  - Purpose: Modal dialog containing a form used to create a new medical specialty.
  - Behavior summary:
    * Uses `useActionState` with `createSpeciality` to get a form action, current request state, and a pending flag.
    * Submits via the `action` attribute on the form (server/action-style or framework-provided helper).
    * Displays success/error toast messages based on the returned `state` and closes the dialog on success.
    * Shows inline field errors using `InputFieldError` which reads validation errors from `state`.

  Notes about integration:
  - `createSpeciality` should be an async function (server action) that returns an object with at least
    `{ success: boolean, message?: string, errors?: Record<string, string> }` so `InputFieldError` can render errors.
  - `useActionState` is a local helper hook (imported from project utilities or a library) that wires a form
    `action` prop to the provided function and exposes the remote state and pending flag.
*/

interface ISpecialityFormDialogProps {
    // `open` controls whether the dialog is visible.
    open: boolean;
    // `onClose` is called when the dialog should be closed (e.g., Cancel button or overlay click).
    onClose: () => void;
    // `onSuccess` is a callback for parent components to refresh lists or take action after a successful create.
    onSuccess: () => void;
}

const SpecialitiesFormDialog = ({ open, onClose, onSuccess }: ISpecialityFormDialogProps) => {
    /*
      useActionState:
      - `state`: the response object returned by `createSpeciality` (or null while idle).
      - `formAction`: the value to pass to the form `action` attribute. This wires the form submission to the
        `createSpeciality` handler so the framework can post the form data to it.
      - `pending`: boolean that is true while a submission is in-flight. Used to disable controls.
    */
    const [state, formAction, pending] = useActionState(createSpeciality, null);

    /*
      Side-effect: react to server response state changes.
      - On success: show toast, call parent `onSuccess` (to refresh list), and close dialog.
      - On failure: show an error toast. Field-level errors are displayed inline by `InputFieldError`.
    */
    useEffect(() => {
        if (state && state?.success) {
            // Inform the user that the create succeeded and notify parent to update UI.
            toast.success(state.message);
            onSuccess();
            onClose();
        } else if (state && !state.success) {
            // Show a global error message when available. Detailed field errors will still appear inline.
            toast.error(state.message);
        }
    }, [state, onSuccess, onClose]);

    return (
        // `Dialog` is a composed UI primitive that handles overlay, focus trap and visibility.
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    {/* Title of the dialog; keep copy short and action-oriented. */}
                    <DialogTitle>Add New Specialty</DialogTitle>
                </DialogHeader>

                {/*
                  The form uses `action={formAction}` so submissions are handled by the provided server/client action.
                  `className="space-y-4"` is a Tailwind utility to space form rows vertically.
                */}
                <form action={formAction} className="space-y-4">
                    {/*
                      Title field
                      - `name` is required so the server action receives the value in `formData.get('title')`.
                      - `required` provides basic client-side validation before submit.
                    */}
                    <Field>
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input id="title" name="title" placeholder="Cardiology" required />
                        {/* Renders validation error for the `title` field when `state.errors` contains it. */}
                        <InputFieldError field="title" state={state} />
                    </Field>

                    {/*
                      File upload for the icon/image representing the specialty.
                      - `accept="image/*"` restricts to images. The server action should read the file from form data.
                      - If the backend expects a specific field name (e.g., `icon`) update `name` accordingly.
                    */}
                    <Field>
                        <FieldLabel htmlFor="file">Upload Icon</FieldLabel>
                        <Input id="file" name="file" type="file" accept="image/*" />
                        <InputFieldError field="file" state={state} />
                    </Field>

                    {/* Buttons row: Cancel (client-only) and Submit (form post). */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            // disable cancel while a submission is in flight to avoid race conditions.
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {/* Provide immediate feedback while saving. */}
                            {pending ? "Saving..." : "Save Specialty"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SpecialitiesFormDialog;
```

- src -> components -> modules -> Admin -> SpecialitiesManagement -> SpecialitiesManagementHeader.tsx

```tsx 
"use client";

import ManagementPageHeader from "@/components/shared/ManagementPageHeader";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SpecialitiesFormDialog from "./SpecialitiesFormDialog";

const SpecialitiesManagementHeader = () => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };
  return (
    <>
      <SpecialitiesFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
      />

      <ManagementPageHeader
        title="Specialties Management"
        description="Manage Specialties information and details"
        action={{
          label: "Add Specialty",
          icon: Plus,
          onClick: () => setIsDialogOpen(true),
        }}
      />
    </>
  );
};

export default SpecialitiesManagementHeader;

```

- srac -> services -> admin -> SpecialitiesManagement.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */

"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createSpecialityZodSchema } from "@/zod/specialities.validation";




export async function createSpeciality(_prevState: any, formData: FormData) {
    try {
        const payload = {
            title: formData.get("title") as string,
        }
        if (zodValidator(payload, createSpecialityZodSchema).success === false) {
            return zodValidator(payload, createSpecialityZodSchema);
        }

        const validatedPayload = zodValidator(payload, createSpecialityZodSchema).data;

        const newFormData = new FormData()
        newFormData.append("data", JSON.stringify(validatedPayload))

        if (formData.get("file")) {
            newFormData.append("file", formData.get("file") as Blob)
        }

        const response = await serverFetch.post("/specialties", {
            body: newFormData,
        })

        const result = await response.json();

        return result;
    } catch (error: any) {
        console.log(error);
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}` }

    }
}

export async function getSpecialities() {
    try {
        const response = await serverFetch.get("/specialties")
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

export async function deleteSpeciality(id: string) {
    try {
        const response = await serverFetch.delete(`/specialties/${id}`)
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
```

## 70-3 Creating Table Columns And Specialities Table For Specialities Management Table

- next.config.ts

```ts 
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "res.cloudinary.com",
      }
    ]
  }
};

export default nextConfig;
```

- src -> components -> modules -> Admin -> SpecialitiesManagement -> specialitiesColumns.tsx

```tsx
import { Column } from "@/components/shared/ManagementTable";
import { ISpecialty } from "@/types/specialities.interface";
import Image from "next/image";

export const specialitiesColumns: Column<ISpecialty>[] = [
    {
        header: "Icon",
        accessor : (speciality) =>(
            <Image src={speciality.icon} alt={speciality.title} width={40} height={40} className="rounded-full" />
        )
    },
    {
        header :  "Title",
        accessor : (speciality) => speciality.title
    }
]
```

- src -> components -> modules -> Admin -> SpecialitiesManagement -> specialitiesTable.tsx

```tsx
"use client";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import ManagementTable from "@/components/shared/ManagementTable";

import { ISpecialty } from "@/types/specialities.interface";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { specialitiesColumns } from "./specialitiesColumns";
import { deleteSpeciality } from "@/services/admin/SpecialitiesManagement";

interface SpecialityTableProps {
  specialities: ISpecialty[];
}

const SpecialitiesTable = ({ specialities }: SpecialityTableProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingSpeciality, setDeletingSpeciality] =
    useState<ISpecialty | null>(null);
  const [isDeletingDialog, setIsDeletingDialog] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = (speciality: ISpecialty) => {
    setDeletingSpeciality(speciality);
  };

  const confirmDelete = async () => {
    if (!deletingSpeciality) return;

    setIsDeletingDialog(true);
    const result = await deleteSpeciality(deletingSpeciality.id);
    setIsDeletingDialog(false);
    if (result.success) {
      toast.success(result.message || "Speciality deleted successfully");
      setDeletingSpeciality(null);
      handleRefresh();
    } else {
      toast.error(result.message || "Failed to delete speciality");
    }
  };

  return (
    <>
      <ManagementTable
        data={specialities}
        columns={specialitiesColumns}
        onDelete={handleDelete}
        getRowKey={(speciality) => speciality.id}
        emptyMessage="No specialities found"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingSpeciality}
        onOpenChange={(open) => !open && setDeletingSpeciality(null)}
        onConfirm={confirmDelete}
        title="Delete Speciality"
        description={`Are you sure you want to delete ${deletingSpeciality?.title}? This action cannot be undone.`}
        isDeleting={isDeletingDialog}
      />
    </>
  );
};

export default SpecialitiesTable;
```

- src -> app -> (dashboardLayout) -> admin -> dashboard -> specialities-management -> page.tsx

```tsx
import SpecialitiesManagementHeader from "@/components/modules/Admin/SpecialitiesManagement/SpecialitiesManagementHeader";
import SpecialitiesTable from "@/components/modules/Admin/SpecialitiesManagement/specialitiesTable";

import RefreshButton from "@/components/shared/RefreshButton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { getSpecialities } from "@/services/admin/SpecialitiesManagement";

import { Suspense } from "react";

const AdminSpecialitiesManagementPage = async () => {
  const result = await getSpecialities();
  console.log(result)
  return (
    <div className="space-y-6">
      <SpecialitiesManagementHeader />
      <div className="flex">
        <RefreshButton />
      </div>
      <Suspense fallback={<TableSkeleton columns={2} rows={10} />}>
        <SpecialitiesTable specialities={result.data} />
      </Suspense>
    </div>
  );
};

export default AdminSpecialitiesManagementPage;
```

## 70-4 Creating Server Actions For Doctors Management Table

- zod -> doctor.validation.ts

```ts
import z from "zod";

export const createDoctorZodSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    contactNumber: z.string().min(10, "Contact Number must be at least 10 characters long"),
    address: z.string().optional(),
    registrationNumber: z.string().min(3, "Registration Number must be at least 3 characters long"),
    experience: z.number().min(0, "Experience cannot be negative").optional(),
    gender: z.enum(["MALE", "FEMALE"], "Gender must be either 'MALE' or 'FEMALE'"),
    appointmentFee: z.number().min(0, "Appointment Fee cannot be negative"),
    qualification: z.string().min(3, "Qualification must be at least 3 characters long"),
    currentWorkingPlace: z.string().min(3, "Current Working Place must be at least 3 characters long"),
    designation: z.string().min(2, "Designation must be at least 2 characters long"),
});

export const updateDoctorZodSchema = z.object({
    name: z.string().optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z.number().optional(),
    gender: z.string().optional(),
    apointmentFee: z.number().optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
});
```

- services -> admin -> DoctorsManagement.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { IDoctor } from "@/types/doctor.interface";
import { createDoctorZodSchema, updateDoctorZodSchema } from "@/zod/doctor.validation";


export async function createDoctor(_prevState: any, formData: FormData) {
    try {
        const payload: IDoctor = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            contactNumber: formData.get("contactNumber") as string,
            address: formData.get("address") as string,
            registrationNumber: formData.get("registrationNumber") as string,
            experience: Number(formData.get("experience") as string),
            gender: formData.get("gender") as "MALE" | "FEMALE",
            appointmentFee: Number(formData.get("appointmentFee") as string),
            qualification: formData.get("qualification") as string,
            currentWorkingPlace: formData.get("currentWorkingPlace") as string,
            designation: formData.get("designation") as string,
            password: formData.get("password") as string,
        }
        if (zodValidator(payload, createDoctorZodSchema).success === false) {
            return zodValidator(payload, createDoctorZodSchema);
        }

        const validatedPayload = zodValidator(payload, createDoctorZodSchema).data;

        if (!validatedPayload) {
            throw new Error("Invalid payload");
        }

        const newPayload = {
            password: validatedPayload.password,
            doctor: {
                name: validatedPayload.name,
                email: validatedPayload.email,
                contactNumber: validatedPayload.contactNumber,
                address: validatedPayload.address,
                registrationNumber: validatedPayload.registrationNumber,
                experience: validatedPayload.experience,
                gender: validatedPayload.gender,
                appointmentFee: validatedPayload.appointmentFee,
                qualification: validatedPayload.qualification,
                currentWorkingPlace: validatedPayload.currentWorkingPlace,
                designation: validatedPayload.designation,
            }
        }
        const newFormData = new FormData()
        newFormData.append("data", JSON.stringify(newPayload))

        if (formData.get("file")) {
            newFormData.append("file", formData.get("file") as Blob)
        }

        const response = await serverFetch.post("/user/create-doctor", {
            body: newFormData,
        })

        const result = await response.json();


        return result;
    } catch (error: any) {
        console.log(error);
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}` }

    }
}

export async function getDoctors(queryString?: string) {
    try {
        const response = await serverFetch.get(`/doctor${queryString ? `?${queryString}` : ""}`);
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

export async function getDoctorById(id: string) {
    try {
        const response = await serverFetch.get(`/doctor/${id}`)
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

export async function updateDoctor(id: string, _prevState: any, formData: FormData) {
    try {
        const payload: Partial<IDoctor> = {
            name: formData.get("name") as string,
            contactNumber: formData.get("contactNumber") as string,
            address: formData.get("address") as string,
            registrationNumber: formData.get("registrationNumber") as string,
            experience: Number(formData.get("experience") as string),
            gender: formData.get("gender") as "MALE" | "FEMALE",
            appointmentFee: Number(formData.get("appointmentFee") as string),
            qualification: formData.get("qualification") as string,
            currentWorkingPlace: formData.get("currentWorkingPlace") as string,
            designation: formData.get("designation") as string,
        }
        const validatedPayload = zodValidator(payload, updateDoctorZodSchema).data;

        const response = await serverFetch.patch(`/doctor/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedPayload),
        })
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}` }
    }
}

export async function softDeleteDoctor(id: string) {
    try {
        const response = await serverFetch.delete(`/doctor/soft/${id}`)
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
export async function deleteDoctor(id: string) {
    try {
        const response = await serverFetch.delete(`/doctor/${id}`)
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
```

## 70-5 Creating Form Dialog (Modal) For Doctors Management Table

- we can bind something and grab the data inside bind in the server function 

```tsx
const [state, formAction, isPending] = useActionState(registerPatient.bind("hello"), null);
```
- how to grab?

```tsx 
export const registerPatient = async (data,_currentState: any, formData: any): Promise<any> => {}
```

- src -> components -> modules -> Admin -> DoctorsManagement -> DoctorFormDialog.tsx

```tsx
import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDoctor, updateDoctor } from "@/services/admin/doctorsManagement";

import { IDoctor } from "@/types/doctor.interface";
import { ISpecialty } from "@/types/specialities.interface";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

interface IDoctorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor?: IDoctor;
  specialities?: ISpecialty[];
}

const DoctorFormDialog = ({
  open,
  onClose,
  onSuccess,
  doctor,
  specialities,
}: IDoctorFormDialogProps) => {
  const isEdit = !!doctor;

  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">(
    doctor?.gender || "MALE"
  );

  const [state, formAction, pending] = useActionState(
    isEdit ? updateDoctor.bind(null, doctor.id!) : createDoctor,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
      onClose();
    } else if (state && !state.success) {
      toast.error(state.message);
    }
  }, [state, onSuccess, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Dr. John Doe"
                defaultValue={isEdit ? doctor?.name : undefined}
              />
              <InputFieldError state={state} field="name" />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@example.com"
                defaultValue={isEdit ? doctor?.email : undefined}
                disabled={isEdit}
              />
              <InputFieldError state={state} field="email" />
            </Field>

            {!isEdit && (
              <>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                  />
                  <InputFieldError state={state} field="password" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                  />
                  <InputFieldError state={state} field="confirmPassword" />
                </Field>
              </>
            )}

            <Field>
              <FieldLabel htmlFor="specialities">Speciality</FieldLabel>
              <Input
                id="specialities"
                name="specialities"
                placeholder="Select a speciality"
                // defaultValue={isEdit ? doctor?.doctorSpecialties?.[0]?.specialties?.title : ""}
                defaultValue={selectedSpeciality}
                type="hidden"
              />
              <Select
                value={
                  //   isEdit
                  //     ? doctor?.doctorSpecialties?.[0]?.specialties?.title || ""
                  //     : selectedSpeciality
                  selectedSpeciality
                }
                onValueChange={setSelectedSpeciality}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a speciality" />
                </SelectTrigger>
                <SelectContent>
                  {specialities && specialities.length > 0 ? (
                    specialities.map((speciality) => (
                      <SelectItem key={speciality.id} value={speciality.title}>
                        {speciality.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No specialities available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select a speciality for the doctor
              </p>
              <InputFieldError state={state} field="specialities" />
            </Field>

            <Field>
              <FieldLabel htmlFor="contactNumber">Contact Number</FieldLabel>
              <Input
                id="contactNumber"
                name="contactNumber"
                placeholder="+1234567890"
                defaultValue={doctor?.contactNumber}
              />
              <InputFieldError state={state} field="contactNumber" />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, Country"
                defaultValue={isEdit ? doctor?.address : undefined}
              />
              <InputFieldError state={state} field="address" />
            </Field>

            <Field>
              <FieldLabel htmlFor="registrationNumber">
                Registration Number
              </FieldLabel>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                placeholder="REG123456"
                defaultValue={isEdit ? doctor?.registrationNumber : undefined}
              />
              <InputFieldError state={state} field="registrationNumber" />
            </Field>

            <Field>
              <FieldLabel htmlFor="experience">
                Experience (in years)
              </FieldLabel>
              <Input
                id="experience"
                name="experience"
                type="number"
                placeholder="5"
                defaultValue={isEdit ? doctor?.experience : undefined}
                min="0"
              />
              <InputFieldError state={state} field="experience" />
            </Field>

            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Input
                id="gender"
                name="gender"
                placeholder="Select gender"
                defaultValue={gender}
                type="hidden"
              />
              <Select
                value={gender}
                onValueChange={(value) => setGender(value as "MALE" | "FEMALE")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <InputFieldError state={state} field="gender" />
            </Field>

            <Field>
              <FieldLabel htmlFor="appointmentFee">Appointment Fee</FieldLabel>
              <Input
                id="appointmentFee"
                name="appointmentFee"
                type="number"
                placeholder="100"
                defaultValue={isEdit ? doctor?.appointmentFee : undefined}
                min="0"
              />
              <InputFieldError state={state} field="appointmentFee" />
            </Field>

            <Field>
              <FieldLabel htmlFor="qualification">Qualification</FieldLabel>
              <Input
                id="qualification"
                name="qualification"
                placeholder="MBBS, MD"
                defaultValue={isEdit ? doctor?.qualification : undefined}
              />
              <InputFieldError state={state} field="qualification" />
            </Field>

            <Field>
              <FieldLabel htmlFor="currentWorkingPlace">
                Current Working Place
              </FieldLabel>
              <Input
                id="currentWorkingPlace"
                name="currentWorkingPlace"
                placeholder="City Hospital"
                defaultValue={isEdit ? doctor?.currentWorkingPlace : undefined}
              />
              <InputFieldError state={state} field="currentWorkingPlace" />
            </Field>

            <Field>
              <FieldLabel htmlFor="designation">Designation</FieldLabel>
              <Input
                id="designation"
                name="designation"
                placeholder="Senior Consultant"
                defaultValue={isEdit ? doctor?.designation : undefined}
              />
              <InputFieldError state={state} field="designation" />
            </Field>

            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="file">Profile Photo</FieldLabel>
                <Input id="file" name="file" type="file" accept="image/*" />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a profile photo for the doctor
                </p>
                <InputFieldError state={state} field="file" />
              </Field>
            )}
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : isEdit
                ? "Update Doctor"
                : "Create Doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorFormDialog;
```

## 70-6 Creating Page Header And Table Columns For Doctors Management Table

- components -> modules -> Admin -> DoctorsManagement -> DoctorsManagementHeader.tsx

```tsx
"use client";

import ManagementPageHeader from "@/components/shared/ManagementPageHeader";
import { ISpecialty } from "@/types/specialities.interface";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DoctorFormDialog from "./DoctorFormDialog";

interface DoctorsManagementHeaderProps {
  specialities?: ISpecialty[];
}

const DoctorsManagementHeader = ({
  specialities,
}: DoctorsManagementHeaderProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };
  return (
    <>
      <DoctorFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
        specialities={specialities}
      />

      <ManagementPageHeader
        title="Doctors Management"
        description="Manage Doctors information and details"
        action={{
          label: "Add Doctor    ",
          icon: Plus,
          onClick: () => setIsDialogOpen(true),
        }}
      />
    </>
  );
};

export default DoctorsManagementHeader;
```

## 70-7 Creating Reusable UserInfoCell, StatusBadgeCell, DateCell And Doctors Table, 70-8 Getting Query Object From searchParams And Formatting The Query String, 70-9 Adding Pagination Component For Doctors Table, 70-10 Creating View Details Modal To View Doctor Detail From Table,70-11 Completing Edit Functionality To Edit The Doctor From Table


```
npx shadcn@latest add avatar
```

- srcx -> lib-> formatters.ts 

```ts 
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}


export function queryStringFormatter(searchParamsObj: { [key: string]: string | string[] | undefined }): string {
    let queryString = "";
    // {searchTerm: "John", speciality: "Cardiology"}
    // after entries: [ ["searchTerm", "John"], ["speciality", "Cardiology"] ]
    const queryArray = Object.entries(searchParamsObj).map(([key, value]) => {
        if (Array.isArray(value)) {
            // { speciality: ["Cardiology", "Neurology"] } 
            // ["Cardiology", "Neurology"]
            // ?speciality=Cardiology&speciality=Neurology
            return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
        }
        else if (value !== undefined) {
            return `${key}=${encodeURIComponent(value)}`;
        }
        return "";
    });
    queryString = queryArray.filter((q) => q !== "").join("&"); // searchTerm=John&speciality=Cardiology&speciality=Neurology
    return queryString;
}
```

- src -> components -> shared -> tableCells -> DateCell.tsx

```tsx
"use client";

import { formatDateTime } from "@/lib/formatters";



interface DateCellProps {
  date?: string | Date;
}

export function DateCell({ date }: DateCellProps) {
  return <span className="text-sm">{formatDateTime(date!)}</span>;
}
```
- src -> components -> shared -> tableCells -> StatusBadge.tsx

```tsx
"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeCellProps {
  isDeleted?: boolean;
  activeText?: string;
  deletedText?: string;
}

export function StatusBadgeCell({
  isDeleted,
  activeText = "Active",
  deletedText = "Deleted",
}: StatusBadgeCellProps) {
  return (
    <Badge variant={isDeleted ? "destructive" : "default"}>
      {isDeleted ? deletedText : activeText}
    </Badge>
  );
}
```
- src -> components -> shared -> tableCells -> UserInfoCell.tsx

```tsx
"use client";

import { Avatar } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

import Image from "next/image";

interface UserInfoCellProps {
  name: string;
  email: string;
  photo?: string | null;
}

export function UserInfoCell({ name, email, photo }: UserInfoCellProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        {photo ? (
          <Image src={photo} alt={name} width={40} height={40} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-semibold">
            {getInitials(name)}
          </div>
        )}
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
```
- src -> components -> modules -> Admin -> DoctorsManagement -> doctorsColumns.tsx

```tsx
"use client";

import { DateCell } from "@/components/shared/cell/DateCell";
import { StatusBadgeCell } from "@/components/shared/cell/StatusBadgeCell";
import { UserInfoCell } from "@/components/shared/cell/UserInfoCell";
import { Column } from "@/components/shared/ManagementTable";
import { IDoctor } from "@/types/doctor.interface";
import { Star } from "lucide-react";

export const doctorsColumns: Column<IDoctor>[] = [
  {
    header: "Doctor",
    accessor: (doctor) => (
      <UserInfoCell
        name={doctor.name}
        email={doctor.email}
        photo={doctor.profilePhoto}
      />
    ),
  },
  {
    header: "Specialties",
    accessor: (doctor) => (
      <div className="flex flex-wrap gap-1">
        {doctor.doctorSpecialties && doctor.doctorSpecialties.length > 0 ? (
          doctor.doctorSpecialties.map((specialty, index) => (
            <span
              key={specialty.specialties?.id || index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {specialty.specialties?.title || "N/A"}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">No specialties</span>
        )}
      </div>
    ),
  },
  {
    header: "Contact",
    accessor: (doctor) => (
      <div className="flex flex-col">
        <span className="text-sm">{doctor.contactNumber}</span>
      </div>
    ),
  },
  {
    header: "Experience",
    accessor: (doctor) => (
      <span className="text-sm font-medium">
        {doctor.experience ?? 0} years
      </span>
    ),
  },
  {
    header: "Fee",
    accessor: (doctor) => (
      <span className="text-sm font-semibold text-green-600">
        ${doctor.appointmentFee}
      </span>
    ),
  },
  {
    header: "Rating",
    accessor: (doctor) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">
          {doctor.averageRating!.toFixed(1)}
        </span>
      </div>
    ),
  },
  {
    header: "Gender",
    accessor: (doctor) => (
      <span className="text-sm capitalize">{doctor.gender.toLowerCase()}</span>
    ),
  },
  {
    header: "Status",
    accessor: (doctor) => <StatusBadgeCell isDeleted={doctor.isDeleted} />,
  },
  {
    header: "Joined",
    accessor: (doctor) => <DateCell date={doctor.createdAt} />,
  },
];
```

- src -> components -> shared -> inRow.tsx 

```tsx
function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "N/A"}</p>
    </div>
  );
}

export default InfoRow;
```

- rc -> components -> modules -> Admin -> DoctorsManagement -> DoctorViewDetailDialog.tsx

```tsx 

import InfoRow from "@/components/shared/inRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, getInitials } from "@/lib/formatters";
import { IDoctor } from "@/types/doctor.interface";
import {
  Briefcase,
  Calendar,
  DollarSign,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  User,
} from "lucide-react";

interface IDoctorViewDialogProps {
  open: boolean;
  onClose: () => void;
  doctor: IDoctor | null;
}

const DoctorViewDetailDialog = ({
  open,
  onClose,
  doctor,
}: IDoctorViewDialogProps) => {
  if (!doctor) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Doctor Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Doctor Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg mb-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={doctor?.profilePhoto} alt={doctor?.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(doctor?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold mb-1">{doctor?.name}</h2>
              <p className="text-muted-foreground mb-2 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-4 w-4" />
                {doctor?.email}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge
                  variant={doctor?.isDeleted ? "destructive" : "default"}
                  className="text-sm"
                >
                  {doctor?.isDeleted ? "Inactive" : "Active"}
                </Badge>
                {doctor?.averageRating !== undefined && (
                  <Badge variant="secondary" className="text-sm">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {doctor.averageRating.toFixed(1)} Rating
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="space-y-6">
            {/* Professional Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">
                  Professional Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Designation"
                    value={doctor?.designation || "Not specified"}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Qualification"
                    value={doctor?.qualification || "Not specified"}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Registration Number"
                    value={doctor?.registrationNumber || "Not specified"}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Experience"
                    value={
                      doctor?.experience
                        ? `${doctor.experience} years`
                        : "Not specified"
                    }
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Current Working Place"
                    value={doctor?.currentWorkingPlace || "Not specified"}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Appointment Fee"
                    value={
                      doctor?.appointmentFee
                        ? `$${doctor.appointmentFee}`
                        : "Not specified"
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Specialties */}
            {doctor?.doctorSpecialties &&
              doctor.doctorSpecialties.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Specialties</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.doctorSpecialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-4 py-2 text-sm"
                        >
                          {specialty.specialties?.title || "Unknown"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Contact Number"
                    value={doctor?.contactNumber || "Not provided"}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Email"
                    value={doctor?.email || "Not provided"}
                  />
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Address"
                    value={doctor?.address || "Not provided"}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Gender"
                    value={
                      doctor?.gender
                        ? doctor.gender.charAt(0) +
                          doctor.gender.slice(1).toLowerCase()
                        : "Not specified"
                    }
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Joined On"
                    value={formatDateTime(doctor?.createdAt || "")}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Last Updated"
                    value={formatDateTime(doctor?.updatedAt || "")}
                  />
                </div>
                {doctor?.averageRating !== undefined && (
                  <div className="flex items-start gap-3">
                    <Star className="h-4 w-4 mt-1 text-muted-foreground" />
                    <InfoRow
                      label="Average Rating"
                      value={`${doctor.averageRating.toFixed(1)} / 5.0`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorViewDetailDialog;
```

- src -> components -> modules -> Admin -> DoctorsManagement -> DoctorManagementTable.tsx

```tsx
"use client";

import ManagementPageHeader from "@/components/shared/ManagementPageHeader";
import { ISpecialty } from "@/types/specialities.interface";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DoctorFormDialog from "./DoctorFormDialog";

interface DoctorsManagementHeaderProps {
  specialities?: ISpecialty[];
}

const DoctorsManagementHeader = ({
  specialities,
}: DoctorsManagementHeaderProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };
  return (
    <>
      <DoctorFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
        specialities={specialities}
      />

      <ManagementPageHeader
        title="Doctors Management"
        description="Manage Doctors information and details"
        action={{
          label: "Add Doctor    ",
          icon: Plus,
          onClick: () => setIsDialogOpen(true),
        }}
      />
    </>
  );
};

export default DoctorsManagementHeader;
```

- src -> components -> modules -> Admin -> DoctorsManagement -> DoctorsTable.tsx

```tsx
"use client";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import ManagementTable from "@/components/shared/ManagementTable";

import { IDoctor } from "@/types/doctor.interface";
import { ISpecialty } from "@/types/specialities.interface";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import DoctorFormDialog from "./DoctorFormDialog";

import DoctorViewDetailDialog from "./DoctorViewDetailDialog";
import { doctorsColumns } from "./DoctorsColumns";
import { softDeleteDoctor } from "@/services/admin/doctorsManagement";

interface DoctorsTableProps {
  doctors: IDoctor[];
  specialities: ISpecialty[];
}

const DoctorsTable = ({ doctors, specialities }: DoctorsTableProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingDoctor, setDeletingDoctor] = useState<IDoctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<IDoctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleView = (doctor: IDoctor) => {
    setViewingDoctor(doctor);
  };

  const handleEdit = (doctor: IDoctor) => {
    setEditingDoctor(doctor);
  };

  const handleDelete = (doctor: IDoctor) => {
    setDeletingDoctor(doctor);
  };

  const confirmDelete = async () => {
    if (!deletingDoctor) return;

    setIsDeleting(true);
    const result = await softDeleteDoctor(deletingDoctor.id!);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message || "Doctor deleted successfully");
      setDeletingDoctor(null);
      handleRefresh();
    } else {
      toast.error(result.message || "Failed to delete doctor");
    }
  };

  return (
    <>
      <ManagementTable
        data={doctors}
        columns={doctorsColumns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getRowKey={(doctor) => doctor.id!}
        emptyMessage="No doctors found"
      />
      {/* Edit Doctor Form Dialog */}
      <DoctorFormDialog
        open={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
        doctor={editingDoctor!}
        specialities={specialities}
        onSuccess={() => {
          setEditingDoctor(null);
          handleRefresh();
        }}
      />

      {/* View Doctor Detail Dialog */}
      <DoctorViewDetailDialog
        open={!!viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        doctor={viewingDoctor}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingDoctor}
        onOpenChange={(open) => !open && setDeletingDoctor(null)}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        description={`Are you sure you want to delete ${deletingDoctor?.name}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default DoctorsTable;
```

- app -> (dashboardLayout) -> admin -> dashboard -> doctors-management -> page.tsx

```tsx
import DoctorsManagementHeader from "@/components/modules/Admin/DoctorsManagement/DoctorsManagementHeader";
import DoctorsTable from "@/components/modules/Admin/DoctorsManagement/DoctorsTable";
import RefreshButton from "@/components/shared/RefreshButton";
import SearchFilter from "@/components/shared/SearchFilter";
import SelectFilter from "@/components/shared/SelectFilter";
import TablePagination from "@/components/shared/TablePagination";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { queryStringFormatter } from "@/lib/formatters";
import { getDoctors } from "@/services/admin/doctorsManagement";
import { getSpecialities } from "@/services/admin/SpecialitiesManagement";

import { ISpecialty } from "@/types/specialities.interface";
import { Suspense } from "react";

const AdminDoctorsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj); // {searchTerm: "John", speciality: "Cardiology" => "?searchTerm=John&speciality=Cardiology"}
  const specialitiesResult = await getSpecialities();
  const doctorsResult = await getDoctors(queryString);
  const totalPages = Math.ceil(
    doctorsResult.meta.total / doctorsResult.meta.limit
  );
  return (
    <div className="space-y-6">
      <DoctorsManagementHeader specialities={specialitiesResult.data} />
      <div className="flex space-x-2">
        <SearchFilter paramName="searchTerm" placeholder="Search doctors..." />
        <SelectFilter
          paramName="speciality" // ?speciality="Cardiology"
          options={specialitiesResult.data.map((speciality: ISpecialty) => ({
            label: speciality.title,
            value: speciality.title,
          }))}
          placeholder="Filter by speciality"
        />
        <RefreshButton />
      </div>
      <Suspense fallback={<TableSkeleton columns={10} rows={10} />}>
        <DoctorsTable
          doctors={doctorsResult.data}
          specialities={specialitiesResult.data}
        />
        <TablePagination
          currentPage={doctorsResult.meta.page}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
};

export default AdminDoctorsManagementPage;
```