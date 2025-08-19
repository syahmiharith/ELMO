
"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PanelLeft, LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from 'next/link';
import { useAuth } from "@/hooks/use-auth";
import { MainSidebar } from "./main-sidebar";

export function Header() {
    const { user, logout } = useAuth();
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="md:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                    <MainSidebar />
                </SheetContent>
            </Sheet>
            <div className="relative ml-auto flex-1 md:grow-0">
                {/* Potential Search Bar */}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoUrl} alt={user?.name.display} />
                            <AvatarFallback>{user?.name.display?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard/profile" passHref><DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem></Link>
                    <Link href="/dashboard/settings" passHref><DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem></Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
