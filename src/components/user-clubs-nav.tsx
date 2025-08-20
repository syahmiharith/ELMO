
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Users } from 'lucide-react';
import { listMyClubs } from '@/lib/api';
import type { Club } from '@/types/domain';

export function UserClubsNav() {
  const pathname = usePathname();
  const [userClubs, setUserClubs] = React.useState<Club[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        const clubs = await listMyClubs();
        setUserClubs(clubs);
      } catch (error) {
        // In a real app, you might want to show a toast notification
        console.error('Failed to load user clubs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  if (isLoading) {
    // You can add a skeleton loader here
    return null;
  }

  if (userClubs.length === 0) {
    return (
        <div className="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            You haven't joined any clubs yet.
        </div>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>My Clubs</SidebarGroupLabel>
      <SidebarMenu>
        {userClubs.map((club) => (
          <SidebarMenuItem key={club.id}>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/clubs/${club.id}`}
              tooltip={club.name}
              size="sm"
              className="group-data-[collapsible=icon]:justify-start"
            >
              <Link href={`/clubs/${club.id}`}>
                <Avatar className="size-4">
                  <AvatarImage src={club.imageUrl} alt={club.name} data-ai-hint="club logo" />
                  <AvatarFallback>
                    <Users />
                  </AvatarFallback>
                </Avatar>
                <span>{club.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
