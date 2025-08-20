
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Edit, Loader2, Sparkles, Users, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateContactInfo, updateUserEmail } from '@/lib/api';
import type { UpdateContactInfoPayload, UpdateEmailPayload } from '@/types/domain';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getRecommendations } from '@/app/recommendations/actions';
import type { RecommendClubsAndEventsOutput } from '@/ai/flows/recommend-clubs-and-events';


const contactInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    universityName: z.string().optional(),
    studentId: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
});

const emailSchema = z.object({
    newEmail: z.string().email('Please enter a valid email address.'),
});

const personalizationSchema = z.object({
  userActivity: z.string().min(10, {
    message: 'Please tell us a bit more about your interests (at least 10 characters).',
  }),
});


function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="1em"
        height="1em"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.61,44,29.863,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    )
}
  
function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            {...props}
        >
            <path d="M19.16,11.4a3.63,3.63,0,0,0-3.32-2.1,4,4,0,0,0-3.72,2.2,3.8,3.8,0,0,0-1.26-2.1,3.58,3.58,0,0,0-3.32-1.8,4.57,4.57,0,0,0-4,3.2A6.1,6.1,0,0,0,5.2,16.8a5.21,5.21,0,0,0,4.2,2.3,3.48,3.48,0,0,0,3-1.8,3.67,3.67,0,0,0,2.6,1.8,5.17,5.17,0,0,0,4.1-2.3A5.85,5.85,0,0,0,19.16,11.4ZM12,6.22A3.29,3.29,0,0,0,13.38,5a3.17,3.17,0,0,1,2.2,1.2,3.42,3.42,0,0,1-1.3,4.9,3.22,3.22,0,0,1-2.7-1.1A3.2,3.2,0,0,0,12,6.22Z" />
        </svg>
    )
}

function PersonalizationTabContent() {
  const [recommendations, setRecommendations] = useState<RecommendClubsAndEventsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof personalizationSchema>>({
    resolver: zodResolver(personalizationSchema),
    defaultValues: {
      userActivity: '',
    },
  });

  async function onSubmit(data: z.infer<typeof personalizationSchema>) {
    setIsLoading(true);
    setRecommendations(null);
    const result = await getRecommendations(data);
    if (result.success && result.data) {
      setRecommendations(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An unexpected error occurred.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Personalization</CardTitle>
        <CardDescription>
          Describe your hobbies, academic interests, or past activities, and our AI will suggest clubs and events you might love.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Interests & Activities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'I love competitive programming, hiking on weekends, and I'm studying marketing...'"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </form>
        </Form>

        {recommendations && (
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Users className="text-primary"/>
                  Suggested Clubs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.recommendedClubs.map((club) => (
                    <li key={club}>{club}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Calendar className="text-primary"/>
                  Suggested Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.recommendedEvents.map((event) => (
                    <li key={event}>{event}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [isContactInfoLoading, setIsContactInfoLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const contactForm = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '(123) 456-7890',
      universityName: 'Nexus University',
      studentId: '123456789',
      address: {
        street: '123 University Ave',
        city: 'Metropolis',
        state: 'California',
        zip: '90210',
        country: 'us',
      },
    },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: '',
    },
  });

  async function onContactInfoSubmit(data: z.infer<typeof contactInfoSchema>) {
    setIsContactInfoLoading(true);
    try {
      await updateContactInfo(data as UpdateContactInfoPayload);
      toast({
        title: 'Success',
        description: 'Your contact information has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update contact information.',
      });
    } finally {
      setIsContactInfoLoading(false);
    }
  }

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsEmailLoading(true);
    try {
      await updateUserEmail(data as UpdateEmailPayload);
      toast({
        title: 'Success',
        description: 'Your email has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update email.',
      });
    } finally {
      setIsEmailLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your public profile and account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            This is your public-facing avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4"/>
                Change Picture
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="contact">
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onContactInfoSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      This information will be used for verification and communication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={contactForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={contactForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={contactForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <FormField
                        control={contactForm.control}
                        name="universityName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>University Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Nexus University" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={contactForm.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student ID</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <div className="space-y-2 pt-2">
                       <Label>Home Address</Label>
                       <div className="space-y-4">
                         <FormField
                            control={contactForm.control}
                            name="address.street"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground">Street Address</FormLabel>
                                <FormControl>
                                <Input placeholder="123 University Ave" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                         />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={contactForm.control}
                                name="address.city"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">City</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Metropolis" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contactForm.control}
                                name="address.state"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">State / Province</FormLabel>
                                    <FormControl>
                                    <Input placeholder="California" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={contactForm.control}
                                name="address.zip"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Postal Code</FormLabel>
                                    <FormControl>
                                    <Input placeholder="90210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contactForm.control}
                                name="address.country"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Country</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="us">United States</SelectItem>
                                        <SelectItem value="ca">Canada</SelectItem>
                                        <SelectItem value="gb">United Kingdom</SelectItem>
                                        <SelectItem value="au">Australia</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                       </div>
                     </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isContactInfoLoading}>
                        {isContactInfoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
        </TabsContent>
        <TabsContent value="email">
          <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Email Settings</CardTitle>
                        <CardDescription>
                            Manage your email preferences and connected accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-email">Current Email</Label>
                            <Input id="current-email" type="email" readOnly value="user@university.edu" />
                        </div>
                        <FormField
                            control={emailForm.control}
                            name="newEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="new.email@university.edu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isEmailLoading}>
                            {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Email Settings
                        </Button>
                    </CardFooter>
                </Card>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password here. Choose a strong one!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="personalization">
          <PersonalizationTabContent />
        </TabsContent>
        <TabsContent value="account">
            <Card>
                <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>
                        Manage your account settings, including account deletion.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold">Connected Accounts</h3>
                     <p className="text-sm text-muted-foreground">Link your university account to other services for easier sign-in.</p>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="w-full">
                           <GoogleIcon className="mr-2 h-5 w-5" />
                           Connect with Google
                        </Button>
                        <Button variant="outline" className="w-full">
                            <AppleIcon className="mr-2 h-5 w-5" />
                            Connect with Apple
                        </Button>
                     </div>
                  </div>
                   <Separator />
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action is irreversible.
                     </p>
                     <Button variant="destructive">Delete My Account</Button>
                  </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    