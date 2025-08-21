
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
          Growth Insights
        </h1>
        <p className="text-muted-foreground">
          Track the growth of your community over time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain analytics about community growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find charts and data related to new members, club creation, and event engagement trends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
