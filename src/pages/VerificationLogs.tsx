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
      console.log('Raw verification logs response:', data);
      console.log('Verifications array:', data.verifications);
      if (data.verifications && data.verifications.length > 0) {
        console.log('First log entry:', data.verifications[0]);
      }
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
                  <TableHead>log_id</TableHead>
                  <TableHead>cow_tag</TableHead>
                  <TableHead>similarity_score</TableHead>
                  <TableHead>verified</TableHead>
                  <TableHead>location</TableHead>
                  <TableHead>created_at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading verification logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No verification logs available.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.log_id || index}>
                      <TableCell className="text-sm">
                        {log.log_id || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-primary">
                        {log.cow_tag || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {log.similarity_score !== null && log.similarity_score !== undefined ? `${(log.similarity_score * 100).toFixed(4)}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          log.verified === 'yes' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {log.verified || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.location || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
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