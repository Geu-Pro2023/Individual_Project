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
          <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-1" />
                Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Take photo or upload image
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button onClick={capturePhoto} size="sm">
              <Camera className="h-4 w-4 mr-1" />
              Capture
            </Button>
            <Button onClick={stopCamera} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="aspect-square rounded-lg overflow-hidden relative group">
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-6 w-6"
              onClick={clearImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                clearImage();
                startCamera();
              }}
            >
              <RotateCcw className="h-3 w-3" />
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