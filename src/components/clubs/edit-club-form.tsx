
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UploadCloud, Save, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Club } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

// Schema for fields editable by a club manager
const editClubSchema = z.object({
    name: z.string().min(3, { message: "Club name must be at least 3 characters." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }),
    logoUrl: z.string().url().optional().or(z.literal('')),
    bannerUrl: z.string().url().optional().or(z.literal('')),
    // Add other editable fields here based on your spec
});

type EditClubFormValues = z.infer<typeof editClubSchema>;

interface EditClubFormProps {
    club: Club;
}

export function EditClubForm({ club }: EditClubFormProps) {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<EditClubFormValues>({
        resolver: zodResolver(editClubSchema),
        defaultValues: {
            name: club.name || "",
            description: club.description || "",
            logoUrl: club.logoUrl || "",
            bannerUrl: club.bannerUrl || "",
        },
    });

    const isNameChanged = form.watch("name") !== club.name;

    function onSubmit(values: EditClubFormValues) {
        console.log("Updating club:", values);

        if (isNameChanged) {
            toast({
                title: "Changes Submitted for Approval",
                description: `Your change to the club name '${values.name}' has been sent for review by a Super Admin. Other changes have been saved.`,
            });
        } else {
            toast({
                title: "Club Details Updated",
                description: "Your changes have been saved successfully.",
            });
        }

        // In a real app, you would likely navigate away or refetch data
        // router.push(`/dashboard/clubs/${club.id}`);
    }

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Info</CardTitle>
                            <CardDescription>Update your club's name, description, and branding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Club Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Astronomy Club" {...field} />
                                        </FormControl>
                                        {isNameChanged && (
                                            <FormDescription className="text-amber-600 flex items-center gap-2 pt-1">
                                                <AlertTriangle className="h-4 w-4" />
                                                Changing the club name requires Super Admin approval.
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Club Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about your club, its mission, and activities."
                                                className="resize-none"
                                                rows={5}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Club Logo</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                            <p className="text-xs text-muted-foreground">PNG or JPG</p>
                                                        </div>
                                                        <Input id="logo-upload" type="file" className="hidden" />
                                                    </label>
                                                </div>
                                            </FormControl>
                                            <FormDescription>Current logo URL (or upload new):</FormDescription>
                                            <Input placeholder="https://example.com/logo.png" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bannerUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Club Banner</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="banner-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                            <p className="text-xs text-muted-foreground">PNG or JPG</p>
                                                        </div>
                                                        <Input id="banner-upload" type="file" className="hidden" />
                                                    </label>
                                                </div>
                                            </FormControl>
                                            <FormDescription>Current banner URL (or upload new):</FormDescription>
                                            <Input placeholder="https://example.com/banner.png" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Locked Details</CardTitle>
                            <CardDescription>These core settings can only be changed by a Super Admin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Club Status</p>
                                <p><Badge variant={club.status === 'active' ? 'default' : 'secondary'} className="capitalize">{club.status}</Badge></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Featured Status</p>
                                <p><Badge variant={club.isFeatured ? 'default' : 'outline'}>{club.isFeatured ? 'Featured' : 'Not Featured'}</Badge></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Associated University</p>
                                <p className="text-sm">{club.university.name}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" disabled>Request Change to Locked Details</Button>
                        </CardFooter>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </FormProvider>
    );
}

