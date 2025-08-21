'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import type { Role } from '@/lib/permissions';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions; if false, user needs ANY permission
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  requiredPermissions, 
  fallback = null,
  requireAll = false 
}: RoleGuardProps) {
  const { role, permissions } = useAuth();

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermissions) {
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => permissions.includes(permission))
      : requiredPermissions.some(permission => permissions.includes(permission));
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard 
      allowedRoles={['Club Admin', 'University Admin']} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

export function ClubAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard 
      allowedRoles={['Club Admin']} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

export function UniversityAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard 
      allowedRoles={['University Admin']} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

export function PermissionGuard({ 
  children, 
  permissions, 
  requireAll = false,
  fallback 
}: { 
  children: ReactNode; 
  permissions: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard 
      requiredPermissions={permissions}
      requireAll={requireAll}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}
