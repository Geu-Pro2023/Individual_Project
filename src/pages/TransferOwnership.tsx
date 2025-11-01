import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, ArrowRight, CheckCircle, XCircle, RefreshCw, Download } from "lucide-react";
import { cattleAPI, ownersAPI, receiptAPI, systemAPI } from "@/services/api";
import { toast } from "sonner";

const TransferOwnership = () => {
  const [cowTag, setCowTag] = useState("");
  const [currentOwner, setCurrentOwner] = useState<any>(null);
  const [newOwnerData, setNewOwnerData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    national_id: ""
  });
  const [existingOwners, setExistingOwners] = useState<any[]>([]);
  const [selectedExistingOwner, setSelectedExistingOwner] = useState("");
  const [useExistingOwner, setUseExistingOwner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const data = await ownersAPI.getAll();
      setExistingOwners(data.owners || []);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    }
  };

  const searchCow = async () => {
    if (!cowTag.trim()) {
      toast.error("Please enter a cow tag");
      return;
    }

    setSearching(true);
    try {
      // Get cow details from registered cows
      const cowsData = await cattleAPI.getAll();
      const cow = cowsData.cows?.find((c: any) => c.cow_tag === cowTag);
      
      if (!cow) {
        toast.error("Cow not found");
        setCurrentOwner(null);
        return;
      }

      // Ensure cow has required ID field
      if (!cow.cow_id && !cow.id) {
        toast.error("Cow ID not found - cannot transfer");
        setCurrentOwner(null);
        return;
      }

      // Find current owner
      const ownersData = await ownersAPI.getAll();
      const owner = ownersData.owners?.find((o: any) => o.full_name === cow.owner_name);
      
      setCurrentOwner({
        cow: {
          ...cow,
          // Ensure we have all required fields with defaults
          breed: cow.breed || 'Unknown',
          color: cow.color || 'Unknown',
          age: cow.age || '0'
        },
        owner: owner || { full_name: cow.owner_name, phone: cow.owner_phone || 'N/A', email: 'N/A' }
      });
      
      toast.success("Cow found successfully");
    } catch (error) {
      console.error('Failed to search cow:', error);
      toast.error("Failed to search cow");
    } finally {
      setSearching(false);
    }
  };

  const handleExistingOwnerSelect = (ownerId: string) => {
    const owner = existingOwners.find(o => o.owner_id.toString() === ownerId);
    if (owner) {
      setSelectedExistingOwner(ownerId);
    }
  };

  const handleTransfer = () => {
    if (!currentOwner) {
      toast.error("Please search for a cow first");
      return;
    }

    let newOwner;
    if (useExistingOwner) {
      newOwner = existingOwners.find(o => o.owner_id.toString() === selectedExistingOwner);
      if (!newOwner) {
        toast.error("Please select an existing owner");
        return;
      }
    } else {
      if (!newOwnerData.full_name || !newOwnerData.phone || !newOwnerData.national_id) {
        toast.error("Please fill in all required fields for new owner");
        return;
      }
      newOwner = {
        ...newOwnerData,
        // Ensure email field exists even if empty
        email: newOwnerData.email || ''
      };
    }

    setTransferData({
      cow: currentOwner.cow,
      currentOwner: currentOwner.owner,
      newOwner: newOwner
    });
    setShowConfirmModal(true);
  };

  const confirmTransfer = async () => {
    if (!transferData) return;

    setLoading(true);
    setShowConfirmModal(false);

    try {
      // Prepare transfer payload with all required fields
      const transferPayload = {
        new_owner_full_name: transferData.newOwner.full_name,
        new_owner_email: transferData.newOwner.email || '',
        new_owner_phone: transferData.newOwner.phone || '',
        new_owner_address: transferData.newOwner.address || '',
        new_owner_national_id: transferData.newOwner.national_id || '',
        breed: transferData.cow.breed || '',
        color: transferData.cow.color || '',
        age: transferData.cow.age || ''
      };

      console.log('Transfer payload:', transferPayload);
      console.log('Cow ID:', transferData.cow.cow_id || transferData.cow.id);
      console.log('Using cow data:', transferData.cow);
      
      const cowId = transferData.cow.cow_id || transferData.cow.id;
      if (!cowId) {
        throw new Error('Cow ID is required for transfer');
      }
      
      const result = await cattleAPI.transfer(cowId, transferPayload);
      console.log('Transfer result:', result);
      
      // Show success message
      toast.success(`Cow ${transferData.cow.cow_tag} successfully transferred to ${transferData.newOwner.full_name}`);
      
      // Check API response for email status
      if (result.email_sent) {
        toast.info(`📧 Transfer receipt sent to ${transferData.newOwner.email}`);
      } else {
        toast.warning('Transfer completed but email sending failed');
      }
      
      // Show receipt download option
      toast.info(
        `Click here to download transfer receipt.`,
        {
          duration: 10000,
          action: {
            label: "Download",
            onClick: () => downloadTransferReceipt(transferData.cow.cow_tag)
          }
        }
      );
      
      // Reset form
      setCowTag("");
      setCurrentOwner(null);
      setNewOwnerData({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        national_id: ""
      });
      setSelectedExistingOwner("");
      setTransferData(null);
      
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error("Failed to transfer ownership");
    } finally {
      setLoading(false);
    }
  };

  const downloadTransferReceipt = async (cowTag: string) => {
    try {
      const response = await fetch(`https://titweng-app-a3hufygwcphxhkc2.canadacentral-01.azurewebsites.net/admin/receipt/${cowTag}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cowTag}_transfer_receipt.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success('Transfer receipt downloaded successfully');
      } else {
        toast.error('Failed to download transfer receipt');
      }
    } catch (error) {
      console.error('Receipt download error:', error);
      toast.error('Failed to download transfer receipt');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transfer Cow Ownership</h1>
        <p className="text-muted-foreground mt-1">
          Transfer cattle ownership to existing or new owners
        </p>
      </div>

      {/* Search Cow */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Cow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="cowTag">Cow Tag *</Label>
              <Input
                id="cowTag"
                placeholder="TW-2025-XXX-XXXX"
                value={cowTag}
                onChange={(e) => setCowTag(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchCow} disabled={searching}>
                {searching ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {currentOwner && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Current Ownership</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Cow Tag:</strong> {currentOwner.cow.cow_tag}</p>
                  <p><strong>Breed:</strong> {currentOwner.cow.breed || 'N/A'}</p>
                  <p><strong>Color:</strong> {currentOwner.cow.color || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Current Owner:</strong> {currentOwner.owner.full_name}</p>
                  <p><strong>Phone:</strong> {currentOwner.owner.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {currentOwner.owner.email || 'N/A'}</p>
                  <p><strong>Cow ID:</strong> {currentOwner.cow.cow_id || currentOwner.cow.id || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Options */}
      {currentOwner && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              New Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={useExistingOwner ? "default" : "outline"}
                onClick={() => setUseExistingOwner(true)}
              >
                Existing Owner
              </Button>
              <Button
                variant={!useExistingOwner ? "default" : "outline"}
                onClick={() => setUseExistingOwner(false)}
              >
                New Owner
              </Button>
            </div>

            {useExistingOwner ? (
              <div>
                <Label>Select Existing Owner *</Label>
                <Select value={selectedExistingOwner} onValueChange={handleExistingOwnerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an existing owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingOwners.map((owner) => (
                      <SelectItem key={owner.owner_id} value={owner.owner_id.toString()}>
                        {owner.full_name} - {owner.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newOwnerData.full_name}
                    onChange={(e) => setNewOwnerData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newOwnerData.phone}
                    onChange={(e) => setNewOwnerData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newOwnerData.email}
                    onChange={(e) => setNewOwnerData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input
                    id="nationalId"
                    value={newOwnerData.national_id}
                    onChange={(e) => setNewOwnerData(prev => ({ ...prev, national_id: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newOwnerData.address}
                    onChange={(e) => setNewOwnerData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <Button onClick={handleTransfer} size="lg" className="w-full" disabled={loading}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Transfer Ownership
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Users className="h-5 w-5" />
              Confirm Ownership Transfer
            </DialogTitle>
          </DialogHeader>
          {transferData && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-semibold">{transferData.currentOwner.full_name}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-semibold">{transferData.newOwner.full_name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded border border-blue-200 p-3 text-sm">
                  <p><strong>Cow Tag:</strong> {transferData.cow.cow_tag}</p>
                  <p><strong>Breed:</strong> {transferData.cow.breed || 'N/A'}</p>
                  <p><strong>New Owner Phone:</strong> {transferData.newOwner.phone}</p>
                </div>
                
                <p className="text-sm text-blue-700 mt-2 font-medium">
                  ⚠️ This will permanently change the ownership records.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmTransfer}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Transferring...' : 'Confirm Transfer'}
                </Button>
              </div>
              
              <div className="text-center mt-3">
                <p className="text-xs text-blue-600">
                  📄 Transfer receipt will be sent to new owner (if email configured)
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  📎 Admin can download receipt copy after transfer
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransferOwnership;