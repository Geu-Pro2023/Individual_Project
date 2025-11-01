import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { cattleAPI } from "@/services/api";

const AllCows = () => {
  const [cows, setCows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCows();
  }, []);

  const fetchCows = async () => {
    setLoading(true);
    try {
      const data = await cattleAPI.getAll();
      setCows(data.cows || []);
    } catch (error) {
      console.error('Failed to fetch cows:', error);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Get all Registered Cows</h1>
          <p className="text-muted-foreground mt-1">
            View all registered cows in the system
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
                  <TableHead>Cow Tag</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading cows...
                    </TableCell>
                  </TableRow>
                ) : cows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No cows registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  cows.map((cow) => (
                    <TableRow key={cow.cow_id || cow.id}>
                      <TableCell className="font-mono font-bold text-primary">
                        {cow.cow_tag || 'N/A'}
                      </TableCell>
                      <TableCell>{cow.owner_full_name || 'N/A'}</TableCell>
                      <TableCell>{cow.breed || 'N/A'}</TableCell>
                      <TableCell>{cow.color || 'N/A'}</TableCell>
                      <TableCell>{cow.age || 'N/A'}</TableCell>
                      <TableCell>
                        {cow.created_at ? new Date(cow.created_at).toLocaleDateString() : 'N/A'}
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

export default AllCows;