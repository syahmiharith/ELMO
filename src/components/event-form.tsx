
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Image as ImageIcon, DollarSign } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { createEvent, listMyClubs } from '@/lib/api';
import type { CreateEventPayload, Event as ClubEvent, Club } from '@/types/domain';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const eventFormSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters.'),
  description: z.string().optional(),
  locationType: z.enum(['in-person', 'virtual', 'none']).default('none'),
  location: z.string().optional(),
  virtualEventType: z.enum(['external-link', 'other']).optional(),
  virtualEventLink: z.string().url('Please enter a valid URL.').optional(),
  startDate: z.date({ required_error: 'A start date is required.' }),
  startTime: z.string({ required_error: 'A start time is required.' }),
  startTimezone: z.string().optional(),
  endDate: z.date({ required_error: 'An end date is required.' }),
  endTime: z.string({ required_error: 'An end time is required.' }),
  endTimezone: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  clubId: z.string().optional(),
  price: z.coerce.number().min(0, "Price can't be negative.").default(0),
  rsvpFlow: z.enum(['FREE', 'PAID']).default('FREE'),
})
.refine(data => {
    if (data.locationType === 'in-person') {
        return !!data.location && data.location.length > 0;
    }
    return true;
}, {
    message: 'Location is required for in-person events.',
    path: ['location'],
})
.refine(data => {
    if (data.locationType === 'virtual' && data.virtualEventType === 'external-link') {
        return !!data.virtualEventLink && data.virtualEventLink.length > 0;
    }
    return true;
}, {
    message: 'An external link is required.',
    path: ['virtualEventLink'],
});


type EventFormProps = {
  clubId?: string;
  onEventCreated: (newEvent: ClubEvent) => void;
  children: React.ReactNode; // For the trigger button
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventForm({
  clubId,
  onEventCreated,
  children,
  open,
  onOpenChange
}: EventFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [adminClubs, setAdminClubs] = useState<Club[]>([]);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      clubId: clubId || '',
      location: '',
      locationType: 'none',
      startTime: '19:00',
      endTime: '21:00',
      price: 0,
      rsvpFlow: 'FREE',
    },
     mode: 'onChange',
  });

  const locationType = form.watch('locationType');
  const virtualEventType = form.watch('virtualEventType');
  const price = form.watch('price');

  useEffect(() => {
    form.setValue('rsvpFlow', price > 0 ? 'PAID' : 'FREE');
  }, [price, form]);

  useEffect(() => {
    if (!clubId && open) {
      listMyClubs().then(setAdminClubs).catch(() => {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load your clubs.',
        });
      });
    }
  }, [clubId, open, toast]);
  
  const combineDateAndTime = (date: Date, time: string): Date => {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
  }

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    setIsLoading(true);
    try {
      const finalClubId = clubId || values.clubId;
      if (!finalClubId) {
        toast({
          variant: 'destructive',
          title: 'Club not selected',
          description: 'Please select a club to create the event for.',
        });
        setIsLoading(false);
        return;
      }

      const payload: CreateEventPayload = {
        name: values.name,
        description: values.description || '',
        date: combineDateAndTime(values.startDate, values.startTime).toISOString(),
        // TODO: Add end date to payload
        location: values.locationType === 'in-person' ? values.location! : 'Virtual',
        locationDetails: values.locationType === 'virtual' 
            ? { type: values.virtualEventType!, link: values.virtualEventLink }
            : undefined,
        imageUrl: values.imageUrl || 'https://placehold.co/600x400.png',
        // Default values for the backend
        status: 'scheduled',
        rsvpFlow: values.rsvpFlow,
        price: values.price * 100, // Convert to cents
        rsvpCount: 0,
      };

      const newEvent = await createEvent(finalClubId, payload);
      
      const fullNewEvent: ClubEvent = {
        ...newEvent,
        viewerRsvpStatus: 'none',
        rsvpCount: 0,
        status: 'scheduled',
        highlights: [],
      };


      toast({
        title: 'Event Created!',
        description: `"${newEvent.name}" has been successfully created.`,
      });
      
      onEventCreated(fullNewEvent);
      form.reset();
      onOpenChange(false);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Creating Event',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 text-center">
            <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>

        <div className="relative h-40 w-full">
            <Image 
                src="https://placehold.co/800x240.png" 
                alt="Event cover photo placeholder" 
                fill
                className="object-cover"
                data-ai-hint="event poster"
            />
            <div className="absolute bottom-2 right-2">
                <Button variant="secondary" size="sm">
                    <ImageIcon className="mr-2" />
                    Edit
                </Button>
            </div>
        </div>
        
        <div className="px-6 pt-1 pb-1">
          <div className="flex items-center gap-2">
              <Avatar className="size-6">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <p className="font-semibold text-xs">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Event Organizer</p>
              </div>
          </div>
        </div>
        
        <div className="px-6 pb-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <ScrollArea className="h-[35vh] pr-4 -mr-4">
                    <div className="space-y-1 py-2">
                     
                    {!clubId && (
                        <FormField
                        control={form.control}
                        name="clubId"
                        render={({ field }) => (
                            <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a club" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {adminClubs.map(club => (
                                    <SelectItem key={club.id} value={club.id}>
                                        {club.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Input placeholder="Event Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="space-y-1">
                        <Label>Start Date</Label>
                        <div className="grid grid-cols-3 gap-2">
                             <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                <FormItem>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            {field.value ? (
                                            format(field.value, 'MM/dd/yyyy')
                                            ) : (
                                            <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date('1900-01-01')
                                        }
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="startTimezone"
                                render={({ field }) => (
                                    <FormItem>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Timezone" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pst">PST</SelectItem>
                                                <SelectItem value="est">EST</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                     <div className="space-y-1">
                        <Label>End Date</Label>
                        <div className="grid grid-cols-3 gap-2">
                             <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                <FormItem>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            {field.value ? (
                                            format(field.value, 'MM/dd/yyyy')
                                            ) : (
                                            <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date('1900-01-01')
                                        }
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="endTimezone"
                                render={({ field }) => (
                                    <FormItem>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Timezone" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pst">PST</SelectItem>
                                                <SelectItem value="est">EST</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                     <FormField
                        control={form.control}
                        name="locationType"
                        render={({ field }) => (
                            <FormItem>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none" disabled>Select location type</SelectItem>
                                        <SelectItem value="in-person">In-person</SelectItem>
                                        <SelectItem value="virtual">Virtual</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {locationType === 'in-person' && (
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <Input placeholder="e.g., Grand Auditorium" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                     {locationType === 'virtual' && (
                         <div className="space-y-2">
                             <FormField
                                control={form.control}
                                name="virtualEventType"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="external-link" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            External Link
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="other" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Other
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {virtualEventType === 'external-link' && (
                                <FormField
                                    control={form.control}
                                    name="virtualEventLink"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                        <Input placeholder="https://your-event-link.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                         </div>
                    )}
                    
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="number" 
                                        placeholder="0.00" 
                                        className="pl-8"
                                        step="0.01"
                                        {...field}
                                     />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Textarea
                                placeholder="What is it about?"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <div className="pt-4">
                        <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Event
                        </Button>
                    </div>
                    </div>
                </ScrollArea>
            </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
