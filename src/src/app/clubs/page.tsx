
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Users, PlusCircle, Compass, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Club, ClubQuery } from '@/types/domain';
import { listClubs } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { PersonalizationNudge } from '@/components/personalization-nudge';

const PAGE_SIZE = 4;

function ClubList({ clubs, isLoading, hasMore, onFetchMore }: { clubs: Club[], isLoading: boolean, hasMore: boolean, onFetchMore: () => void }) {
  const { permissions } = useAuth();
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver>();

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onFetchMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onFetchMore]);


  if (isLoading && clubs.length === 0) {
    return <div>Loading...</div>; // TODO: Add skeleton loader
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {clubs.map((club, index) => (
            <Link href={`/clubs/${club.id}`} key={club.id} className="group block h-full">
              <Card
                ref={index === clubs.length - 1 ? lastElementRef : null}
                className={cn(
                'flex flex-col transition-all h-full',
                'bg-transparent shadow-none border-none',
                'group-hover:bg-card group-hover:shadow-lg group-hover:-translate-y-1'
                )}
              >
                <CardHeader className="p-0 relative">
                  <div className="relative aspect-video w-full bg-muted/50 rounded-t-lg flex items-center justify-center">
                      <Logo className="w-24 text-muted-foreground/20" />
                      <Image
                          src={club.imageUrl}
                          alt={club.name}
                          fill
                          className="absolute inset-0 w-full h-full rounded-t-lg object-cover"
                          data-ai-hint="club activity"
                      />
                  </div>
                  {club.isFeatured && (
                      <Badge className="absolute top-2 right-2">Featured</Badge>
                    )}
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pt-6 pb-4">
                  <CardTitle className="font-headline text-xl mb-4">{club.name}</CardTitle>
                  <CardDescription className="flex-1">{club.description}</CardDescription>
                  
                  <div className='mt-4 pt-4 border-t'>
                      <div className="flex items-center justify-between text-sm">
                          <Badge variant="secondary">{club.category}</Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-1" />
                              {club.memberCount} members
                          </div>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      {isLoading && <div className="flex justify-center items-center p-4"><Loader2 className="animate-spin" /></div>}
    </>
  )
}

export default function ClubsPage() {
  const { permissions, user } = useAuth();
  const { toast } = useToast();
  
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [forYouClubs, setForYouClubs] = useState<Club[]>([]);

  const [isLoading, setIsLoading] = useState({ all: true, forYou: true });
  
  const [pages, setPages] = useState({ all: 1, forYou: 1 });
  const [hasMore, setHasMore] = useState({ all: true, forYou: true });
  const [activeTab, setActiveTab] = useState('all-clubs');

  const fetchClubs = useCallback(async (
    query: ClubQuery, 
    setter: React.Dispatch<React.SetStateAction<Club[]>>, 
    currentPage: number,
    listKey: 'all' | 'forYou'
  ) => {
    setIsLoading(prev => ({ ...prev, [listKey]: true }));
    try {
      const clubData = await listClubs({ ...query, page: currentPage, pageSize: PAGE_SIZE });
      if (clubData.length < PAGE_SIZE) {
        setHasMore(prev => ({...prev, [listKey]: false}));
      }
      setter(prev => currentPage === 1 ? clubData : [...prev, ...clubData]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load clubs.',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [listKey]: false }));
    }
  }, [toast]);

  useEffect(() => {
    // Pre-fetch both lists on initial load
    fetchClubs({}, setAllClubs, 1, 'all');
    fetchClubs({ sortBy: 'relevance' }, setForYouClubs, 1, 'forYou'); 
  }, [fetchClubs]);

  const handleFetchMore = () => {
    if (activeTab === 'all-clubs') {
      if (!isLoading.all && hasMore.all) {
        const nextPage = pages.all + 1;
        setPages(prev => ({...prev, all: nextPage}));
        fetchClubs({}, setAllClubs, nextPage, 'all');
      }
    } else if (activeTab === 'for-you') {
      if (!isLoading.forYou && hasMore.forYou && user.isPersonalized) {
        const nextPage = pages.forYou + 1;
        setPages(prev => ({...prev, forYou: nextPage}));
        fetchClubs({ sortBy: 'relevance' }, setForYouClubs, nextPage, 'forYou');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
            Club Directory
            </h1>
            <p className="text-muted-foreground">
            Discover communities that share your passions.
            </p>
        </div>
        {permissions.includes('action:approve-club') && (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Club
            </Button>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <TabsList>
                <TabsTrigger value="all-clubs"><Compass className='mr-2' />All Clubs</TabsTrigger>
                <TabsTrigger value="for-you"><Heart className='mr-2' />For You</TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1" />
                <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="arts-culture">Arts & Culture</SelectItem>
                    <SelectItem value="sports-recreation">Sports & Recreation</SelectItem>
                    <SelectItem value="community-service">Community & Service</SelectItem>
                    <SelectItem value="academic-professional">
                    Academic & Professional
                    </SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>
        <TabsContent value="all-clubs">
            <ClubList clubs={allClubs} isLoading={isLoading.all} hasMore={hasMore.all} onFetchMore={handleFetchMore} />
        </TabsContent>
        <TabsContent value="for-you" className="relative">
             {!user.isPersonalized && <PersonalizationNudge />}
            <div className={cn({ 'blur-sm': !user.isPersonalized })}>
                <ClubList clubs={forYouClubs} isLoading={isLoading.forYou} hasMore={hasMore.forYou} onFetchMore={handleFetchMore}/>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
