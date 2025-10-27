import PublicNavbar from "@/components/modules/shared/navbars/public/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <PublicNavbar />
            {children}
            
        </>
    );
};

export default CommonLayout;