
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
          Membership Insights
        </h1>
        <p className="text-muted-foreground">
          Deep dive into your community's membership data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain analytics about club memberships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find charts and data about membership trends, popular clubs, and member retention.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
