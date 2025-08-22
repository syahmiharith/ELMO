
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminOverviewClient() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Admin Tools
        </h1>
        <p className="text-muted-foreground">
          Manage your community and its activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            This is the main dashboard for administrative tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you can add various admin panels for managing users, approving clubs, viewing analytics, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
