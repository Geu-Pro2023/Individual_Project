import { X, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface ReportDetailsModalProps {
  open: boolean;
  onClose: () => void;
  report?: {
    id: string;
    reporter: {
      name: string;
      phone: string;
      email: string;
    };
    submittedAt: string;
    location: string;
    cowTag: string;
    type: string;
    status: "urgent" | "pending" | "resolved";
    description: string;
  };
}

export const ReportDetailsModal = ({ open, onClose, report }: ReportDetailsModalProps) => {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<string>(report?.status || "pending");

  if (!report) return null;

  const handleSendResponse = () => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }
    toast.success("Response sent successfully!");
    onClose();
  };

  const statusColor = {
    urgent: "bg-urgent/10 text-urgent border-urgent",
    pending: "bg-warning/10 text-warning border-warning",
    resolved: "bg-success/10 text-success border-success",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-bold">
                📢 Report #{report.id}
              </DialogTitle>
              <Badge className={statusColor[report.status]}>
                {report.status === "urgent" && "🔴 "}
                {report.status.toUpperCase()}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Reporter Information */}
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg mb-4">👤 Reporter Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-lg">{report.reporter.name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{report.reporter.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{report.reporter.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {report.submittedAt}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location: {report.location}</span>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg mb-4">📋 Report Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Cow Tag:</p>
                <p className="font-mono font-bold text-primary text-lg">{report.cowTag}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type:</p>
                <Badge variant="outline" className="mt-1">{report.type}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description:</p>
                <div className="p-3 rounded-md bg-muted/50 border">
                  <p className="text-sm whitespace-pre-wrap">{report.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Response */}
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg mb-4">💬 Admin Response</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response to the reporter..."
                  rows={5}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendResponse} className="mt-6">
                  Send Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
