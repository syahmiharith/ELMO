
'use client';
import type { ReactNode } from 'react';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { setRuntimeFlags } from '@/hooks/use-feature';
import { UserClubsNav } from '@/components/user-clubs-nav';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ThemeToggleIcon } from '@/components/theme-toggle-icon';

// Dev-only: Load local feature flags
if (process.env.NODE_ENV === 'development') {
  try {
    const localFlags = require('../../flags.local.json');
    setRuntimeFlags(localFlags);
  } catch (error) {
    console.info('flags.local.json not found, using default flags.');
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="group-data-[variant=sidebar]:border-r bg-sidebar"
          >
            <SidebarHeader className="p-2">
              <div className="flex items-center group-data-[collapsible=icon]:justify-center">
                 <Logo className="w-36 group-data-[collapsible=icon]:hidden" />
                 <div className="hidden size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:flex text-xl font-bold">NC</div>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col">
              <div className="flex-1">
                <MainNav />
                <SidebarSeparator className="my-2" />
                <UserClubsNav />
              </div>
            </SidebarContent>
             <SidebarFooter className="flex items-center justify-between p-2 transition-all duration-300 group-data-[state=expanded]:flex-row group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:items-center group-data-[state=collapsed]:gap-2">
              <ThemeToggleIcon />
              <SidebarTrigger className="hidden md:flex" />
            </SidebarFooter>
          </Sidebar>
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
               <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                <div className="relative w-full max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Search anything..." className="pl-10 h-9 bg-muted" />
                </div>
              </div>
              <UserNav />
            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
