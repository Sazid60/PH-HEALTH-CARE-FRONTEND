
import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";

const CommonDashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* <h1>Dashboard Sidebar</h1> */}
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* <h1>Dashboard Navbar</h1> */}
                <DashboardNavbar />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                    <div className="">{children}</div>
                </main>

            </div>
        </div>
    );
};



export default CommonDashboardLayout;