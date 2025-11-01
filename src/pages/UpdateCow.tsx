import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search, CheckCircle } from "lucide-react";
import { cattleAPI, ownersAPI } from "@/services/api";
import { toast } from "sonner";

const UpdateCow = () => {
  const [cowTag, setCowTag] = useState('');
  const [cowData, setCowData] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const searchCow = async () => {
    if (!cowTag.trim()) {
      toast.error('Please enter a cow tag');
      return;
    }

    setLoading(true);
    try {
      const data = await cattleAPI.getAll();
      const cows = data.cows || data || [];
      const cow = cows.find(c => c.cow_tag === cowTag.trim());
      
      if (!cow) {
        throw new Error(`Cow with tag "${cowTag}" not found`);
      }
      
      setCowData(cow);
      
      toast.success(`Cow found: ${cow.cow_tag}`);
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      } else {
        toast.error(error.message || 'Cow not found');
      }
      setCowData(null);
      setOwnerData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCow = async () => {
    if (!cowData) return;

    setUpdating(true);
    try {
      console.log('Updating cow with ID:', cowData.cow_id);
      console.log('Update data:', { breed: cowData.breed, color: cowData.color, age: cowData.age });
      
      const formData = new FormData();
      if (cowData.breed) formData.append('breed', cowData.breed);
      if (cowData.color) formData.append('color', cowData.color);
      if (cowData.age) formData.append('age', cowData.age.toString());
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cows/${cowData.cow_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData,
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setCowData(null);
        setCowTag('');
      }, 5000);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update cow');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Update Cow</h1>
        <p className="text-muted-foreground mt-1">Update cow details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Cow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter cow tag"
              value={cowTag}
              onChange={(e) => setCowTag(e.target.value)}
            />
            <Button onClick={searchCow} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {cowData && (
        <Card>
          <CardHeader>
            <CardTitle>Cow Details - {cowData.cow_tag}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Owner Information */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Owner Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {cowData.owner_name}</div>
                <div><strong>Phone:</strong> {cowData.owner_phone}</div>
              </div>
            </div>

            {/* Current Cow Details */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">Current Cow Details</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>Breed:</strong> {cowData.breed}</div>
                <div><strong>Color:</strong> {cowData.color}</div>
                <div><strong>Age:</strong> {cowData.age} years</div>
              </div>
            </div>

            {/* Update Form */}
            <div className="space-y-4">
              <h3 className="font-semibold">Update Cow Details</h3>
              <div>
                <Label>Breed <span className="text-red-500">*</span></Label>
                <Input
                  value={cowData.breed || ''}
                  onChange={(e) => setCowData({...cowData, breed: e.target.value})}
                  placeholder="Enter breed"
                  required
                />
              </div>
              <div>
                <Label>Color <span className="text-red-500">*</span></Label>
                <Input
                  value={cowData.color || ''}
                  onChange={(e) => setCowData({...cowData, color: e.target.value})}
                  placeholder="Enter color"
                  required
                />
              </div>
              <div>
                <Label>Age (years) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={cowData.age || ''}
                  onChange={(e) => setCowData({...cowData, age: parseInt(e.target.value) || ''})}
                  placeholder="Enter age"
                  min="0"
                  required
                />
              </div>
            </div>
            <Button onClick={updateCow} disabled={updating} className="w-full">
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm & Update Cow
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Loading Modal */}
      {updating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Updating Cow</h3>
              <p className="text-muted-foreground text-sm">Please wait while we update the cow details...</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Success!</h3>
              <p className="text-muted-foreground text-sm">Cow details updated successfully</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCow;