
"use client"
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import HeartbeatLoader from "@/components/shared/HeartbeatLoader";
import { ManagementPageLoading } from "@/components/shared/ManagementPageLoader";

const page = () => {
    return (
        <div>
            <DashboardSkeleton />
            <ManagementPageLoading columns={5} hasActionButton={true} filterCount={3} filterWidths={['w-32', 'w-48', 'w-40']} />
            <HeartbeatLoader />
        </div>
    );
};

export default page;