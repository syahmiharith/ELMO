"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, Role } from '@elmo/shared-types';
import { mockUsers } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getIdTokenResult } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    role: Role | null;
    loading: boolean;
    claims: Record<string, any> | null;
    login: (role: Role) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const determineRoleFromClaims = (claims: Record<string, any> | null): Role | null => {
    if (!claims) return null;
    if (claims.superAdmin) return 'superAdmin';
    if (claims.officerOfClub && Object.keys(claims.officerOfClub).length > 0) return 'clubManager';
    return 'member';
}

const testUserEmails: Record<Role, string> = {
    member: 'user_test@example.com',
    clubManager: 'club_test@example.com',
    superAdmin: 'super_test@example.com',
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [claims, setClaims] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Set up Firebase auth state listener
        const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                try {
                    // Get the token result which includes custom claims
                    const idTokenResult = await getIdTokenResult(fbUser);
                    const userClaims = idTokenResult.claims;
                    setClaims(userClaims);

                    // Determine role from claims
                    const userRole = determineRoleFromClaims(userClaims);
                    setRole(userRole);

                    // For test mode, get the mock user data
                    // In a real app, you'd fetch user data from Firestore instead
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                } catch (error) {
                    console.error("Error getting ID token claims:", error);
                }
            } else {
                setClaims(null);
                setRole(null);
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = useCallback((selectedRole: Role) => {
        setLoading(true);
        // Find the mock user that corresponds to the role
        const userEmail = testUserEmails[selectedRole];
        const mockUser = mockUsers.find(u => u.email === userEmail);

        if (mockUser) {
            setUser(mockUser);

            // In a real app, this is where you would sign in with Firebase Auth
            // and the custom claims would be set by a Cloud Function

            // For test mode, we'll simulate claims based on the role
            const mockClaims: Record<string, any> = {};

            if (selectedRole === 'superAdmin') {
                mockClaims.superAdmin = true;
            } else if (selectedRole === 'clubManager') {
                mockClaims.officerOfClub = { 'club-1': true, 'club-2': true };
            }

            setClaims(mockClaims);
            setRole(selectedRole);
            localStorage.setItem('user', JSON.stringify(mockUser));
            router.push('/dashboard');
        } else {
            console.error("Test user for role not found:", selectedRole);
        }

        setLoading(false);
    }, [router]);

    const logout = useCallback(() => {
        // In a real app, you would sign out from Firebase Auth
        // auth.signOut();

        setUser(null);
        setRole(null);
        setClaims(null);
        localStorage.removeItem('user');
        router.push("/");
    }, [router]);

    const value = {
        user,
        firebaseUser,
        role,
        claims,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

