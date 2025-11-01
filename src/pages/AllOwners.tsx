import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Phone, Mail } from "lucide-react";
import { ownersAPI } from "@/services/api";

const AllOwners = () => {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const data = await ownersAPI.getAll();
      setOwners(data.owners || []);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Get all Owners</h1>
          <p className="text-muted-foreground mt-1">
            View all registered cow owners
          </p>
        </div>
        <Button onClick={fetchOwners} disabled={loading}>
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
                  <TableHead>Owner ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading owners...
                    </TableCell>
                  </TableRow>
                ) : owners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No owners registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  owners.map((owner) => (
                    <TableRow key={owner.owner_id || owner.id}>
                      <TableCell className="font-mono font-semibold">
                        {owner.owner_id || owner.id || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {owner.owner_full_name || owner.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{owner.owner_phone || owner.phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{owner.owner_email || owner.email || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{owner.owner_address || owner.address || 'N/A'}</TableCell>
                      <TableCell className="font-mono">
                        {owner.owner_national_id || owner.national_id || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {owner.created_at ? new Date(owner.created_at).toLocaleDateString() : 'N/A'}
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

export default AllOwners;