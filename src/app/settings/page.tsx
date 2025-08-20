
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your app preferences and accessibility settings.
        </p>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en-us">
                <SelectTrigger id="language" className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-us">English (US)</SelectItem>
                  <SelectItem value="en-gb">English (UK)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>Make the app easier to use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Improves color contrast for better readability.
                </p>
              </div>
              <Switch id="high-contrast" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Reduces animations and motion effects.
                </p>
              </div>
              <Switch id="reduce-motion" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Information about this application and its technologies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>App Name</Label>
              <span className="text-muted-foreground">NexusClub</span>
            </div>
            <div className="flex items-center justify-between">
              <Label>Version</Label>
              <span className="text-muted-foreground">1.0.0</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Framework</Label>
              <span className="text-muted-foreground">Next.js</span>
            </div>
            <div className="flex items-center justify-between">
              <Label>UI Components</Label>
              <span className="text-muted-foreground">ShadCN</span>
            </div>
             <div className="flex items-center justify-between">
              <Label>AI Provider</Label>
              <span className="text-muted-foreground">Google Gemini</span>
            </div>
             <div className="flex items-center justify-between">
              <Label>Powered By</Label>
              <span className="text-muted-foreground">Firebase</span>
            </div>
             <Separator />
             <div className="flex items-center justify-between">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Terms of Service
                </Link>
                 <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save All Settings</Button>
        </div>
      </div>
    </div>
  );
}
