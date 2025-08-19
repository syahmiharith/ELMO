"use client";
import { redirect } from "next/navigation";
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard";
import { ClubManagerDashboard } from "@/components/dashboard/club-manager-dashboard";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
    const { claims, loading, user } = useAuth();

    if (loading) return <div>Loading dashboard…</div>;
    if (!user) redirect("/login");

    // Check claims directly instead of using role string
    const isSuper = !!claims?.superAdmin;
    const isOfficer = claims?.officerOfClub && Object.keys(claims.officerOfClub).length > 0;

    if (isSuper) return <SuperAdminDashboard />;
    if (isOfficer) return <ClubManagerDashboard />;
    return <MemberDashboard />;
}
