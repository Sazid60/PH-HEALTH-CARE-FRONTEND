/**
 * Small interface describing the shape of the JWT payload we expect.
 * Keep this lightweight — we only rely on id, email and role here.
 */
export interface userInterface {
    id: string;
    email: string;
    // Role determines which protected routes the user may access
    role: "ADMIN" | "DOCTOR" | "PATIENT";
    iat: number; // issued-at timestamp
    exp: number; // expiry timestamp
}