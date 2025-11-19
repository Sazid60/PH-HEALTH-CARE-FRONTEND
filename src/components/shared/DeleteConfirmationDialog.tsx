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