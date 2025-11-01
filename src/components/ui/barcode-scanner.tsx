import { useState, useRef, useEffect } from "react";
import { Scan, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScanResult: (result: string) => void;
}

export const BarcodeScanner = ({ onScanResult }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        
        // Start scanning for barcodes
        scanForBarcode();
      }
    } catch (error) {
      toast.error("Camera access denied");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const scanForBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Simple barcode detection simulation
        // In real implementation, use a library like QuaggaJS or ZXing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simulate barcode detection
        setTimeout(() => {
          const mockBarcode = generateMockBarcode();
          if (mockBarcode && Math.random() > 0.7) { // 30% chance to "detect"
            handleScanResult(mockBarcode);
            return;
          }
        }, 100);
      }

      if (isScanning) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const generateMockBarcode = () => {
    // Generate mock cattle tag for demonstration
    const prefixes = ['TW-2025-BWF-', 'TW-2025-HLS-', 'TW-2025-JRS-'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return prefix + number;
  };

  const handleScanResult = (result: string) => {
    onScanResult(result);
    toast.success(`Barcode scanned: ${result}`);
    setIsOpen(false);
    stopCamera();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
      setManualInput("");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="transition-all duration-200 hover:scale-105"
      >
        <Scan className="mr-2 h-4 w-4" />
        Scan Barcode
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) stopCamera();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Barcode Scanner</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isScanning ? (
              <div className="space-y-4">
                <Button onClick={startCamera} className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or enter manually
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-input">Cattle Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-input"
                      placeholder="TW-2025-XXX-0000"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    />
                    <Button onClick={handleManualSubmit}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-black rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-red-500 w-64 h-32 rounded-lg animate-pulse" />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={stopCamera}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground">
                  Point camera at barcode to scan
                </p>
                
                <Button
                  variant="outline"
                  onClick={() => handleScanResult(generateMockBarcode())}
                  className="w-full"
                >
                  Simulate Scan (Demo)
                </Button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};