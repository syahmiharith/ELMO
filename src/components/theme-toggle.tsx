
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
            <div className='flex items-center gap-2'>
                <Sun className="size-4" /> Light
            </div>
        </SelectItem>
        <SelectItem value="dark">
            <div className='flex items-center gap-2'>
                <Moon className="size-4" /> Dark
            </div>
        </SelectItem>
        <SelectItem value="system">
            <div className='flex items-center gap-2'>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
                 System
            </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
