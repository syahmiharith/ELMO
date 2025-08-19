
import { TestLoginForm } from "@/components/auth/test-login-form";
import { Globe } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Globe className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-center tracking-tight font-headline">
                    Welcome to ClubNexus
                </h1>
                <p className="text-muted-foreground text-center max-w-sm">
                    Select a user role to sign in for testing.
                </p>
            </div>
            <TestLoginForm />
        </main>
    );
}
