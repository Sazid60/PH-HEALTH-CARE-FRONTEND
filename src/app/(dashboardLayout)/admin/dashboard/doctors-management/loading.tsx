import { ManagementPageLoading } from "@/components/shared/ManagementPageLoader";

const DoctorsManagementLoading = () => {
    return (
        <ManagementPageLoading columns={5} hasActionButton={true} filterCount={3} filterWidths={['w-32', 'w-48', 'w-40']} />
    );
};

export default DoctorsManagementLoading;