
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import type { Role } from '@/lib/permissions';
import { permissionsByRole } from '@/lib/permissions';
import type { User } from '@/types/domain';
import { MOCK_DATA } from '@/lib/mock-data';
import { setCurrentUser } from '@/lib/mock-api';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  permissions: string[];
  user: User;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_FOR_ROLE: Record<Role, string> = {
    'PPMK': 'usr_default_nami',
    'Club Admin': 'usr_admin_alex',
    'User': 'usr_test_ben',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, _setRole] = useState<Role>('PPMK');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setRole = useCallback((newRole: Role) => {
    const userId = USER_FOR_ROLE[newRole];
    const newUser = MOCK_DATA.users.find(u => u.id === userId);

    if (newUser) {
      setUser(newUser);
      setCurrentUser(newUser.id, newRole);
      _setRole(newRole);
    } else {
      console.error(`User for role ${newRole} not found.`);
    }
  }, []);

  useEffect(() => {
    // Set the initial user based on the default role
    const initialUserId = USER_FOR_ROLE[role];
    const initialUser = MOCK_DATA.users.find(u => u.id === initialUserId);
    if (initialUser) {
        setUser(initialUser);
        setCurrentUser(initialUser.id, role);
    }
    setIsLoading(false);
  }, []); // Run only once on mount

  const permissions = useMemo(() => permissionsByRole[role], [role]);

  if (isLoading || !user) {
    return null;
  }

  const value = { role, setRole, permissions, user, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
