import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportsAPI } from "@/services/api";
import { toast } from "sonner";

const ReplyReport = () => {
  const [reportId, setReportId] = useState("");
  const [adminReply, setAdminReply] = useState("Thank you for your report. We have reviewed the information and taken appropriate action. If you have any further concerns, please don't hesitate to contact us.");
  const [status, setStatus] = useState("resolved");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportId.trim()) {
      toast.error("Please enter a Report ID");
      return;
    }

    if (!adminReply.trim()) {
      toast.error("Please enter your reply");
      return;
    }

    setLoading(true);
    try {
      const id = parseInt(reportId);
      await reportsAPI.reply(id, adminReply, status);
      toast.success("Reply sent successfully!");
      
      // Reset form
      setReportId("");
      setAdminReply("Thank you for your report. We have reviewed the information and taken appropriate action. If you have any further concerns, please don't hesitate to contact us.");
      setStatus("resolved");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reply to Report</h1>
        <p className="text-muted-foreground mt-1">
          Send reply to specific report using Report ID
        </p>
      </div>

      <Card className="shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle>Send Admin Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportId">Report ID *</Label>
              <Input
                id="reportId"
                type="number"
                placeholder="Enter Report ID (e.g., 1, 2, 3)"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the numeric ID of the report you want to reply to
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminReply">Admin Reply *</Label>
              <Textarea
                id="adminReply"
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Write your reply to the reporter..."
                rows={6}
                className="resize-none"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending Reply..." : "Send Reply"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReplyReport;