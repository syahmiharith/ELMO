
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function InsightsClient() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Community Insights
        </h1>
        <p className="text-muted-foreground">
          Analytics and data visualizations for your community.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This is the main dashboard for community analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find charts and graphs about user engagement, club growth, event attendance, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
