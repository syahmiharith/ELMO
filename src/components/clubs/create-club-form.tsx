
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { universities } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
    name: z.string().min(3, { message: "Club name must be at least 3 characters." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }),
    universityId: z.string({ required_error: "Please select a university." }),
    logo: z.any().optional(),
});

export function CreateClubForm() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Creating club:", values);
        console.log(`The creator, ${user?.name.display}, is automatically assigned as the owner.`);
        toast({
            title: "Club Submitted for Approval",
            description: `${values.name} has been created and is waiting for approval from a Super Admin.`,
        });
        router.push("/dashboard/clubs");
    }

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="pt-6 space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Club Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Astronomy Club" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="universityId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>University</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select the club's university" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {universities.map(uni => (
                                                <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                        <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Club Logo</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (MAX. 800x400px)</p>
                                                </div>
                                                <Input id="dropzone-file" type="file" className="hidden" {...field} />
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="ml-auto">Submit for Approval</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
