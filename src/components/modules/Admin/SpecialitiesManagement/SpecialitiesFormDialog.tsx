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