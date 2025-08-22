
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingDown, TrendingUp, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';


const memberData = [
  { month: 'Jan', new: 186, leaves: 80 },
  { month: 'Feb', new: 305, leaves: 90 },
  { month: 'Mar', new: 237, leaves: 50 },
  { month: 'Apr', new: 273, leaves: 120 },
  { month: 'May', new: 209, leaves: 60 },
  { month: 'Jun', new: 214, leaves: 70 },
];

const memberChartConfig = {
  new: {
    label: 'New Members',
    color: 'hsl(var(--primary))',
  },
  leaves: {
      label: 'Leaves',
      color: 'hsl(var(--destructive))',
  }
} satisfies ChartConfig;


export default function GrowthClient() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Growth — Membership Trends
            </h1>
            <p className="text-muted-foreground">
                Analytics for community membership and activity.
            </p>
        </div>
        <div className="flex gap-2">
            <Select defaultValue="30d">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">
                <Download className="mr-2" />
                Export
            </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Total Members</CardDescription>
                <CardTitle className="text-4xl">18,452</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">
                    Current system-wide members.
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>New Members</CardDescription>
                <CardTitle className="text-4xl">+1,230</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="size-4 text-green-500" />
                    <span>In the last 30 days</span>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Members Left</CardDescription>
                <CardTitle className="text-4xl">-310</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="size-4 text-destructive" />
                    <span>In the last 30 days</span>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Net Growth</CardDescription>
                <CardTitle className="text-4xl">+5.2%</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-xs text-muted-foreground">
                    vs last month
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 lg:grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle>Membership Trends Over Time</CardTitle>
                    <CardDescription>New members vs members who left over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={memberChartConfig} className="h-[300px] w-full">
                        <AreaChart accessibilityLayer data={memberData} margin={{ left: 12, right: 12, top: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="new"
                            type="natural"
                            fill="var(--color-new)"
                            fillOpacity={0.4}
                            stroke="var(--color-new)"
                        />
                         <Area
                            dataKey="leaves"
                            type="natural"
                            fill="var(--color-leaves)"
                            fillOpacity={0.4}
                            stroke="var(--color-leaves)"
                        />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>Fastest-growing clubs this period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Club Name</TableHead>
                                <TableHead>University</TableHead>
                                <TableHead>Total Members</TableHead>
                                <TableHead>Growth</TableHead>
                                <TableHead>New Members</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Link href="/clubs/club_innovate" className="hover:underline text-primary">
                                        Robotics Club
                                    </Link>
                                </TableCell>
                                <TableCell>Nexus University</TableCell>
                                <TableCell>420</TableCell>
                                <TableCell className="text-green-500 font-medium">+12%</TableCell>
                                <TableCell>+50</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>
                                    <Link href="/clubs/club_esports" className="hover:underline text-primary">
                                        Dance Crew
                                    </Link>
                                </TableCell>
                                <TableCell>Quantum State</TableCell>
                                <TableCell>540</TableCell>
                                <TableCell className="text-green-500 font-medium">+8%</TableCell>
                                <TableCell>+40</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>
                                    <Link href="/clubs/club_debate" className="hover:underline text-primary">
                                        Debate Society
                                    </Link>
                                </TableCell>
                                <TableCell>Apex Institute</TableCell>
                                <TableCell>310</TableCell>
                                <TableCell className="text-destructive font-medium">-2%</TableCell>
                                <TableCell>+15</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
