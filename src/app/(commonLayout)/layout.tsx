import PublicFooter from "@/components/modules/shared/PublicFooter";
import PublicNavbar from "@/components/modules/shared/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <PublicNavbar />
            {children}
            <PublicFooter/>
        </>
    );
};

export default CommonLayout;