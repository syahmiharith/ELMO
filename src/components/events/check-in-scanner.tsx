"use client";
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface CheckInScannerProps {
    eventId: string;
}

export function CheckInScanner({ eventId }: CheckInScannerProps) {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
            }
        };
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [toast]);

    useEffect(() => {
        if (!isScanning || !hasCameraPermission) return;

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d');
                    if (context) {
                        canvas.height = video.videoHeight;
                        canvas.width = video.videoWidth;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: 'dontInvert',
                        });

                        if (code) {
                            setIsScanning(false);
                            setScanResult(code.data);
                            // Validate QR Code
                            if (code.data === `clubnexus-event-checkin:${eventId}`) {
                                toast({
                                    title: "Check-in Successful!",
                                    description: "You've been successfully checked in.",
                                    className: "bg-green-500 text-white"
                                });
                            } else {
                                toast({
                                    variant: "destructive",
                                    title: "Invalid QR Code",
                                    description: "This QR code is not valid for this event.",
                                });
                            }
                        }
                    }
                }
            }
            if (isScanning) {
                requestAnimationFrame(tick);
            }
        };
        const animationFrameId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(animationFrameId);

    }, [isScanning, hasCameraPermission, eventId, toast]);

    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access in your browser to use the check-in scanner.
                </AlertDescription>
            </Alert>
        );
    }

    if (scanResult) {
        const isValid = scanResult === `clubnexus-event-checkin:${eventId}`;
        return (
            <Alert variant={isValid ? "default" : "destructive"} className={isValid ? "bg-green-50 text-green-800 border-green-200" : ""}>
                {isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{isValid ? "Success!" : "Scan Failed"}</AlertTitle>
                <AlertDescription>
                    {isValid ? "You are now checked in for the event." : "The scanned QR code is incorrect. Please try again."}
                </AlertDescription>
                {!isValid && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => { setScanResult(null); setIsScanning(true); }}>
                        Scan Again
                    </Button>
                )}
            </Alert>
        )
    }

    return (
        <div className="space-y-4">
            <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute inset-0 bg-black/20" />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white">Requesting camera permission...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

