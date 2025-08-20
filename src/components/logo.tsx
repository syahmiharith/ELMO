
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-label="NexusClub logo"
      className={cn('text-primary', className)}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="40"
        fontFamily='"Space Grotesk", sans-serif'
        fontSize="40"
        fontWeight="bold"
        fill="currentColor"
        className="group-data-[logo-gradient=true]:fill-[url(#logo-gradient)]"
      >
        NexusClub
      </text>
    </svg>
  );
}
