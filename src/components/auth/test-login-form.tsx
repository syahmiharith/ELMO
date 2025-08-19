
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Role } from '@elmo/shared-types';


export function TestLoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { login } = useAuth();

    const handleLogin = async (role: Role) => {
        setIsLoading(true);
        try {
            login(role); // Use the context login function
            toast({
                title: "Signed In",
                description: `Welcome! You are now logged in as ${role}.`,
            });
        } catch (error: any) {
            console.error(`Sign in error for ${role}:`, error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || `Could not sign in as ${role}.`,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <CardTitle>Test Login</CardTitle>
                <CardDescription>
                    Sign in as a pre-configured test user.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={() => handleLogin('member')} className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    ) : (
                        <><LogIn /> Login as Member</>
                    )}
                </Button>
                <Button onClick={() => handleLogin('clubManager')} className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    ) : (
                        <><LogIn /> Login as Club Manager</>
                    )}
                </Button>
                <Button onClick={() => handleLogin('superAdmin')} className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    ) : (
                        <><LogIn /> Login as Super Admin</>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

