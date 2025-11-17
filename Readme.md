## PH-HEALTHCARE-FRONTEND-PART-5

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-5

## 69-1 Creating serverFetch Function For Reusable Fetch Function

- we are using raw fetch method for data fetching because next.js extends and adds power of caching and many more features . if we use tanstack and axios and rtk we will miss those features. We are missing some features of axios if we use raw query, like we can not set ase url base url in one place and use it everywhere. so to solve this problem we will create a reusable fetch function called serverFetch. as well as we can not use interceptors. 

- so we will create a reuseable function that will work as `axios`.

- src -> lib -> serverFetch.ts

```ts 
import { getCookie } from "@/services/auth/tokenHandler";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5000/api/v1';

export const serverFetchHelper = async (endpoint: string, options: RequestInit): Promise<Response> => {
    const { headers, ...restOptions } = options;

    const accessToken = await getCookie('accessToken');


    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        // we will change the headers here for automatically accessing token  
        headers: {
            ...headers,
            // ...(accessToken?{ 'Authorization': `Bearer ${accessToken}` } : {})
            // ...(accessToken ? { 'Authorization': accessToken } : {}) // our backend do not support Authorization 


            // there another problem arose here. as its gonna run in server action we can not access the token from cookie and we have to manually do it.
            
            Cookie : accessToken ? `accessToken=${accessToken}` : ''
        },
        ...restOptions
    })

    return response

}
// how we will add the methods? we are creating a helper function


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

## 69-1 Creating serverFetch Function For Reusable Fetch Function

- we will start working from admin works because admin can create doctor, manage doctor, manage appointment, manage users everything from admin panel. so its better to start from admin panel. then doctor works will be done and then the patient works will be done.

- Structure analysis done 

## 69-3 Creating Reusable Management Table Components

- component -> ManagementTable -> ManagementTable.tsx

```tsx
"use client";
import { Edit, Eye, Loader2, MoreHorizontal, Trash } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";

/**
 * ManagementTable
 * ----------------
 * Generic, reusable "management" table component intended for lists with optional row actions.
 * It is intentionally simple and unopinionated about the data shape — you provide:
 *  - columns: how each column should render
 *  - data: array of row objects
 *  - getRowKey: stable unique key extractor for each row (string)
 *  - optional handlers for view/edit/delete actions
 *
 * Key design goals:
 *  - Type-safe: generic <T> allows column accessors to reference properties of your row type.
 *  - Flexible rendering: column accessor can be a key of T (simple cell) or a function (custom JSX).
 *  - Performance: consumer provides getRowKey to ensure stable keys for mapping lists.
 *  - UX: built-in empty state and a "refreshing" overlay to indicate background updates.
 *
 * Usage examples:
 * 1) Simple usage with property accessors:
 *    const columns: Column<User>[] = [
 *      { header: 'Name', accessor: 'name' },
 *      { header: 'Email', accessor: 'email' },
 *    ];
 *    <ManagementTable
 *      data={users}
 *      columns={columns}
 *      getRowKey={(u) => u.id}
 *      onView={(u) => openUser(u.id)}
 *    />
 *
 * 2) Custom cell rendering:
 *    const columns: Column<User>[] = [
 *      { header: 'Name', accessor: (u) => <strong>{u.name}</strong> },
 *      { header: 'Joined', accessor: (u) => formatDate(u.joinedAt) },
 *    ];
 *
 * Notes:
 *  - If you use property accessors (keys of T), non-string values are coerced via String(...).
 *    If you need richer content (elements, icons, buttons), use an accessor function.
 *  - getRowKey must return a unique stable string for each row. Do not use array index for keys.
 *  - Action handlers (onView/onEdit/onDelete) are optional. If none are provided, the Actions column is omitted.
 *  - The component uses the project's Button/Dropdown/Table primitives — adjust classes or wrappers if needed.
 */

/*
  Column<T>
  - Represents a single column definition for the table.
  - header: visible header label shown in the table header for this column.
  - accessor:
      - A keyof T (e.g. 'name') means the table will read the property value from the row object.
      - A function (row => ReactNode) allows fully custom rendering for that cell.
  - className: optional CSS classes applied to the TableCell for this column (alignment, width, etc).
*/
export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

/*
  ManagementTableProps<T>
  - data: array of row objects to render.
  - columns: column definitions controlling header and cell rendering.
  - onView/onEdit/onDelete: optional callbacks invoked with the full row object when a user selects the action.
  - getRowKey: REQUIRED. Must return a stable, unique string key per row (e.g. id.toString()).
      This is important to keep React list reconciliation correct and to avoid re-mounting rows unnecessarily.
  - emptyMessage: custom message when data is empty (default: "No records found.").
  - isRefreshing: when true the component shows a modal-like overlay with a spinner to block actions and indicate loading.
*/
interface ManagementTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    getRowKey: (row: T) => string;
    emptyMessage?: string;
    isRefreshing?: boolean;
}

/**
 * ManagementTable<T>
 * Generic management-style table component.
 *
 * Rendering behavior summary:
 *  - Renders a header row from columns[].header.
 *  - For each data item renders a TableRow and one TableCell per column.
 *  - If a column.accessor is a function it is called with the row and the returned ReactNode is rendered.
 *  - If accessor is a key of the row, the component reads that property and renders String(value).
 *  - If any of onView/onEdit/onDelete are provided, a trailing "Actions" column is rendered with a dropdown menu.
 *  - If isRefreshing is true an overlay with a spinner is shown and user interactions are visually blocked.
 */
function ManagementTable<T>({
    data = [],
    columns = [],
    onView,
    onEdit,
    onDelete,
    getRowKey,
    emptyMessage = "No records found.",
    isRefreshing = false,
}: ManagementTableProps<T>) {
    // Presence of any action callback controls whether the Actions column is shown.
    // This keeps the table layout simpler when no row actions are needed.
    const hasActions = onView || onEdit || onDelete;

    return (
        <>
            <div className="rounded-lg border relative">
                {/* Refreshing Overlay
                    - Covers the entire table area with a translucent layer and a spinner.
                    - Useful when parent triggers a background refresh and you want to prevent clicks.
                    - Accessibility: Consider additionally managing focus/aria-busy on the parent if needed.
                */}
                {isRefreshing && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Refreshing...</p>
                        </div>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* Header cells: render in the same order as columns prop */}
                            {columns?.map((column, colIndex) => (
                                <TableHead key={colIndex} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}

                            {/* Actions header: only render if we have action handlers */}
                            {hasActions && (
                                <TableHead className="w-[70px]">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* Empty state: single full-width row with message */}
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (hasActions ? 1 : 0)}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            /* Data rows:
                               - Iterate over data and render a TableRow per item.
                               - Use getRowKey(item) for stable React keys (required for lists).
                               - Each column either uses a render function or reads a property from the row.
                               - Casting to String ensures primitive values render safely; prefer accessor functions for JSX.
                            */
                            data?.map((item) => (
                                <TableRow key={getRowKey(item)}>
                                    {columns.map((col, idx) => (
                                        <TableCell key={idx} className={col.className}>
                                            {typeof col.accessor === "function"
                                                // Custom renderer: allow consumer to return any React node
                                                ? col.accessor(item)
                                                // Property accessor: access the field and coerce to string.
                                                // IMPORTANT: Using String(...) here means null/undefined become "null"/"undefined".
                                                // If you want empty cells instead, provide an accessor function that returns "" as needed.
                                                : String(item[col.accessor])}
                                        </TableCell>
                                    ))}

                                    {/* Actions dropdown:
                                        - Rendered only when at least one action handler exists.
                                        - Each menu item only appears if its corresponding handler is provided.
                                        - Handlers receive the full row object — caller can extract id or other fields.
                                        - Styling: destructive class on Delete to visually warn user.
                                    */}
                                    {hasActions && (
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {onView && (
                                                        <DropdownMenuItem onClick={() => onView(item)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onEdit && (
                                                        <DropdownMenuItem onClick={() => onEdit(item)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onDelete && (
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(item)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

export default ManagementTable;
```

## 69-4 Creating Reusable Management Page Header and Refresh Button Components

- component -> ManagementPageHeader -> ManagementPageHeader.tsx

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

- component -> RefreshButton -> RefreshButton.tsx

```tsx
"use client";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "../ui/button";

interface RefreshButtonProps {
    size?: "sm" | "default" | "lg";
    variant?: "default" | "outline" | "ghost";
    showLabel?: boolean;
}

const RefreshButton = ({
    size = "default",
    variant = "default",
    showLabel = true,
}: RefreshButtonProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition(); // lets us re render a part of the of the ui not the full page/ full component. 


    const handleRefresh = () => {
        startTransition(() => {
            router.refresh(); // because of using transition it will run in background without blocking the UI
        });
    };
    return (
        <Button
            size={size}
            variant={variant}
            onClick={handleRefresh}
            disabled={isPending}
        >
            <RefreshCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""} ${showLabel ? "mr-2" : ""}`}
            />
            {showLabel && "Refresh"}
        </Button>
    );
};

export default RefreshButton;
```
##