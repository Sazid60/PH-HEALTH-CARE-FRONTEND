// Utility: extract up to two-letter initials from a full name string.
// Examples:
// - "John Doe" -> "JD"
// - "alice" -> "AL"
export function getInitials(name: string): string {
    // Split the incoming name by spaces into words (e.g. ["John", "Doe"]).
    return name
        .split(" ") // break into an array of words
        .map((n) => n[0]) // map each word to its first character (may be undefined for empty strings)
        .join("") // join the characters together (e.g. "JD")
        .toUpperCase() // normalize to uppercase for consistent display
        .slice(0, 2); // limit to two characters (handles single-word names)
}

// Format a Date (or parsable date string) into a readable date-time string.
// Uses `toLocaleString` to produce locale-aware formatting. Current locale is
// hard-coded to `en-US` to keep output stable across environments.
export function formatDateTime(date: string | Date): string {
    // Create a Date instance from the input (no-op if already a Date).
    // Then format using locale options for year/month/day and hour/minute.
    return new Date(date).toLocaleString("en-US", {
        year: "numeric", // full numeric year (e.g. 2025)
        month: "short", // abbreviated month name (e.g. "Nov")
        day: "numeric", // day of month (e.g. 21)
        hour: "2-digit", // 2-digit hour (localized 12/24h depending on locale)
        minute: "2-digit", // 2-digit minute
    });
}


// Convert an object of search params into a URL query string (without the leading '?').
// - Accepts string values, arrays of strings, or `undefined` to skip a key.
// - Encodes values with `encodeURIComponent` to ensure safe URL characters.
// Example:
// { searchTerm: "John", speciality: ["Cardiology", "Neurology"] }
// -> "searchTerm=John&speciality=Cardiology&speciality=Neurology"
export function queryStringFormatter(searchParamsObj: { [key: string]: string | string[] | undefined }): string {
    console.log("search:",searchParamsObj)
    let queryString = ""; // initialize the resulting query string

    // Convert object entries into an array of key/value pairs and map them
    // to properly encoded query segments.
    // e.g. Object.entries({ a: "1", b: ["x","y"] }) => [["a","1"],["b",["x","y"]]]
    const queryArray = Object.entries(searchParamsObj).map(([key, value]) => {
        if (Array.isArray(value)) {
            // When the value is an array, produce multiple key=value pairs for the same key.
            // Example: { speciality: ["Cardiology", "Neurology"] }
            // -> ["speciality=Cardiology", "speciality=Neurology"] then joined to a single string
            return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
        }
        else if (value !== undefined) {
            // Single string value: encode and return a single key=value segment.
            return `${key}=${encodeURIComponent(value)}`;
        }
        // If the value is undefined, return an empty string; it will be filtered out later.
        return "";
    });

    // Remove any empty segments and join with '&' to form the final query string.
    // Example output: "searchTerm=John&speciality=Cardiology&speciality=Neurology"
    queryString = queryArray.filter((q) => q !== "").join("&");
    return queryString;
}