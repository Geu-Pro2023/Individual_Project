import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Download, FileText } from "lucide-react";
import { receiptAPI } from "@/services/api";
import { toast } from "sonner";

const DownloadReceipt = () => {
  const [cowTag, setCowTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<any>(null);

  const getReceiptInfo = async () => {
    if (!cowTag.trim()) {
      toast.error('Please enter a cow tag');
      return;
    }

    setLoading(true);
    try {
      const data = await receiptAPI.getInfo(cowTag);
      setReceiptInfo(data);
      toast.success('Receipt info retrieved');
    } catch (error: any) {
      toast.error(error.message || 'Receipt not found');
      setReceiptInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!cowTag.trim()) {
      toast.error('Please enter a cow tag');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/receipt/${cowTag}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download receipt');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cow-receipt-${cowTag}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Receipt downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download receipt');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Download Cow Receipt</h1>
        <p className="text-muted-foreground mt-1">Download cow receipt by tag</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Information</CardTitle>
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
          <div className="flex gap-2">
            <Button onClick={getReceiptInfo} disabled={loading} variant="outline">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Get Info
            </Button>
            <Button onClick={downloadReceipt}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      {receiptInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Cow Tag:</strong> {receiptInfo.cow_tag}</p>
              <p><strong>Owner:</strong> {receiptInfo.owner_name}</p>
              <p><strong>Registration Date:</strong> {new Date(receiptInfo.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DownloadReceipt;