import { useState, useEffect } from "react";
import { Search, Filter, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CowDetailsModal } from "@/components/cattle/CowDetailsModal";
import { TransferWizard } from "@/components/transfer/TransferWizard";
import { DataExport } from "@/components/ui/data-export";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { cattleAPI } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "@/lib/translations";

const Cattle = () => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [transferWizardOpen, setTransferWizardOpen] = useState(false);
  const [selectedCow, setSelectedCow] = useState<any>(null);
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupByOwner, setGroupByOwner] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      const data = await cattleAPI.getAll();
      setCattle(data.cows || []);
    } catch (error) {
      toast.error('Failed to load cattle data');
      console.error('Cattle fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCattle = cattle.filter(cow => 
    cow.cow_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cow.owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cow.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group cattle by owner
  const groupedCattle = filteredCattle.reduce((groups: any, cow: any) => {
    const ownerName = cow.owner_full_name || 'Unknown Owner';
    if (!groups[ownerName]) {
      groups[ownerName] = [];
    }
    groups[ownerName].push(cow);
    return groups;
  }, {});

  const handleViewDetails = (cow: any) => {
    setSelectedCow({
      tag: cow.cow_tag,
      breed: cow.breed,
      color: cow.color,
      age: cow.age,
      status: "Active",
      registeredDate: cow.created_at,
      owner: {
        name: cow.owner_full_name,
        phone: cow.owner_phone,
        email: cow.owner_email,
        address: cow.owner_address,
        nationalId: cow.owner_national_id,
      },
      nosePrints: cow.nose_print_images || [],
    });
    setDetailsModalOpen(true);
  };

  const handleDeleteCow = async (cowTag: string) => {
    if (!confirm('Are you sure you want to delete this cow? This action cannot be undone.')) {
      return;
    }
    
    try {
      await cattleAPI.delete(cowTag);
      toast.success('Cow deleted successfully');
      fetchCattle();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete cow');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('cattleManagement')}</h1>
          <p className="text-muted-foreground mt-1">{t('loading')}</p>
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{t('cattleManagement')}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t('cattleList')}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant={groupByOwner ? "default" : "outline"}
            onClick={() => setGroupByOwner(!groupByOwner)}
            className="whitespace-nowrap"
          >
            {groupByOwner ? '📋 List View' : '👥 Group by Owner'}
          </Button>
          <BarcodeScanner onScanResult={(result) => setSearchTerm(result)} />
          <DataExport 
            data={filteredCattle}
            filename="south-sudan-cattle-data"
            availableColumns={[
              { key: 'cow_tag', label: 'Cow Tag' },
              { key: 'owner_full_name', label: 'Owner Name' },
              { key: 'breed', label: 'Breed' },
              { key: 'color', label: 'Color' },
              { key: 'age', label: 'Age' },
              { key: 'created_at', label: 'Registration Date' },
            ]}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('search')} & {t('filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`${t('search')} by tag, owner name, or breed...`}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" />
              {t('filter')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Display - Table or Grouped View */}
      {groupByOwner ? (
        /* Grouped by Owner View */
        <div className="space-y-4">
          {Object.keys(groupedCattle).length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                {searchTerm ? 'No cattle found matching your search' : 'No cattle registered yet'}
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedCattle).map(([ownerName, ownerCattle]: [string, any]) => (
              <Card key={ownerName} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        👥 {ownerName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ownerCattle.length} {ownerCattle.length === 1 ? 'cow' : 'cows'} registered
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{ownerCattle.length}</div>
                      <div className="text-xs text-muted-foreground">Total Cattle</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('cattleId')}</TableHead>
                          <TableHead>{t('breed')}</TableHead>
                          <TableHead>{t('color')}</TableHead>
                          <TableHead>{t('age')}</TableHead>
                          <TableHead>{t('registrationDate')}</TableHead>
                          <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ownerCattle.map((cow: any) => (
                          <TableRow key={cow.id}>
                            <TableCell className="font-mono font-semibold text-primary">
                              {cow.cow_tag}
                            </TableCell>
                            <TableCell>{cow.breed}</TableCell>
                            <TableCell>{cow.color}</TableCell>
                            <TableCell>{cow.age} years</TableCell>
                            <TableCell>{new Date(cow.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1 sm:gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleViewDetails(cow)}
                                  title={t('view')}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setTransferWizardOpen(true)}
                                  title="Transfer Ownership"
                                  className="h-8 w-8 p-0"
                                >
                                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" title={t('edit')} className="h-8 w-8 p-0">
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-destructive h-8 w-8 p-0" 
                                  title={t('delete')}
                                  onClick={() => handleDeleteCow(cow.cow_tag)}
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Regular Table View */
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('cattleId')}</TableHead>
                    <TableHead>{t('ownerName')}</TableHead>
                    <TableHead>{t('breed')}</TableHead>
                    <TableHead>{t('color')}</TableHead>
                    <TableHead>{t('age')}</TableHead>
                    <TableHead>{t('registrationDate')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCattle.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? t('noData') : t('noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCattle.map((cow) => (
                      <TableRow key={cow.id}>
                        <TableCell className="font-mono font-semibold text-primary">
                          {cow.cow_tag}
                        </TableCell>
                        <TableCell>{cow.owner_full_name}</TableCell>
                        <TableCell>{cow.breed}</TableCell>
                        <TableCell>{cow.color}</TableCell>
                        <TableCell>{cow.age} years</TableCell>
                        <TableCell>{new Date(cow.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewDetails(cow)}
                              title={t('view')}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setTransferWizardOpen(true)}
                              title="Transfer Ownership"
                              className="h-8 w-8 p-0"
                            >
                              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" title={t('edit')} className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive h-8 w-8 p-0" 
                              title={t('delete')}
                              onClick={() => handleDeleteCow(cow.cow_tag)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
      )}

      <CowDetailsModal 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        cow={selectedCow}
      />

      <TransferWizard 
        open={transferWizardOpen} 
        onClose={() => setTransferWizardOpen(false)}
      />
    </div>
  );
};

export default Cattle;
