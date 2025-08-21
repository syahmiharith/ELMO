'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

export function AnnouncementsNav() {
  const pathname = usePathname();
  const { permissions } = useAuth();

  if (!permissions.includes('action:create-event')) {
    return null;
  }

  return (
    <Link
      href="/announcements"
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        pathname.startsWith('/announcements') && 'bg-muted text-primary'
      )}
    >
      <Megaphone className="h-4 w-4" />
      Announcements
    </Link>
  );
}
