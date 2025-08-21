
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Sparkles,
  Ticket,
  Settings,
  User,
  Compass,
  Heart,
  Shield,
  BarChart,
  ChevronRight,
  CheckSquare,
  FileText,
  List,
  TrendingUp,
  CalendarClock,
} from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/context/auth-context';
import { useFeature } from '@/hooks/use-feature';
import type { FeatureKey } from '@/lib/feature-flags';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: string;
  featureFlag?: FeatureKey;
  subItems?: Omit<NavItem, 'subItems'>[];
};

const navItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, permission: 'view:dashboard', featureFlag: 'dashboard' },
  { href: '/clubs', label: 'Clubs', icon: Compass, permission: 'view:clubs' },
  { href: '/events', label: 'Events', icon: Calendar, permission: 'view:events' },
  {
    href: '/tickets',
    label: 'Ticket',
    icon: Ticket,
    permission: 'view:tickets',
    featureFlag: 'tickets',
  },
  {
    href: '/admin/overview',
    label: 'Admin Tools',
    icon: Shield,
    permission: 'view:admin',
    subItems: [
        { href: '/admin/membership-requests', label: 'Membership Request', icon: Users, permission: 'view:admin' },
        { href: '/admin/pending-approvals', label: 'Pending Approvals', icon: CheckSquare, permission: 'view:admin' },
        { href: '/admin/scheduled-post', label: 'Scheduled Post', icon: CalendarClock, permission: 'view:admin' },
        { href: '/admin/policy', label: 'Policy', icon: FileText, permission: 'view:admin' },
        { href: '/admin/activity-log', label: 'Activity Log', icon: List, permission: 'view:admin' },
    ]
  },
  {
    href: '/insights',
    label: 'Insights',
    icon: BarChart,
    permission: 'view:admin',
    subItems: [
      { href: '/insights/growth', label: 'Growth', icon: TrendingUp, permission: 'view:admin' },
      { href: '/insights/admin-and-moderators', label: 'Admin and Moderators', icon: Shield, permission: 'view:admin' },
      { href: '/insights/membership', label: 'Membership', icon: Users, permission: 'view:admin' },
    ]
  }
];

export function MainNav() {
  const pathname = usePathname();
  const { permissions } = useAuth();
  const [openAdminTools, setOpenAdminTools] = React.useState(false);
  const [openInsights, setOpenInsights] = React.useState(false);

  const isDashboardEnabled = useFeature('dashboard');
  const isRecommendationsEnabled = useFeature('recommendations');
  const isOrdersEnabled = useFeature('orders');
  const isTicketsEnabled = useFeature('tickets');
  const isProfileEnabled = useFeature('profile');
  const isSettingsEnabled = useFeature('settings');

  const featureFlags: Record<string, boolean> = {
    dashboard: isDashboardEnabled,
    recommendations: isRecommendationsEnabled,
    orders: isOrdersEnabled,
    tickets: isTicketsEnabled,
    profile: isProfileEnabled,
    settings: isSettingsEnabled,
  };

  const filteredNavItems = navItems.filter((item) => {
    const hasPermission = permissions.includes(item.permission);
    // Cast featureFlag to string to avoid TypeScript error, since featureFlags is indexed by string.
    const featureEnabled = item.featureFlag ? featureFlags[item.featureFlag as string] : true;
    return hasPermission && featureEnabled;
  });

  const getCollapsibleState = (href: string) => {
      if (href.startsWith('/admin')) {
          return { isOpen: openAdminTools, setIsOpen: setOpenAdminTools };
      }
      if (href.startsWith('/insights')) {
          return { isOpen: openInsights, setIsOpen: setOpenInsights };
      }
      return { isOpen: false, setIsOpen: () => {} };
  }

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => {
        const { isOpen, setIsOpen } = getCollapsibleState(item.href);
        const isActiveGroup = item.subItems?.some(sub => pathname.startsWith(sub.href));

        return item.subItems ? (
            <Collapsible key={item.href} open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                     <SidebarMenuButton
                        variant="ghost"
                        className="w-full justify-between"
                        isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                        >
                        <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="flex flex-col gap-1 py-1 pl-8">
                        {item.subItems.map(subItem => (
                             <SidebarMenuButton
                                key={subItem.href}
                                asChild
                                variant="ghost"
                                size="sm"
                                isActive={pathname === subItem.href}
                                className="w-full justify-start"
                            >
                                <Link href={subItem.href}>
                                    <subItem.icon />
                                    <span>{subItem.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        ) : (
            <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                tooltip={item.label}
            >
                <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  );
}
