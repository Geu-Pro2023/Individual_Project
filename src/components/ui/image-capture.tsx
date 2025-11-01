import { useState, useRef } from "react";
import { Upload, X, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";

interface ImageCaptureProps {
  label: string;
  onImageCapture: (file: File) => void;
  captured?: string;
}

export const ImageCapture = ({ label, onImageCapture, captured }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string>(captured || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCapture(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  const clearImage = () => {
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      
      {!preview && (
        <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
            <Upload className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                size="lg"
                className="mb-2"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Nose Print Image
              </Button>
              <p className="text-xs text-muted-foreground">
                Select a clear image of the cow's nose print
              </p>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden relative group border-2 border-green-200">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              ✓ Selected
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Different
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
    </div>
  );
};