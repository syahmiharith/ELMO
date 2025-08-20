
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function PersonalizationNudge() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
      <Card className="relative z-20 max-w-md text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
            <Sparkles className="text-primary" />
            Unlock Your Community
          </CardTitle>
          <CardDescription>
            Tell us about your interests to get personalized club and event recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/profile#personalization">
              Personalize My Experience
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
