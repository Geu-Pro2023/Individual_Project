import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Eye, CheckCircle, XCircle } from "lucide-react";
import { verificationAPI } from "@/services/api";

const VerificationLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await verificationAPI.getLogs();
      setLogs(data.verifications || []);
    } catch (error) {
      console.error('Failed to fetch verification logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Get Verification Log</h1>
          <p className="text-muted-foreground mt-1">
            View all cow verification attempts and results
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Cow Tag</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Similarity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading verification logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No verification logs available.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.id || index}>
                      <TableCell className="text-sm">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-primary">
                        {log.cow_tag || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          log.method === 'nose_print' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.method === 'nose_print' ? '👃 Nose Print' : '🏷️ Tag'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            log.verified ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {log.verified ? 'Verified' : 'Failed'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.similarity ? `${(log.similarity * 100).toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.location || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
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

export default VerificationLogs;