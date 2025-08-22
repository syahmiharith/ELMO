
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
import Image from 'next/image';

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
        <div className="flex-1 flex justify-center items-center pt-8 p-4 text-xs text-center text-muted-foreground group-data-[collapsible=icon]:hidden">
            <div className="flex flex-col items-center gap-2">
                <Image src="data:image/jpeg;base64,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" alt="Empty state image of a pointing cat." width={64} height={64} className="size-24 rounded-full object-cover" unoptimized />
                <p>wow, so empty</p>
            </div>
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
