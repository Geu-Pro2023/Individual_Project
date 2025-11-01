import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, Image } from "lucide-react";
import { cattleAPI } from "@/services/api";
import { toast } from "sonner";

const ViewCowFace = () => {
  const [cowTag, setCowTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const getCowFace = async () => {
    if (!cowTag.trim()) {
      toast.error('Please enter a cow tag');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cow/${cowTag}/face`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Cow face image not found');
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setFaceImage(imageUrl);
      toast.success('Cow face image loaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load cow face image');
      setFaceImage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">View Cow Facial Image</h1>
        <p className="text-muted-foreground mt-1">Get cow facial image by tag</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Cow Face</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cow Tag</Label>
            <Input
              placeholder="Enter cow tag"
              value={cowTag}
              onChange={(e) => setCowTag(e.target.value)}
            />
          </div>
          <Button onClick={getCowFace} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            View Cow Face
          </Button>
        </CardContent>
      </Card>

      {faceImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Cow Facial Image - {cowTag}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img 
                src={faceImage} 
                alt={`Cow ${cowTag} face`}
                className="max-w-full max-h-96 rounded-lg shadow-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewCowFace;