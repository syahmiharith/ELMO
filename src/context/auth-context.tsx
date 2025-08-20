'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import type { Role } from '@/lib/permissions';
import { permissionsByRole } from '@/lib/permissions';
import type { User } from '@/types/domain';
import { MOCK_DATA } from '@/lib/mock-data';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  permissions: string[];
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Student');
  // In a real app, the user would be fetched from an API
  const [user, setUser] = useState<User>(MOCK_DATA.users[0]);

  const permissions = useMemo(() => permissionsByRole[role], [role]);

  const value = { role, setRole, permissions, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
