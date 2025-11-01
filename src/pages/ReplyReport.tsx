import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { reportsAPI } from "@/services/api";
import { toast } from "sonner";
import { Search, Phone, Mail, MapPin, Calendar, Tag } from "lucide-react";

const ReplyReport = () => {
  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState<any>(null);
  const [adminReply, setAdminReply] = useState("Thank you for your report. We have reviewed the information and taken appropriate action. If you have any further concerns, please don't hesitate to contact us.");
  const [status, setStatus] = useState("resolved");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!reportId.trim()) {
      toast.error("Please enter a Report ID");
      return;
    }

    setSearching(true);
    try {
      const data = await reportsAPI.getAll();
      console.log('Full API Response:', data);
      console.log('Looking for ID:', reportId);
      
      // Handle different response formats
      const reports = data.reports || data || [];
      console.log('Reports array:', reports);
      
      if (reports && reports.length > 0) {
        console.log('Available reports:', reports.map((r: any) => ({ id: r.id, type: typeof r.id })));
        const foundReport = reports.find((r: any) => 
          r.id.toString() === reportId || 
          r.id === parseInt(reportId)
        );
        
        if (foundReport) {
          console.log('Found report:', foundReport);
          setReport(foundReport);
          setStatus(foundReport.status);
          toast.success("Report found!");
        } else {
          toast.error(`Report ID ${reportId} not found in ${reports.length} reports`);
          setReport(null);
        }
      } else {
        toast.error("No reports available");
        setReport(null);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error("Failed to search report: " + error.message);
      setReport(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report) {
      toast.error("Please search for a report first");
      return;
    }

    if (!adminReply.trim()) {
      toast.error("Please enter your reply");
      return;
    }

    setLoading(true);
    try {
      await reportsAPI.reply(report.id, adminReply, status);
      toast.success("Reply sent successfully!");
      
      // Reset form
      setReportId("");
      setReport(null);
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

      {/* Search Report */}
      <Card className="shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle>Search Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter Report ID (e.g., 1, 2, 3)"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={searching}>
              <Search className="h-4 w-4 mr-2" />
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Details */}
      {report && (
        <Card className="shadow-card max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📢 Report #{report.id}
              <Badge className={`${
                report.status === "pending" ? "bg-red-100 text-red-800" :
                report.status === "resolved" ? "bg-green-100 text-green-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {report.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reporter Info */}
            <div className="p-4 rounded-lg border bg-muted/20">
              <h3 className="font-semibold mb-3">👤 Reporter Information</h3>
              <div className="space-y-2">
                <p className="font-semibold">{report.reporter_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{report.reporter_phone}</span>
                </div>
                {report.reporter_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{report.reporter_email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(report.created_at).toLocaleString()}</span>
                </div>
                {report.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{report.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Report Details */}
            <div className="p-4 rounded-lg border bg-muted/20">
              <h3 className="font-semibold mb-3">📋 Report Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Type:</p>
                  <Badge variant="outline">{report.report_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subject:</p>
                  <p className="font-medium">{report.subject}</p>
                </div>
                {report.cow_tag && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cow Tag:</p>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="font-mono font-bold text-primary">{report.cow_tag}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message:</p>
                  <div className="p-3 rounded-md bg-background border">
                    <p className="text-sm whitespace-pre-wrap">{report.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reply Form */}
      {report && (
        <Card className="shadow-card max-w-2xl">
          <CardHeader>
            <CardTitle>💬 Send Admin Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
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
      )}
    </div>
  );
};

export default ReplyReport;