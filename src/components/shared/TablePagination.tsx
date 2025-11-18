"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "../ui/button";

/**
 * Props for the table pagination component.
 * - `currentPage`: the currently active page (1-based index).
 * - `totalPages`: total number of pages available.
 */
interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
}

/**
 * TablePagination
 * - Renders a compact pagination control with "Previous", numbered page
 *   buttons (up to 5 visible), and "Next".
 * - Reads existing URL search params and updates the `page` param when the
 *   user navigates. Navigation is performed inside `startTransition` so React
 *   treats it as a non-urgent update and keeps the UI responsive.
 */
const TablePagination = ({ currentPage, totalPages }: TablePaginationProps) => {
    const router = useRouter();
    // `isPending` can be used to disable controls during navigation,
    // `startTransition` schedules the router push as a non-urgent update.
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();

    /**
     * navigateToPage
     * - Clones current search params, sets the `page` param to `newPage`, and
     *   pushes the new query string using Next.js router inside a transition.
     */
    const navigateToPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    // If there's only one page (or none), don't render the pagination UI at all.
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Previous button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage - 1)}
                // Disable when already on the first page or while a navigation is pending
                disabled={currentPage <= 1 || isPending}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </Button>

            {/*
        Numbered page buttons.
        - We render up to 5 page buttons for compactness.
        - If `totalPages <= 5` we render pages 1..totalPages.
        - If `currentPage` is near the start we render 1..5.
        - If `currentPage` is near the end we render the last 5 pages.
        - Otherwise we center the current page with two pages on either side.
      */}
            <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    // array.from method returns an array from any iterable object. We create an array of length 5 or totalPages (whichever is smaller).
                    let pageNumber: number;

                    if (totalPages <= 5) {
                        // Small number of pages: show all
                        pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                        // Near the start: show first five pages
                        pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                        // Near the end: show last five pages
                        pageNumber = totalPages - 4 + index;
                    } else {
                        // Middle range: center current page (two before, current, two after)
                        pageNumber = currentPage - 2 + index;
                    }

                    return (
                        <Button
                            key={pageNumber}
                            // Highlight the active page with the "default" variant
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => navigateToPage(pageNumber)}
                            disabled={isPending}
                            className="w-10"
                        >
                            {pageNumber}
                        </Button>
                    );
                })}
            </div>

            {/* Next button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage + 1)}
                // Disable when on the last page or while navigation is pending
                disabled={currentPage === totalPages || isPending}
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            {/* Simple page indicator */}
            <span className="text-sm text-muted-foreground ml-2">
                Page {currentPage} of {totalPages}
            </span>
        </div>
    );
};

export default TablePagination;