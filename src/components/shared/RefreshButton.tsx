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