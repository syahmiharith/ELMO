
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChangeEvent } from "react";

const timezones = [
    "Asia/Seoul", "America/New_York", "Europe/London", "Australia/Sydney"
];

const languages = [
    { value: 'en', label: 'English' },
    { value: 'ms', label: 'Malay' },
    { value: 'ko', label: 'Korean' },
];

export function AccountSection() {
    const { control, watch, setValue } = useFormContext();
    const photoUrl = watch("photoUrl");
    const displayName = watch("name.display");

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue("photoUrl", reader.result as string, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your display name, photo, and localization settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={control}
                    name="photoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Photo</FormLabel>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={photoUrl} alt={displayName} />
                                    <AvatarFallback>{displayName?.charAt(0) ?? ''}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <FormControl>
                                        <div>
                                            <Button asChild variant="outline" className="cursor-pointer">
                                                <label htmlFor="photo-upload">Edit</label>
                                            </Button>
                                            <Input
                                                id="photo-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/gif"
                                                onChange={handlePhotoChange}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="pt-2">
                                        Upload a new photo (PNG, JPG, GIF).
                                    </FormDescription>
                                    <FormMessage />
                                </div>
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="name.display"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="preferredLanguage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a language" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {languages.map(lang => (
                                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="timezone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timezone</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a timezone" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {timezones.map(tz => (
                                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
