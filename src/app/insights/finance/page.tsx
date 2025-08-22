
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Finance Insights
        </h1>
        <p className="text-muted-foreground">
          Track budgets and spending across the community.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain financial analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find charts and data about budget vs. spend summaries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
