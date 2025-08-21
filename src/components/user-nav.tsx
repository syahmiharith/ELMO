'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Settings, User, LogOut, Shield, Crown, Users } from 'lucide-react';
import Link from 'next/link';

const roleIcons = {
  'Student': Users,
  'Club Admin': Shield,
  'University Admin': Crown,
};

const roleColors = {
  'Student': 'secondary',
  'Club Admin': 'default',
  'University Admin': 'destructive',
} as const;

export function UserNav() {
  const { user, role, setRole } = useAuth();

  const RoleIcon = roleIcons[role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <Badge variant={roleColors[role]} className="text-xs">
                <RoleIcon className="w-3 h-3 mr-1" />
                {role}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Role Switcher - for demo purposes */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Switch Role (Demo)
          </DropdownMenuLabel>
          <div className="px-2 py-1">
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Student
                  </div>
                </SelectItem>
                <SelectItem value="Club Admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Club Admin
                  </div>
                </SelectItem>
                <SelectItem value="University Admin">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    University Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
