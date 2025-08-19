import { useAuth } from "@/hooks/use-auth";
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard";
import { ClubManagerDashboard } from "@/components/dashboard/club-manager-dashboard";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";

export default function DashboardPage() {
    const { role } = useAuth();

    const renderDashboard = () => {
        switch (role) {
            case "superAdmin":
                return <SuperAdminDashboard />;
            case "clubManager":
                return <ClubManagerDashboard />;
            case "member":
                return <MemberDashboard />;
            default:
                return <div>Loading dashboard...</div>;
        }
    };

    return <div className="w-full">{renderDashboard()}</div>;
}
