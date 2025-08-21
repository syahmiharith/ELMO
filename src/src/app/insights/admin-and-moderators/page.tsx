
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
          Admin & Moderator Insights
        </h1>
        <p className="text-muted-foreground">
          Analytics about your administrative team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain analytics about admins and moderators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find data on admin activity, moderation actions, and team performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
