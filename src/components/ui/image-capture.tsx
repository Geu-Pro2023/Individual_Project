import { useState, useRef } from "react";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";

interface ImageCaptureProps {
  label: string;
  onImageCapture: (file: File) => void;
  captured?: string;
}

export const ImageCapture = ({ label, onImageCapture, captured }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string>(captured || "");
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${label}-${Date.now()}.jpg`, { type: "image/jpeg" });
          onImageCapture(file);
          setPreview(canvas.toDataURL());
          stopCamera();
        }
      }, "image/jpeg", 0.8);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCapture(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      
      {!preview && !isCapturing && (
        <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <div className="flex flex-col gap-2 w-full">
              <Button
                type="button"
                onClick={startCamera}
                className="w-full"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Open Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Capture nose print using camera or upload existing image
            </p>
          </div>
        </div>
      )}

      {isCapturing && (
        <div className="aspect-square rounded-lg overflow-hidden bg-black relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
            <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
              Position cow nose in frame
            </p>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <Button onClick={capturePhoto} size="lg" className="bg-white text-black hover:bg-gray-100">
              <Camera className="h-5 w-5 mr-2" />
              Capture Photo
            </Button>
            <Button onClick={stopCamera} variant="outline" size="lg" className="bg-black/50 text-white border-white/50 hover:bg-black/70">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden relative group border-2 border-green-200">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              ✓ Captured
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearImage();
                startCamera();
              }}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Different
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={clearImage}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};