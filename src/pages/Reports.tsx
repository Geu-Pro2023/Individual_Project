import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle } from "lucide-react";
import { ReportDetailsModal } from "@/components/reports/ReportDetailsModal";
import { reportsAPI } from "@/services/api";
import { toast } from "sonner";

const mockReports = [
  { 
    id: "RPT-001", 
    date: "2025-10-24", 
    reporter: { name: "John Doe", phone: "+250 788 111 222", email: "john@email.com" },
    type: "Lost Cattle", 
    status: "urgent" as const, 
    cow: "TW-2025-BWF-0042",
    submittedAt: "Oct 24, 2025 at 14:30",
    location: "Nyabugogo Market",
    description: "I saw someone trying to steal a cow that matches this tag. The person was acting suspiciously and couldn't provide ownership documents when questioned."
  },
  { 
    id: "RPT-002", 
    date: "2025-10-23", 
    reporter: { name: "Jane Smith", phone: "+250 788 222 333", email: "jane@email.com" },
    type: "Ownership Dispute", 
    status: "pending" as const, 
    cow: "TW-2025-HLS-0156",
    submittedAt: "Oct 23, 2025 at 09:15",
    location: "Kigali Central",
    description: "There is a dispute about the ownership of this cattle between two parties."
  },
  { 
    id: "RPT-003", 
    date: "2025-10-22", 
    reporter: { name: "Bob Wilson", phone: "+250 788 333 444", email: "bob@email.com" },
    type: "Health Issue", 
    status: "urgent" as const, 
    cow: "TW-2025-JRS-0089",
    submittedAt: "Oct 22, 2025 at 16:45",
    location: "Huye District",
    description: "The cow appears to be sick and needs immediate veterinary attention."
  },
  { 
    id: "RPT-004", 
    date: "2025-10-20", 
    reporter: { name: "Alice Brown", phone: "+250 788 444 555", email: "alice@email.com" },
    type: "Tag Damage", 
    status: "resolved" as const, 
    cow: "TW-2025-ANG-0178",
    submittedAt: "Oct 20, 2025 at 11:20",
    location: "Musanze",
    description: "The ear tag has been damaged and needs replacement."
  },
];

const Reports = () => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reportsAPI.getAll();
      setReports(data.reports || []);
    } catch (error) {
      toast.error('Failed to load reports');
      console.error('Reports fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: any) => {
    setSelectedReport({
      id: report.id,
      reporter: {
        name: report.reporter_name,
        phone: report.reporter_phone,
        email: report.reporter_email,
      },
      submittedAt: new Date(report.created_at).toLocaleString(),
      location: report.location,
      cowTag: report.cow_tag,
      type: report.report_type,
      status: report.status,
      description: report.message,
    });
    setDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports Management</h1>
          <p className="text-muted-foreground mt-1">Loading reports...</p>
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage submitted reports
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cow Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No reports available.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono font-semibold">
                        RPT-{report.id.toString().padStart(3, '0')}
                      </TableCell>
                      <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{report.reporter_name}</TableCell>
                      <TableCell>{report.report_type}</TableCell>
                      <TableCell className="font-mono text-primary">{report.cow_tag || 'N/A'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            report.status === "pending"
                              ? "bg-urgent/10 text-urgent"
                              : report.status === "in_progress"
                              ? "bg-warning/10 text-warning"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {report.status === "pending" && "⚠️ "}
                          {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {report.status !== "resolved" && (
                            <Button size="icon" variant="ghost" className="text-success">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReportDetailsModal 
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
};

export default Reports;
