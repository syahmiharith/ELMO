
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function PrivacySection() {
    const { control } = useFormContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy & Representation</CardTitle>
                <CardDescription>
                    Control how you are seen by others on the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={control}
                    name="visibility.level"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Profile Visibility</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="public" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Public (Visible to everyone)
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="club" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Club Members (Visible only to members of your clubs)
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="private" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Private (Visible only to you and admins)
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="pronouns"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pronouns</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., she/her, they/them" {...field} />
                            </FormControl>
                            <FormDescription>
                                Sharing your pronouns helps create an inclusive environment.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
