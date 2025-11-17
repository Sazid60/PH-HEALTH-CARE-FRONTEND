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