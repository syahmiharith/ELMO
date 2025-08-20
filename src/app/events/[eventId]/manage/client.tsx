
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, Ticket, Users, FileCheck, BarChart2 } from 'lucide-react';

export default function EventManageClient({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect should only run when the 'check-in' tab is active.
    // For now, we'll request it when the component mounts.
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    
    // We can enhance this to only call getCameraPermission when the check-in tab is selected.
    getCameraPermission();

    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Manage Event
        </h1>
        <p className="text-muted-foreground">
          Event ID: {eventId}
        </p>
      </div>
      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><BarChart2 className="mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="attendees"><Users className="mr-2" />Attendees</TabsTrigger>
          <TabsTrigger value="orders"><FileCheck className="mr-2" />Orders</TabsTrigger>
          <TabsTrigger value="tickets"><Ticket className="mr-2" />Tickets</TabsTrigger>
          <TabsTrigger value="check-in"><QrCode className="mr-2" />Check-in</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Event status, capacity, and sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Overview content goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendees">
          <Card>
            <CardHeader>
              <CardTitle>Attendees</CardTitle>
              <CardDescription>
                View the RSVP list for your event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Attendees list goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders & Receipts</CardTitle>
              <CardDescription>
                Review pending orders and uploaded receipts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Orders and receipts queue goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Issued Tickets</CardTitle>
              <CardDescription>
                View issued and redeemed tickets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Tickets list goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-in">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Check-in</CardTitle>
              <CardDescription>
                Use your device's camera to scan attendee QR codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
               <div className="w-full max-w-md bg-muted rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
               </div>
              {hasCameraPermission === false && (
                <Alert variant="destructive" className="w-full max-w-md">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser to use this feature.
                  </AlertDescription>
                </Alert>
              )}
               {hasCameraPermission === null && (
                <p className="text-muted-foreground">Initializing camera...</p>
              )}
               <Button size="lg" disabled={!hasCameraPermission}>
                <QrCode className="mr-2" /> Scan Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
