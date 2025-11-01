import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Phone, Mail, Download, Search, QrCode, Receipt, Eye, Edit, ArrowUpDown } from "lucide-react";
import { cattleAPI, ownersAPI } from "@/services/api";
import { toast } from "sonner";

const RegisteredCows = () => {
  const [cows, setCows] = useState<any[]>([]);
  const [filteredCows, setFilteredCows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [breedFilter, setBreedFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setFilteredCows(cows);
  }, [cows]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewQR = async (cowTag: string) => {
    try {
      window.open(`https://titweng.app/verify/${cowTag}`, '_blank');
    } catch (error) {
      toast.error('Failed to open QR code');
    }
  };

  const handleDownloadReceipt = async (cowTag: string) => {
    try {
      const response = await fetch(`https://titweng-app-a3hufygwcphxhkc2.canadacentral-01.azurewebsites.net/admin/receipt/${cowTag}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cowTag}_receipt.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success('Receipt downloaded successfully');
      } else {
        toast.error('Failed to download receipt');
      }
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleViewFace = async (cowTag: string) => {
    try {
      window.open(`https://titweng-app-a3hufygwcphxhkc2.canadacentral-01.azurewebsites.net/admin/cow/${cowTag}/face`, '_blank');
    } catch (error) {
      toast.error('Failed to view cow face');
    }
  };

  const getUniqueBreeds = () => {
    return [...new Set(cows.map(cow => cow.breed).filter(Boolean))];
  };



  const exportToCSV = () => {
    const headers = [
      'Cow Tag',
      'Owner Name', 
      'Owner Phone',
      'Owner Email',
      'Owner Address',
      'National ID',
      'Breed',
      'Color', 
      'Age',
      'Registration Date'
    ];
    
    const csvData = filteredCows.map(cow => [
      cow.cow_tag || 'N/A',
      cow.owner_full_name || 'N/A',
      cow.owner_phone || 'N/A', 
      cow.owner_email || 'N/A',
      cow.owner_address || 'N/A',
      cow.owner_national_id || 'N/A',
      cow.breed || 'N/A',
      cow.color || 'N/A',
      cow.age || 'N/A',
      cow.registered_at ? new Date(cow.registered_at).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registered-cows-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const fetchCows = async () => {
    setLoading(true);
    try {
      // Fetch both cows and owners data
      const [cowsData, ownersData] = await Promise.all([
        cattleAPI.getAll(),
        ownersAPI.getAll()
      ]);
      
      const cows = cowsData.cows || [];
      const owners = ownersData.owners || [];
      
      // Combine cow data with owner details
      const combinedData = cows.map(cow => {
        const owner = owners.find(o => {
          // Try ID matching first (proper way)
          if (cow.owner_id && o.owner_id === cow.owner_id) {
            return true;
          }
          // Fallback to name matching
          return o.full_name === cow.owner_name;
        });
        
        return {
          ...cow,
          // Use owner data if found, otherwise fallback to cow data
          owner_full_name: owner?.full_name || cow.owner_name,
          owner_phone: owner?.phone || cow.owner_phone,
          owner_email: owner?.email || 'N/A',
          owner_address: owner?.address || 'N/A',
          owner_national_id: owner?.national_id || 'N/A'
        };
      });
      
      setCows(combinedData);
      setFilteredCows(combinedData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registered Cows</h1>
          <p className="text-muted-foreground mt-1">
            Complete details of all registered cows and their owners
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCows} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={exportToCSV} disabled={filteredCows.length === 0} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({filteredCows.length})
          </Button>
        </div>
      </div>





      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">
                    <Button variant="ghost" onClick={() => handleSort('cow_tag')} className="h-auto p-0 font-semibold">
                      Cow Tag <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <Button variant="ghost" onClick={() => handleSort('owner_full_name')} className="h-auto p-0 font-semibold">
                      Owner Name <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[130px]">Owner Phone</TableHead>
                  <TableHead className="min-w-[180px]">Owner Email</TableHead>
                  <TableHead className="min-w-[200px]">Owner Address</TableHead>
                  <TableHead className="min-w-[120px]">National ID</TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button variant="ghost" onClick={() => handleSort('breed')} className="h-auto p-0 font-semibold">
                      Breed <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[80px]">Color</TableHead>
                  <TableHead className="min-w-[60px]">
                    <Button variant="ghost" onClick={() => handleSort('age')} className="h-auto p-0 font-semibold">
                      Age <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <Button variant="ghost" onClick={() => handleSort('registered_at')} className="h-auto p-0 font-semibold">
                      Registration Date <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Loading registered cows...
                    </TableCell>
                  </TableRow>
                ) : filteredCows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      {cows.length === 0 ? 'No cows registered yet.' : 'No cows match your search criteria.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCows.map((cow) => (
                    <TableRow key={cow.cow_id || cow.id}>
                      <TableCell className="font-mono font-bold text-primary whitespace-nowrap">
                        {cow.cow_tag || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cow.owner_full_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{cow.owner_phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{cow.owner_email || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {cow.owner_address || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cow.owner_national_id || 'N/A'}
                      </TableCell>
                      <TableCell>{cow.breed || 'N/A'}</TableCell>
                      <TableCell>{cow.color || 'N/A'}</TableCell>
                      <TableCell>{cow.age || 'N/A'}</TableCell>
                      <TableCell className="text-sm">
                        {cow.registered_at ? new Date(cow.registered_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewQR(cow.cow_tag)}
                            title="View QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownloadReceipt(cow.cow_tag)}
                            title="Download Receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewFace(cow.cow_tag)}
                            title="View Cow Face"
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

export default RegisteredCows;