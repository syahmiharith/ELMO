
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

// Generate a single random user on the client side to avoid hydration mismatch
const generateRandomUser = (): User => {
    const firstNames = ['Aisha', 'Bruno', 'Chloe', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kara', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tara'];
    const lastNames = ['Khan', 'Silva', 'Chen', 'Williams', 'Garcia', 'Miller', 'Jones', 'Davis', 'Lee', 'Smith', 'Gupta', 'Rossi', 'Kim', 'Tanaka', 'O\'Brien'];
    const universities = ['Nexus University', 'Quantum State', 'Starlight College', 'Apex Institute'];
    const cities = ['Metropolis', 'Starlight City', 'Quantum Valley', 'Apex Point'];
    const states = ['California', 'New York', 'Texas', 'Florida'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;

    return {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`, // simple random id
        name,
        email,
        avatarUrl: `https://placehold.co/100x100.png`,
        firstName,
        lastName,
        phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        universityName: universities[Math.floor(Math.random() * universities.length)],
        studentId: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        address: {
            street: `${Math.floor(100 + Math.random() * 900)} Campus Dr`,
            city: cities[Math.floor(Math.random() * cities.length)],
            state: states[Math.floor(Math.random() * states.length)],
            zip: `${Math.floor(10000 + Math.random() * 90000)}`,
            country: 'us',
        },
        isPersonalized: Math.random() > 0.5,
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('User');
  // Start with a non-random default user to ensure server/client match
  const [user, setUser] = useState<User>(MOCK_DATA.users[0]);

  // Generate a random user only on the client, after the initial render.
  useEffect(() => {
    setUser(generateRandomUser());
  }, []);

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
