import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Eye, CheckCircle, XCircle, Download, Search, ArrowUpDown, Trash2, Calendar } from "lucide-react";
import { verificationAPI } from "@/services/api";
import { toast } from "sonner";

const VerificationLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, verifiedFilter, locationFilter, dateFilter, sortField, sortOrder]);

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

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.cow_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Verified filter
    if (verifiedFilter && verifiedFilter !== 'all') {
      filtered = filtered.filter(log => log.verified === verifiedFilter);
    }

    // Location filter
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(log => log.location === locationFilter);
    }

    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(log => {
            const logDate = new Date(log.created_at);
            return logDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(log => new Date(log.created_at) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(log => new Date(log.created_at) >= filterDate);
          break;
      }
    }

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'created_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['log_id', 'cow_tag', 'similarity_score', 'verified', 'location', 'created_at'];
    const csvData = filteredLogs.map(log => [
      log.log_id || 'N/A',
      log.cow_tag || 'N/A',
      log.similarity_score || 'N/A',
      log.verified || 'N/A',
      log.location || 'N/A',
      log.created_at || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Verification logs exported successfully');
  };

  const getStats = () => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.created_at).toDateString() === today);
    const verifiedCount = logs.filter(log => log.verified === 'yes').length;
    const avgSimilarity = logs.length > 0 ? logs.reduce((sum, log) => sum + (log.similarity_score || 0), 0) / logs.length : 0;
    const topCowTag = logs.reduce((acc, log) => {
      if (log.cow_tag) {
        acc[log.cow_tag] = (acc[log.cow_tag] || 0) + 1;
      }
      return acc;
    }, {});
    const mostVerified = Object.entries(topCowTag).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    return {
      totalToday: todayLogs.length,
      successRate: logs.length > 0 ? ((verifiedCount / logs.length) * 100).toFixed(1) : '0',
      avgSimilarity: (avgSimilarity * 100).toFixed(2),
      mostVerified
    };
  };

  const getUniqueLocations = () => {
    return [...new Set(logs.map(log => log.location).filter(Boolean))];
  };

  const stats = getStats();
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verification Logs</h1>
          <p className="text-muted-foreground mt-1">
            View all cow verification attempts and results
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={exportToCSV} disabled={filteredLogs.length === 0} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({filteredLogs.length})
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Similarity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgSimilarity}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-orange-600">{stats.mostVerified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cow tag or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="yes">Verified</SelectItem>
                <SelectItem value="no">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {getUniqueLocations().map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setVerifiedFilter("all");
                setLocationFilter("all");
                setDateFilter("all");
                setSortField("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('log_id')} className="h-auto p-0 font-semibold">
                      log_id <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('cow_tag')} className="h-auto p-0 font-semibold">
                      cow_tag <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('similarity_score')} className="h-auto p-0 font-semibold">
                      similarity_score <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('verified')} className="h-auto p-0 font-semibold">
                      verified <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('location')} className="h-auto p-0 font-semibold">
                      location <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('created_at')} className="h-auto p-0 font-semibold">
                      created_at <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
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
                ) : paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {logs.length === 0 ? 'No verification logs available.' : 'No logs match your search criteria.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log, index) => (
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
                        <div className="flex items-center gap-2">
                          {log.verified === 'yes' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            log.verified === 'yes' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {log.verified || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.location || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Delete Log" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} results
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationLogs;