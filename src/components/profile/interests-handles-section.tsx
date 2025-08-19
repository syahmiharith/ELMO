
"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { interestTags } from "@/lib/mock-data";


export function InterestsHandlesSection() {
    const { control } = useFormContext();
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { fields: interestFields, append, remove } = useFieldArray({
        control,
        name: "interests",
    });

    const selectedValues = new Set(interestFields.map((field: any) => field.value));

    const handleSelectInterest = (tagId: string) => {
        if (!selectedValues.has(tagId) && interestFields.length < 10) {
            append({ value: tagId });
        }
    };

    const getInterestName = (tagId: string) => {
        return interestTags.find(tag => tag.id === tagId)?.name || tagId;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Interests & Socials</CardTitle>
                <CardDescription>
                    Help others get to know you and find clubs you might like.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={popoverOpen}
                                className="w-full justify-between"
                                disabled={interestFields.length >= 10}
                            >
                                {interestFields.length >= 10 ? "Maximum tags reached" : "Select interests..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search interests..." />
                                <CommandList>
                                    <CommandEmpty>
                                        <Button variant="ghost" className="w-full">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Request new tag
                                        </Button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {interestTags.map((tag) => (
                                            <CommandItem
                                                key={tag.id}
                                                value={tag.name}
                                                onSelect={() => {
                                                    handleSelectInterest(tag.id);
                                                    setPopoverOpen(false);
                                                }}
                                                disabled={selectedValues.has(tag.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedValues.has(tag.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {tag.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormDescription>Add up to 10 interests to help with club recommendations.</FormDescription>
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[2.25rem]">
                        {interestFields.map((field: any, index) => (
                            <Badge key={field.id} variant="secondary">
                                {getInterestName(field.value)}
                                <button type="button" onClick={() => remove(index)} className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove interest</span>
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <FormMessage />
                </FormItem>
                <div>
                    <FormLabel>Social Handles</FormLabel>
                    <FormDescription>Optionally add your social media handles.</FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <FormField
                            control={control}
                            name="handles.discord"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Discord</FormLabel>
                                    <FormControl>
                                        <Input placeholder="username#1234" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="handles.instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Instagram</FormLabel>
                                    <FormControl>
                                        <Input placeholder="@username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="handles.telegram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Telegram</FormLabel>
                                    <FormControl>
                                        <Input placeholder="@username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="handles.slack"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">Slack</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Member ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
