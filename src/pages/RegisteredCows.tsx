import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Phone, Mail } from "lucide-react";
import { cattleAPI, ownersAPI } from "@/services/api";

const RegisteredCows = () => {
  const [cows, setCows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        <Button onClick={fetchCows} disabled={loading}>
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
                  <TableHead className="min-w-[120px]">Cow Tag</TableHead>
                  <TableHead className="min-w-[150px]">Owner Name</TableHead>
                  <TableHead className="min-w-[130px]">Owner Phone</TableHead>
                  <TableHead className="min-w-[180px]">Owner Email</TableHead>
                  <TableHead className="min-w-[200px]">Owner Address</TableHead>
                  <TableHead className="min-w-[120px]">National ID</TableHead>
                  <TableHead className="min-w-[100px]">Breed</TableHead>
                  <TableHead className="min-w-[80px]">Color</TableHead>
                  <TableHead className="min-w-[60px]">Age</TableHead>
                  <TableHead className="min-w-[120px]">Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Loading registered cows...
                    </TableCell>
                  </TableRow>
                ) : cows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No cows registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  cows.map((cow) => (
                    <TableRow key={cow.cow_id || cow.id}>
                      <TableCell className="font-mono font-bold text-primary">
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