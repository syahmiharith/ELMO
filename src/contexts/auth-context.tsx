"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { User, Role } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import type { User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    role: Role | null;
    loading: boolean;
    login: (role: Role) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const determineRole = (user: User | null): Role | null => {
    if (!user) return null;
    if (user.roleHint === 'superAdmin') return 'superAdmin';
    if (user.memberships?.some(m => (m.role === 'officer' || m.role === 'owner') && m.status === 'approved')) return 'clubManager';
    return 'member';
}

const testUserEmails: Record<Role, string> = {
    member: 'user_test@example.com',
    clubManager: 'club_test@example.com',
    superAdmin: 'super_test@example.com',
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for saved user in local storage on initial load
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setRole(determineRole(parsedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback((selectedRole: Role) => {
        setLoading(true);
        // Find the mock user that corresponds to the role
        const userEmail = testUserEmails[selectedRole];
        const mockUser = mockUsers.find(u => u.email === userEmail);

        if (mockUser) {
            setUser(mockUser);
            setRole(determineRole(mockUser));
            localStorage.setItem('user', JSON.stringify(mockUser));
            router.push('/dashboard');
        } else {
            console.error("Test user for role not found:", selectedRole);
        }

        setLoading(false);
    }, [router]);

    const logout = useCallback(() => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('user');
        router.push("/");
    }, [router]);

    const value = {
        user,
        firebaseUser: null, // No real Firebase user in this mode
        role,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
