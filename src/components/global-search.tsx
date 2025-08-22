
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Search, Loader2, Users, Calendar, Compass, User } from 'lucide-react';
import { listClubs, listEvents, listUsers } from '@/lib/api';
import type { Club, Event as ClubEvent, User as UserType } from '@/types/domain';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { usePathname } from 'next/navigation';

type SearchResult = {
    clubs: Club[];
    events: ClubEvent[];
    users: UserType[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [data, setData] = useState<SearchResult>({ clubs: [], events: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close popover on navigation change
    setIsOpen(false);
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (data.clubs.length === 0) { // Fetch only if data is not already loaded
        const [clubs, events, users] = await Promise.all([
            listClubs(),
            listEvents(),
            listUsers(),
        ]);
        setData({ clubs, events, users });
    }
  }, [data.clubs.length]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!debouncedQuery) {
        return { clubs: [], events: [], users: [] };
    }
    const q = debouncedQuery.toLowerCase();
    return {
        clubs: data.clubs.filter(c => c.name.toLowerCase().includes(q)),
        events: data.events.filter(e => e.name.toLowerCase().includes(q)),
        users: data.users.filter(u => u.name.toLowerCase().includes(q)),
    };
  }, [debouncedQuery, data]);

  const hasResults = useMemo(() => 
    filteredData.clubs.length > 0 || filteredData.events.length > 0 || filteredData.users.length > 0
  , [filteredData]);


  const handleOpenChange = (open: boolean) => {
    setIsOpen(open && query.length > 0);
  };
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (e.target.value.length > 0) {
          setIsOpen(true);
      } else {
          setIsOpen(false);
      }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Search anything..."
            className="pl-10 h-9 bg-muted"
            value={query}
            onChange={handleQueryChange}
            />
            {isLoading && debouncedQuery && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
        {hasResults ? (
            <div className="flex flex-col gap-2">
                {filteredData.clubs.length > 0 && (
                    <div>
                        <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Clubs</h4>
                        {filteredData.clubs.slice(0, 3).map(club => (
                            <Link key={club.id} href={`/clubs/${club.id}`} className="block">
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                    <Avatar className="size-6">
                                        <AvatarImage src={club.imageUrl} alt={club.name} />
                                        <AvatarFallback><Compass /></AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{club.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {filteredData.events.length > 0 && (
                     <div>
                        <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Events</h4>
                        {filteredData.events.slice(0, 3).map(event => (
                            <Link key={event.id} href={`/events/${event.id}`} className="block">
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                     <Avatar className="size-6">
                                        <AvatarFallback><Calendar /></AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{event.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                 {filteredData.users.length > 0 && (
                     <div>
                        <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Users</h4>
                        {filteredData.users.slice(0, 3).map(user => (
                            <Link key={user.id} href={`/profile/${user.id}`} className="block">
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                    <Avatar className="size-6">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{user.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        ) : (
             <div className="p-4 text-center text-sm text-muted-foreground">
                No results for "{debouncedQuery}".
            </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
