
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
          Scheduled Posts
        </h1>
        <p className="text-muted-foreground">
          Manage and review your scheduled posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain tools for managing scheduled posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will be able to schedule, edit, and delete posts for your clubs and events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
