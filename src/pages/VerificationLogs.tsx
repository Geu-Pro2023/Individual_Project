import { useState, useEffect } from "react";
import { Download, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verificationAPI } from "@/services/api";
import { toast } from "sonner";

const mockLogs = [
  { time: "14:30:15", method: "Nose Print", tag: "TW-2025-BWF-0042", similarity: "97.3%", result: "Match", location: "Kigali" },
  { time: "14:25:42", method: "Tag Lookup", tag: "TW-2025-HLS-0156", similarity: "100%", result: "Match", location: "Musanze" },
  { time: "14:20:18", method: "Nose Print", tag: "Unknown", similarity: "45.2%", result: "No Match", location: "Huye" },
  { time: "14:15:33", method: "Tag Lookup", tag: "TW-2025-JRS-0089", similarity: "100%", result: "Match", location: "Rubavu" },
  { time: "14:10:07", method: "Nose Print", tag: "TW-2025-ANG-0178", similarity: "94.8%", result: "Match", location: "Nyagatare" },
  { time: "14:05:51", method: "Nose Print", tag: "TW-2025-GRN-0234", similarity: "88.5%", result: "Match", location: "Karongi" },
];

const VerificationLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await verificationAPI.getLogs();
      setLogs(data.verifications || []);
    } catch (error) {
      toast.error('Failed to load verification logs');
      console.error('Verification logs fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification Activity Logs</h1>
          <p className="text-muted-foreground mt-1">Loading verification history...</p>
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verification Activity Logs</h1>
          <p className="text-muted-foreground mt-1">
            Detailed history of all verification attempts
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select defaultValue="7days">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Method</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="nose">Nose Print</SelectItem>
                  <SelectItem value="tag">Tag Lookup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="match">Match Found</SelectItem>
                  <SelectItem value="nomatch">No Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kigali">Kigali</SelectItem>
                  <SelectItem value="musanze">Musanze</SelectItem>
                  <SelectItem value="huye">Huye</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Cow Tag</TableHead>
                  <TableHead>Similarity</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No verification logs available.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.verification_method === "nose_print" ? "📸 Nose Print" : "🏷️ Tag Lookup"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-primary">
                        {log.cow_tag || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          log.similarity_score >= 95 ? "text-success" :
                          log.similarity_score >= 85 ? "text-warning" :
                          "text-destructive"
                        }`}>
                          {log.similarity_score ? `${log.similarity_score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge className="bg-success/10 text-success">
                            ✅ Match
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/10 text-destructive">
                            ❌ No Match
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.location || 'Not specified'}</TableCell>
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

export default VerificationLogs;
