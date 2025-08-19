
"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    ShieldCheck,
    Calendar,
    Heart
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const superAdminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/clubs", label: "Clubs", icon: Building2 },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/approvals", label: "Approvals", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const baseClubManagerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    // "My Club" will be added dynamically
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/members", label: "Members", icon: Users },
];

const baseMemberLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/clubs", label: "Find Clubs", icon: Building2 },
    { href: "/dashboard/events", label: "Find Events", icon: Calendar },
];

export function MainSidebar() {
    const { user, role, logout } = useAuth();
    const pathname = usePathname();

    const managedClubId = useMemo(() => {
        return user?.memberships?.find(m => m.role === 'officer' && m.status === 'approved')?.clubId;
    }, [user?.memberships]);

    const hasJoinedClubs = useMemo(() => {
        return (user?.memberships?.length || 0) > 0;
    }, [user?.memberships]);

    const getLinks = () => {
        switch (role) {
            case "superAdmin":
                return superAdminLinks;
            case "clubManager":
                const managerLinks = [...baseClubManagerLinks];
                if (managedClubId) {
                    managerLinks.splice(1, 0, { href: `/dashboard/clubs/${managedClubId}`, label: "My Club", icon: Building2 });
                }
                return managerLinks;
            case "member":
                const memberLinks = [...baseMemberLinks];
                if (hasJoinedClubs) {
                    memberLinks.splice(1, 0, { href: `/dashboard/clubs?view=my_clubs`, label: "My Clubs", icon: Heart });
                }
                return memberLinks;
            default:
                return [];
        }
    };

    const links = getLinks();

    return (
        <Sidebar collapsible="icon" className="hidden md:flex">
            <SidebarHeader className="h-16 items-center justify-center flex">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg group-data-[collapsible=icon]:hidden">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-primary">Club</span><span className="font-light">Nexus</span>
                </Link>
                <Link href="/dashboard" className="hidden items-center justify-center group-data-[collapsible=icon]:flex">
                    <Building2 className="h-6 w-6 text-primary" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {links.map((link, index) => (
                        <SidebarMenuItem key={`${link.href}-${index}`}>
                            <Link href={link.href} passHref>
                                <SidebarMenuButton asChild isActive={pathname === link.href} tooltip={link.label}>
                                    <span><link.icon /><span>{link.label}</span></span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="flex-col gap-2 p-2 border-t">
                <Link href="/dashboard/profile" className="block p-2 rounded-md transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoUrl} alt={user?.name.display} />
                            <AvatarFallback>{user?.name.display?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold text-foreground">{user?.name.display}</span>
                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                    </div>
                </Link>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout} tooltip="Logout"><LogOut /><span>Logout</span></SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
