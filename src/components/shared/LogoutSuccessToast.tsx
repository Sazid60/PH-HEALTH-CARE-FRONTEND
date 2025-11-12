"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const LogoutSuccessToast = () => {
    const searchParams = useSearchParams()

    const router = useRouter()

    useEffect(() => {
        console.log(searchParams.get("loggedOut"))

        if (searchParams.get("loggedOut") === "true") {
            console.log("Logout successful toast");
            toast.success("You have been logged out successfully.");
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("loggedOut");
            router.replace(newUrl.toString());
        }
    }, [searchParams, router]);

    return null
};

export default LogoutSuccessToast;