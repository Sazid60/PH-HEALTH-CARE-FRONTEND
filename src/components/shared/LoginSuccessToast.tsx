"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const LoginSuccessToast = () => {
    const searchParams = useSearchParams()

    const router = useRouter()



    useEffect(() => {
        console.log(searchParams.get("loggedIn"))

        if (searchParams.get("loggedIn") === "true") {
            console.log("Logged in successful toast");
            toast.success("You have been logged in successfully.");
            // Remove the query parameter from the URL after showing the toast
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("loggedIn");
            router.replace(newUrl.toString());

        }
    }, [searchParams, router]);

    return null
};

export default LoginSuccessToast;