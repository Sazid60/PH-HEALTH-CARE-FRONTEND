"use client"
// This file defines a small React Context + Provider for the authenticated user.
// What it does:
// - Exposes `user` and `setUser` via a context so any client component can read/update auth state.
// - Optionally accepts an `initialUser` (useful when the server can prefetch user info).
// - Lazily revalidates the user on mount if no user is present (e.g., after refresh).
// Why it exists:
// - Centralizes user state so we don't fetch/derive auth status in many places.
// - Ensures components can safely access the current user without prop-drilling.
import { userInterface } from "@/types/userTypes";
import checkAuthStatus from "@/utils/auth";

import { createContext, useContext, useEffect, useState } from "react";


// The shape of our User Context value. Components get the current user and a setter.
interface UserContextInterface {
    user: userInterface | null;
    setUser: React.Dispatch<React.SetStateAction<userInterface | null>>;
}

// We initialize with `undefined` so our custom hook can detect misuse outside the provider.
const UserContext = createContext<UserContextInterface | undefined>(undefined);

/**
 * Hook to read and update the current authenticated user from context.
 * Why this check? Throwing makes misuse obvious if someone calls this hook
 * outside of `UserProvider`, rather than failing silently.
 */
export const UseUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider.");
    }
    return context;
};

/**
 * UserProvider wraps part of the React tree and provides user auth state.
 *
 * Props:
 * - initialUser: Optional user object, e.g., provided from server-side/route handler.
 * - children: React nodes to render within the provider.
 *
 * Behavior:
 * - Initializes state from `initialUser` when available to avoid flicker.
 * - If `user` is null on mount, it calls `checkAuthStatus()` to lazily revalidate
 *   the session and populate the user. On failure, it explicitly sets `user` to null.
 */
export const UserProvider = ({
    initialUser,
    children,
}: {
    initialUser?: userInterface | null;
    children: React.ReactNode;
}) => {
    // Initialize local state from optional `initialUser`. If not provided, start as null.
    const [user, setUser] = useState<userInterface | null>(initialUser ?? null);

    useEffect(() => {
        // Re-validate the user only when we don't already have one.
        const revalidateUser = async () => {
            try {
                // `checkAuthStatus` should return `{ user: userInterface | null }`.
                // We accept the server's truth and sync local state accordingly.
                const res = await checkAuthStatus();
                setUser(res.user);
            } catch {
                // Why set null? Any error (network/expired session) means we shouldn't
                // keep a stale user in memory; downstream components can react to null.
                setUser(null)
            }
        }
        if (!user) {
            revalidateUser();
        }
    }, [user])

    // Provide both the user and a setter so consumers can update auth state
    // (e.g., after login/logout/profile update) without refetching.
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
    
};