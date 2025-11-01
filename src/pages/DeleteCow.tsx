import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { cattleAPI } from "@/services/api";
import { toast } from "sonner";

const DeleteCow = () => {
  const [cowTag, setCowTag] = useState('');
  const [loading, setLoading] = useState(false);

  const deleteCow = async () => {
    if (!cowTag.trim()) {
      toast.error('Please enter a cow tag');
      return;
    }

    if (!confirm('Are you sure you want to delete this cow? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await cattleAPI.delete(cowTag);
      toast.success('Cow deleted successfully');
      setCowTag('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete cow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Delete Cow</h1>
        <p className="text-muted-foreground mt-1">Delete cow by tag with all related data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Cow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cow Tag</Label>
            <Input
              placeholder="Enter cow tag to delete"
              value={cowTag}
              onChange={(e) => setCowTag(e.target.value)}
            />
          </div>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> This will permanently delete the cow and all related data including verification logs, receipts, and images.
            </p>
          </div>
          <Button 
            onClick={deleteCow} 
            disabled={loading} 
            variant="destructive"
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Cow
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteCow;