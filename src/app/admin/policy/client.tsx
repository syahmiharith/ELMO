
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Loader2, Edit, BookOpen, Send, Eye, Archive, FileText, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listPolicies, createPolicy, updatePolicy } from '@/lib/api';
import type { Policy, CreatePolicyPayload } from '@/types/domain';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/context/auth-context';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const policySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  category: z.string().min(1, "Category is required."),
  scope: z.string().min(1, "Scope is required."),
});

function PolicyViewDialog({ policy, children }: { policy: Policy; children: React.ReactNode }) {
    const getStatusVariant = (status: Policy['status']) => {
        switch (status) {
        case 'published':
            return 'success';
        case 'draft':
            return 'secondary';
        case 'archived':
            return 'outline';
        default:
            return 'secondary';
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-3xl p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="font-headline text-2xl">Policy: {policy.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-6">
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div className="flex flex-col">
                            <dt className="font-medium text-muted-foreground">Category</dt>
                            <dd><Badge variant="outline" className="capitalize">{policy.category}</Badge></dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="font-medium text-muted-foreground">Scope</dt>
                            <dd className="capitalize">{policy.scope}</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="font-medium text-muted-foreground">Effective</dt>
                            <dd><ClientFormattedDate date={policy.updatedAt} options={{ dateStyle: 'long' }} /></dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="font-medium text-muted-foreground">Status</dt>
                            <dd><Badge variant={getStatusVariant(policy.status)} className="capitalize">{policy.status}</Badge></dd>
                        </div>
                    </dl>
                    
                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-muted/50">
                           <p>{policy.content}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />Attachments</h3>
                         <div className="p-4 border rounded-md text-sm text-muted-foreground">
                           No attachments.
                        </div>
                    </div>
                    
                    <div>
                         <h3 className="font-semibold mb-2 flex items-center gap-2"><History className="size-4 text-muted-foreground" />Audit Trail</h3>
                         <div className="p-4 border rounded-md text-sm text-muted-foreground">
                           No changes have been logged for this policy yet.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PolicyForm({
  policy,
  onSave,
  children,
}: {
  policy?: Policy;
  onSave: (data: Policy) => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof policySchema>>({
    resolver: zodResolver(policySchema),
    defaultValues: policy || { title: '', content: '', category: 'general', scope: 'global' },
  });

  const onSubmit = async (values: z.infer<typeof policySchema>) => {
    setIsLoading(true);
    try {
      let savedPolicy: Policy;
      if (policy) {
        savedPolicy = await updatePolicy(policy.id, values);
      } else {
        const payload: CreatePolicyPayload = { ...values, authorId: user.id };
        savedPolicy = await createPolicy(payload);
      }
      toast({
        title: policy ? 'Policy Updated' : 'Policy Created',
        description: 'The policy has been successfully saved.',
      });
      onSave(savedPolicy);
      setIsOpen(false);
      if (!policy) form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the policy. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit' : 'Create'} Policy</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Code of Conduct" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="membership">Membership</SelectItem>
                                <SelectItem value="events">Events</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Scope</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a scope" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="global">Global</SelectItem>
                                <SelectItem value="university">University</SelectItem>
                                <SelectItem value="club">Club-specific</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
           
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the full policy content here..."
                      className="min-h-[250px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PolicyClient() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await listPolicies();
      setPolicies(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load policies.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSave = (savedPolicy: Policy) => {
    setPolicies((prev) => {
      const existing = prev.find((p) => p.id === savedPolicy.id);
      if (existing) {
        return prev.map((p) => (p.id === savedPolicy.id ? savedPolicy : p));
      }
      return [savedPolicy, ...prev];
    });
  };

  const handlePublish = async (policy: Policy) => {
     setActionLoading(prev => ({...prev, [`publish-${policy.id}`]: true}));
    try {
        const newStatus = policy.status === 'published' ? 'draft' : 'published';
        await updatePolicy(policy.id, { status: newStatus });
        toast({
            title: newStatus === 'published' ? 'Policy Published' : 'Policy Unpublished',
            description: `The policy "${policy.title}" is now ${newStatus}.`
        });
        fetchPolicies(); // Refetch to get updated list
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update policy status.',
        });
    } finally {
         setActionLoading(prev => ({...prev, [`publish-${policy.id}`]: false}));
    }
  }

  const handleArchive = async (policy: Policy) => {
      setActionLoading(prev => ({...prev, [`archive-${policy.id}`]: true}));
      try {
        const newStatus = policy.status === 'archived' ? 'draft' : 'archived';
        await updatePolicy(policy.id, { status: newStatus });
         toast({
            title: newStatus === 'archived' ? 'Policy Archived' : 'Policy Restored',
            description: `The policy "${policy.title}" has been ${newStatus}.`
        });
        fetchPolicies();
      } catch(error) {
           toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to archive policy.',
            });
      } finally {
          setActionLoading(prev => ({...prev, [`archive-${policy.id}`]: false}));
      }
  }

  const getStatusVariant = (status: Policy['status']) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  }


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="mt-4 text-muted-foreground">Loading Policies...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Policies</h1>
          <p className="text-muted-foreground">Manage global and university-specific policies.</p>
        </div>
        <PolicyForm onSave={handleSave}>
            <Button>
                <PlusCircle className="mr-2" />
                Create Policy
            </Button>
        </PolicyForm>
      </header>

      {policies.length > 0 ? (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                    {policies.map((policy) => {
                        const isPublishing = actionLoading[`publish-${policy.id}`];
                        const isArchiving = actionLoading[`archive-${policy.id}`];
                        const isPublished = policy.status === 'published';
                        const isArchived = policy.status === 'archived';

                        return (
                        <div key={policy.id} className="grid grid-cols-3 md:grid-cols-5 items-center p-4 gap-4">
                            <div className="col-span-2 md:col-span-2">
                                <p className="font-semibold">{policy.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Last updated on <ClientFormattedDate date={policy.updatedAt} options={{ dateStyle: 'long' }} />
                                </p>
                            </div>
                            <div className="hidden md:block text-sm text-muted-foreground capitalize">
                                <Badge variant="outline">{policy.category}</Badge>
                            </div>
                            <div className="flex justify-center">
                                <Badge variant={getStatusVariant(policy.status)} className="capitalize w-24 justify-center">
                                    {policy.status}
                                </Badge>
                            </div>
                            <div className="flex justify-end gap-2">
                                <PolicyViewDialog policy={policy}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye/></Button>
                                </PolicyViewDialog>
                                <PolicyForm policy={policy} onSave={handleSave}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit /></Button>
                                </PolicyForm>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublish(policy)} disabled={isPublishing || isArchived}>
                                    {isPublishing ? <Loader2 className="animate-spin" /> : <Send />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchive(policy)} disabled={isArchiving}>
                                    {isArchiving ? <Loader2 className="animate-spin" /> : <Archive />}
                                </Button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BookOpen className="size-12 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Policies Found</h3>
            <p className="text-muted-foreground mt-1">Get started by creating your first policy.</p>
        </Card>
      )}
    </div>
  );
}
