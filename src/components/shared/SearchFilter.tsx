"use client"

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Props for `SearchFilter` component.
 * - `placeholder`: input placeholder text.
 * - `paramName`: query parameter name used in the URL (e.g. `?searchTerm=...`).
 */
interface SearchFilterProps {
    placeholder?: string;
    paramName?: string // ?searchTerm="admin" here the paramName is searchTerm
}

/**
 * SearchFilter
 * - Controlled input that updates the current URL query string using Next.js router.
 * - Uses a debounce hook so the URL is only updated after the user stops typing.
 * - Resets the `page` parameter to `1` when a new search is applied.
 *
 * Note: the input is currently rendered with `disabled` — keep this if the search
 * should be read-only in the UI, otherwise remove the `disabled` prop.
 */
const SearchFilter = ({ placeholder = "Search....", paramName = "searchTerm" }: SearchFilterProps) => {
    const router = useRouter()
    // useTransition lets us mark the router update as non-urgent
    // We only need the `startTransition` function here; avoid an unused variable.
    const [, startTransition] = useTransition()
    const searchParams = useSearchParams()

    // Initialize the controlled input from the current query param (if present)
    const [value, setValue] = useState(searchParams.get(paramName) || "")

    // Debounce the `value` so we don't update the URL on every keystroke
    const debouncedValue = useDebounce(value, 500)

    useEffect(() => {
        // Copy current search params so we can modify them
        const params = new URLSearchParams(searchParams.toString());

        // When the component mounts, `useState` might already have the initial value
        // from the URL. If the debounced value equals the initial URL value, do nothing.
        const initialValue = searchParams.get(paramName) || ""
        if (initialValue === debouncedValue) return; // no need to push the same value again

        if (debouncedValue) {
            // Add/update the search param and reset pagination to page 1
            params.set(paramName, debouncedValue)  // ?searchTerm=debouncedValue
            params.set("page", "1") // reset to first page on search
        } else {
            // If the search term is cleared, remove the param(s) from the URL
            params.delete(paramName)
            params.delete("page") // also remove page param if no search term
        }

        // Use startTransition to avoid blocking urgent updates/UI
        startTransition(() => {
            // Push the updated query string to the router
            router.push(`?${params.toString()}`)
        })

    }, [debouncedValue, paramName, router, searchParams])

    return (
        <div className="relative">
            {/* Search icon positioned inside the input */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            {/* Controlled input: value is kept in component state and debounced
                before writing into the URL. Remove `disabled` if users should be
                allowed to type (it's currently present to render a non-editable field).
            */}
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled
                className="pl-10"
            />
        </div>
    );
};

export default SearchFilter;