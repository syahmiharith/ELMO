
"use client";

import { useFormContext } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ContactSectionProps {
    email: string | undefined;
}

export function ContactSection({ email }: ContactSectionProps) {
    const { control } = useFormContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                    Your email is linked to your account. Phone is optional.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input readOnly disabled value={email} />
                    </FormControl>
                    <FormDescription>
                        Your email is used for authentication and cannot be changed here.
                    </FormDescription>
                </FormItem>
                <FormField
                    control={control}
                    name="contact.phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormDescription>
                                Used for critical notifications if enabled.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
