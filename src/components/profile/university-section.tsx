
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { universities } from "@/lib/mock-data";
import { User } from '@elmo/shared-types';
import { Lock, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface UniversitySectionProps {
    user: User;
}

const getVerificationBadge = (status: User['verificationStatus']) => {
    switch (status) {
        case 'verified': return <Badge variant="default">Verified</Badge>;
        case 'pending': return <Badge variant="secondary">Pending Review</Badge>;
        case 'unverified':
        default:
            return <Badge variant="destructive">Unverified</Badge>;
    }
}


export function UniversitySection({ user }: UniversitySectionProps) {
    const isVerified = user.verificationStatus === 'verified';
    const selectedUniversityIds = new Set(user.universityIds || []);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>University & Verification</CardTitle>
                        <CardDescription>
                            Your academic information is locked after verification.
                        </CardDescription>
                    </div>
                    {getVerificationBadge(user.verificationStatus)}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormItem>
                    <FormLabel className="flex items-center">
                        {isVerified && <Lock className="w-3 h-3 mr-2" />}
                        Your Universities
                    </FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between h-auto",
                                        !user.universityIds?.length && "text-muted-foreground"
                                    )}
                                    disabled
                                >
                                    <div className="flex flex-wrap gap-1">
                                        {user.universityIds?.length ? user.universityIds.map(uniId => {
                                            const university = universities.find(u => u.id === uniId);
                                            return <Badge variant="secondary" key={uniId}>{university?.name}</Badge>;
                                        }) : "No universities selected"}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search universities..." />
                                <CommandList>
                                    <CommandEmpty>No university found.</CommandEmpty>
                                    <CommandGroup>
                                        {universities.map(uni => (
                                            <CommandItem
                                                value={uni.name}
                                                key={uni.id}
                                                disabled={true}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedUniversityIds.has(uni.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {uni.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormDescription>
                        Contact support to change your university affiliation.
                    </FormDescription>
                </FormItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel className="flex items-center">
                            {isVerified && <Lock className="w-3 h-3 mr-2" />}
                            Student ID
                        </FormLabel>
                        <FormControl>
                            <Input readOnly disabled value={user.studentId || "Not provided"} />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel className="flex items-center">
                            {isVerified && <Lock className="w-3 h-3 mr-2" />}
                            Major / Department
                        </FormLabel>
                        <FormControl>
                            <Input readOnly disabled value={user.major || "Not provided"} />
                        </FormControl>
                    </FormItem>
                </div>
                <FormItem>
                    <FormLabel className="flex items-center">
                        {isVerified && <Lock className="w-3 h-3 mr-2" />}
                        Graduation Year
                    </FormLabel>
                    <FormControl>
                        <Input readOnly disabled type="number" value={user.graduationYear || ""} />
                    </FormControl>
                </FormItem>
                <Button disabled className="w-full">Request Change to University Details</Button>
            </CardContent>
        </Card>
    );
}

