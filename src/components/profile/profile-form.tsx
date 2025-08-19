
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from '@elmo/shared-types';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AccountSection } from "./account-section";
import { UniversitySection } from "./university-section";
import { ContactSection } from "./contact-section";
import { PrivacySection } from "./privacy-section";
import { InterestsHandlesSection } from "./interests-handles-section";
import { ClubsSection } from "./clubs-section";
import { Save } from "lucide-react";

const dataUriRegex = /^data:image\/(png|jpeg|gif);base64,([a-zA-Z0-9+/=]+)$/;

// This schema now only includes fields that are USER-EDITABLE.
const profileSchema = z.object({
    name: z.object({
        display: z.string().min(1, "Display name is required.").max(80),
    }),
    photoUrl: z.union([
        z.string().url("Please enter a valid URL."),
        z.string().regex(dataUriRegex, "Invalid image format."),
        z.literal('')
    ]).optional(),
    timezone: z.string().min(1, "Timezone is required."),
    preferredLanguage: z.string().min(1, "Preferred language is required."),
    contact: z.object({
        phone: z.string().optional(),
    }),
    pronouns: z.string().optional(),
    visibility: z.object({
        level: z.enum(["private", "club", "public"]),
    }),
    handles: z.object({
        discord: z.string().optional(),
        telegram: z.string().optional(),
        instagram: z.string().optional(),
        slack: z.string().optional(),
    }).refine(obj => Object.values(obj).filter(Boolean).length <= 4, {
        message: "You can have a maximum of 4 handles.",
        path: ["base"],
    }),
    interests: z.array(z.object({ value: z.string() })).max(10, "You can have a maximum of 10 interests."),
});


type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        // Default values are mapped from the full user object to the editable fields
        defaultValues: {
            name: {
                display: user.name.display || "",
            },
            photoUrl: user.photoUrl || "",
            timezone: user.timezone || "Asia/Seoul", // Default timezone
            preferredLanguage: user.preferredLanguage || "en",
            contact: {
                phone: user.contact?.phone || "",
            },
            pronouns: user.pronouns || "",
            visibility: {
                level: user.visibility?.level || "club",
            },
            handles: {
                discord: user.handles?.discord || "",
                telegram: user.handles?.telegram || "",
                instagram: user.handles?.instagram || "",
                slack: user.handles?.slack || "",
            },
            interests: user.interests?.map(id => ({ value: id })) || [],
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        // In a real app, this would send ONLY the editable data to the server.
        const submissionData = {
            ...data,
            interests: data.interests.map(item => item.value),
        };
        console.log("Profile updated with editable data:", submissionData);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    };

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <AccountSection />
                            {/* Pass the full user object to UniversitySection to display locked data */}
                            <UniversitySection user={user} />
                            <ContactSection email={user.email} />
                            <PrivacySection />
                            <InterestsHandlesSection />
                        </div>
                        <div className="lg:col-span-1 space-y-8">
                            <ClubsSection memberships={user.memberships || []} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="rounded-full">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>

                </form>
            </Form>
        </FormProvider>
    );
}

