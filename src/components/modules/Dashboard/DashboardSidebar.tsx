import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";
import DashboardSidebarContent from "./DashboardSidebarContent";
import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { NavSection } from "@/types/dashboard.interface";

const DashboardSidebar = async () => {
    const userInfo = (await getUserInfo()) as UserInfo;

    const navItems : NavSection[] = [];
    const dashboardHome = getDefaultDashboardRoute(userInfo.role);
    return (
        <div>
            <DashboardSidebarContent 
            userInfo={userInfo}
            navItems={navItems}
            dashboardHome={dashboardHome}
            />
        </div>
    );
};

export default DashboardSidebar;