
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
} from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { useFeature } from '@/hooks/use-feature';
import type { FeatureKey } from '@/lib/feature-flags';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: string;
  featureFlag?: FeatureKey;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'view:dashboard', featureFlag: 'dashboard' },
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
    href: '/profile',
    label: 'Profile',
    icon: User,
    permission: 'view:profile',
    featureFlag: 'profile',
  },
    {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    permission: 'view:settings',
    featureFlag: 'settings',
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { permissions } = useAuth();

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

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
