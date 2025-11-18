import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

/**
 * Props for `SelectFilter` component.
 * - `paramName`: the query parameter name used in the URL (e.g. `?gender=`).
 * - `placeholder`: optional placeholder text shown when no value is selected.
 * - `options`: array of selectable options with `label` and `value`.
 */
interface SelectFilterProps {
    paramName: string; // ?gender=
    placeholder?: string;
    options: { label: string; value: string }[];
}

/**
 * SelectFilter
 * - Reads the current value from the URL (`useSearchParams`) and renders a
 *   controlled `Select` component populated from `options`.
 * - When selection changes, the component updates the URL query string using
 *   `router.push` inside `startTransition` so the navigation is treated as a
 *   non-urgent update.
 * - The special option value `"All"` is used to indicate "no filter": when
 *   selected the corresponding query param is removed from the URL.
 */
const SelectFilter = ({
    paramName,
    placeholder,
    options,
}: SelectFilterProps) => {
    const router = useRouter();
    // Provides the current set of URL search params (read-only object-like API)
    const searchParams = useSearchParams();

    // useTransition returns [isPending, startTransition]. We use `isPending` to
    // disable the select while a navigation update is in progress to prevent
    // double-submission / rapid changes; `startTransition` is used to schedule
    // the router push as a non-urgent update.
    const [isPending, startTransition] = useTransition();

    // Read current value for the given param from the URL. If the param is not
    // present we use the sentinel value "All" to represent the unfiltered state.
    const currentValue = searchParams.get(paramName) || "All";

    /**
     * handleChange
     * - `value` comes from the Select component when the user picks an item.
     * - If `value === "All"` we remove the query param to represent "no filter".
     * - Otherwise we set/update the query param with the selected value.
     * - Navigation is scheduled inside `startTransition` to avoid blocking the UI.
     */
    const handleChange = (value: string) => {
        // Clone the current search params so we can modify them safely
        const params = new URLSearchParams(searchParams.toString());

        if (value === "All") {
            // Remove the filter param entirely to show the unfiltered list/state
            params.delete(paramName);
        } else if (value) {
            // Set or update the filter param (e.g. ?gender=male)
            params.set(paramName, value);
        } else {
            // Fallback: if an empty string is provided, ensure the param is removed
            params.delete(paramName);
        }

        // Use startTransition so React treats the route update as non-urgent.
        // This helps keep the UI responsive during the navigation.
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    return (
        <Select
            value={currentValue}
            onValueChange={handleChange}
            // Disable the select while a navigation is pending to avoid multiple
            // rapid updates that could lead to unexpected states.
            disabled={isPending}
        >
            <SelectTrigger>
                {/*
          `SelectValue` shows the currently selected item or the `placeholder`
          when no value is selected. The `placeholder` prop should describe the
          filter purpose (e.g. "Select gender").
        */}
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {/* Include an explicit "All" item to allow clearing the filter */}
                <SelectItem value="All">All</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default SelectFilter;