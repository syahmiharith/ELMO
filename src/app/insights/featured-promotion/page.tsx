
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
          Featured & Promotion Insights
        </h1>
        <p className="text-muted-foreground">
          Manage and analyze featured clubs and events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain tools for managing promotions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will be able to mark clubs and events as featured and view promotion analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
