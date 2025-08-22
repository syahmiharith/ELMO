
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Override Tools
        </h1>
        <p className="text-muted-foreground">
          Perform high-privilege administrative interventions.
        </p>
      </div>

       <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            These actions bypass normal club admin control. All overrides are logged and require a reason.
          </AlertDescription>
        </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will contain tools for administrative overrides like archiving clubs or canceling events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will be able to perform high-privilege actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
