import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

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
  const reports = mockReports.map(report => ({
    id: report.id.split('-')[1],
    created_at: report.date,
    reporter_name: report.reporter.name,
    reporter_phone: report.reporter.phone,
    reporter_email: report.reporter.email,
    report_type: report.type,
    cow_tag: report.cow,
    status: report.status,
    location: report.location,
    message: report.description
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Get all Reports</h1>
        <p className="text-muted-foreground mt-1">
          View all submitted reports from users
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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


    </div>
  );
};

export default Reports;
