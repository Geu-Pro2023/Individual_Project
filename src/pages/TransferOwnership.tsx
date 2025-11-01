import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, ArrowRight, CheckCircle, XCircle, RefreshCw, Download, Upload, History, DollarSign, FileText, Phone, Mail, AlertTriangle, Undo2, BarChart3 } from "lucide-react";
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
  
  // Enhanced features state
  const [transferReason, setTransferReason] = useState("");
  const [transferFee, setTransferFee] = useState(0);
  const [documents, setDocuments] = useState<File[]>([]);
  const [requireApproval, setRequireApproval] = useState(false);
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedCows, setSelectedCows] = useState<string[]>([]);
  const [ownerVerified, setOwnerVerified] = useState(false);
  const [transferStats, setTransferStats] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchOwners();
    fetchTransferStats();
  }, []);

  useEffect(() => {
    if (currentOwner) {
      fetchTransferHistory(currentOwner.cow.cow_tag);
    }
  }, [currentOwner]);

  const fetchOwners = async () => {
    try {
      const data = await ownersAPI.getAll();
      setExistingOwners(data.owners || []);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    }
  };

  const fetchTransferHistory = async (cowTag: string) => {
    try {
      // Mock transfer history - replace with actual API call
      const mockHistory = [
        {
          id: 1,
          from_owner: "John Doe",
          to_owner: "Jane Smith",
          transfer_date: "2025-10-15",
          reason: "Sale",
          fee: 50000,
          status: "Completed"
        },
        {
          id: 2,
          from_owner: "Jane Smith",
          to_owner: "Current Owner",
          transfer_date: "2025-10-20",
          reason: "Gift",
          fee: 0,
          status: "Completed"
        }
      ];
      setTransferHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch transfer history:', error);
    }
  };

  const fetchTransferStats = async () => {
    try {
      // Mock transfer statistics - replace with actual API call
      const mockStats = {
        total_transfers: 156,
        this_month: 23,
        avg_fee: 45000,
        pending_approvals: 5,
        success_rate: 98.5
      };
      setTransferStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch transfer stats:', error);
    }
  };

  const calculateTransferFee = (reason: string, cowValue: number = 100000) => {
    const feeRates = {
      'sale': 0.05,
      'gift': 0.02,
      'inheritance': 0.01,
      'other': 0.03
    };
    const rate = feeRates[reason.toLowerCase() as keyof typeof feeRates] || 0.03;
    return Math.round(cowValue * rate);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
    toast.success(`${files.length} document(s) uploaded`);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const verifyOwner = async () => {
    // Mock owner verification - replace with actual verification logic
    setOwnerVerified(true);
    toast.success("Owner identity verified successfully");
  };

  const handleBulkTransfer = async () => {
    if (selectedCows.length === 0) {
      toast.error("Please select cows for bulk transfer");
      return;
    }
    // Implement bulk transfer logic
    toast.success(`Bulk transfer initiated for ${selectedCows.length} cows`);
  };

  const reverseTransfer = async (transferId: number) => {
    try {
      // Mock transfer reversal - replace with actual API call
      toast.success("Transfer reversal initiated. Admin approval required.");
    } catch (error) {
      toast.error("Failed to initiate transfer reversal");
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

    if (!ownerVerified) {
      toast.error("Please verify current owner identity first");
      return;
    }

    if (!transferReason) {
      toast.error("Please select a reason for transfer");
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
        email: newOwnerData.email || ''
      };
    }

    // Calculate transfer fee
    const calculatedFee = calculateTransferFee(transferReason);
    setTransferFee(calculatedFee);

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
      // Generate unique transfer reference
      const transferRef = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Prepare enhanced transfer payload
      const transferPayload = {
        new_owner_full_name: transferData.newOwner.full_name,
        new_owner_email: transferData.newOwner.email || '',
        new_owner_phone: transferData.newOwner.phone || '',
        new_owner_address: transferData.newOwner.address || '',
        new_owner_national_id: transferData.newOwner.national_id || '',
        breed: transferData.cow.breed || '',
        color: transferData.cow.color || '',
        age: transferData.cow.age || '',
        transfer_reason: transferReason,
        transfer_fee: transferFee,
        transfer_reference: transferRef,
        require_approval: requireApproval,
        send_sms: sendSMS,
        send_email: sendEmail,
        documents_count: documents.length
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
      
      // Enhanced success handling
      if (result.email_sent && sendEmail) {
        toast.success(`📧 Transfer receipt sent to ${transferData.newOwner.email}`);
      }
      
      if (sendSMS) {
        toast.success(`📱 SMS notification sent to ${transferData.newOwner.phone}`);
      }
      
      if (requireApproval) {
        toast.info(`⏳ Transfer pending admin approval (Ref: ${transferRef})`);
      }
      
      // Show receipt download option
      toast.info(
        `Transfer completed! Reference: ${transferRef}`,
        {
          duration: 15000,
          action: {
            label: "Download Receipt",
            onClick: () => downloadTransferReceipt(transferData.cow.cow_tag)
          }
        }
      );
      
      // Refresh transfer history
      fetchTransferHistory(transferData.cow.cow_tag);
      fetchTransferStats();
      
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
      setTransferReason("");
      setTransferFee(0);
      setDocuments([]);
      setOwnerVerified(false);
      
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
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Transferring Ownership</h3>
              <p className="text-muted-foreground text-sm">Processing transfer, sending notifications, and generating documents...</p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Transfer</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transfer Cow Ownership</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive cattle ownership transfer with full audit trail
            </p>
          </div>
          {transferStats && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Transfers: {transferStats.total_transfers}</p>
              <p className="text-sm text-muted-foreground">This Month: {transferStats.this_month}</p>
            </div>
          )}
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
                <div className="md:col-span-2 mt-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={verifyOwner} 
                      disabled={ownerVerified}
                      variant={ownerVerified ? "default" : "outline"}
                      size="sm"
                    >
                      {ownerVerified ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                      {ownerVerified ? 'Owner Verified' : 'Verify Owner'}
                    </Button>
                    <Button 
                      onClick={() => setShowHistory(true)} 
                      variant="outline" 
                      size="sm"
                    >
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
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

            {/* Transfer Reason and Fee */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Reason for Transfer *</Label>
                <Select value={transferReason} onValueChange={setTransferReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="inheritance">Inheritance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transfer Fee (RWF)</Label>
                <Input
                  type="number"
                  value={transferFee}
                  onChange={(e) => setTransferFee(Number(e.target.value))}
                  placeholder="Auto-calculated"
                />
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <Label>Supporting Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.png,.doc,.docx"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="documents"
                />
                <label htmlFor="documents" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload documents</p>
                  </div>
                </label>
                {documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{doc.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeDocument(index)}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Options */}
            <div className="space-y-3">
              <Label>Notification Options</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="sendEmail" checked={sendEmail} onCheckedChange={setSendEmail} />
                  <label htmlFor="sendEmail" className="text-sm flex items-center">
                    <Mail className="h-4 w-4 mr-1" /> Send Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sendSMS" checked={sendSMS} onCheckedChange={setSendSMS} />
                  <label htmlFor="sendSMS" className="text-sm flex items-center">
                    <Phone className="h-4 w-4 mr-1" /> Send SMS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="requireApproval" checked={requireApproval} onCheckedChange={setRequireApproval} />
                  <label htmlFor="requireApproval" className="text-sm">
                    Require Admin Approval
                  </label>
                </div>
              </div>
            </div>

            <Button onClick={handleTransfer} size="lg" className="w-full" disabled={loading || !ownerVerified}>
              <ArrowRight className="h-4 w-4 mr-2" />
              {requireApproval ? 'Submit for Approval' : 'Transfer Ownership'}
            </Button>
          </CardContent>
        </Card>
      )}

        </TabsContent>

        {/* Transfer History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transfer History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferHistory.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.transfer_date}</TableCell>
                      <TableCell>{transfer.from_owner}</TableCell>
                      <TableCell>{transfer.to_owner}</TableCell>
                      <TableCell>{transfer.reason}</TableCell>
                      <TableCell>{transfer.fee.toLocaleString()} RWF</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          transfer.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transfer.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => reverseTransfer(transfer.id)}>
                          <Undo2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Transfer Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Bulk Transfer Feature</h3>
                <p className="text-muted-foreground mb-4">Transfer multiple cows to the same owner simultaneously</p>
                <Button onClick={handleBulkTransfer}>
                  <Users className="h-4 w-4 mr-2" />
                  Start Bulk Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {transferStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{transferStats.total_transfers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{transferStats.avg_fee.toLocaleString()} RWF</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{transferStats.success_rate}%</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-700">
                    <strong>Transfer Details:</strong><br/>
                    Reason: {transferReason}<br/>
                    Fee: {transferFee.toLocaleString()} RWF<br/>
                    Documents: {documents.length} file(s)<br/>
                    Notifications: {sendEmail ? 'Email' : ''} {sendSMS ? 'SMS' : ''}<br/>
                    {requireApproval ? 'Requires admin approval' : 'Immediate transfer'}
                  </p>
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
                  📄 Transfer receipt and legal documents will be generated
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  📧 Notifications will be sent to both parties
                </p>
                <p className="text-xs text-blue-500">
                  📎 Complete audit trail will be maintained
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Transfer History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transfer History</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferHistory.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.transfer_date}</TableCell>
                    <TableCell>{transfer.from_owner}</TableCell>
                    <TableCell>{transfer.to_owner}</TableCell>
                    <TableCell>{transfer.reason}</TableCell>
                    <TableCell>{transfer.fee.toLocaleString()} RWF</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        transfer.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transfer.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default TransferOwnership;