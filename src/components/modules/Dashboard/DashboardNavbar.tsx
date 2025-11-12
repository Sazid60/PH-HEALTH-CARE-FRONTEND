
import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;


  return (
    <DashboardNavbarContent
      userInfo={userInfo}
    />
  );
};

export default DashboardNavbar;