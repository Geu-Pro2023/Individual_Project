import { useState } from "react";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  columns: string[];
  includeImages: boolean;
  dateRange?: { start: string; end: string };
}

interface DataExportProps {
  data: any[];
  filename: string;
  availableColumns: { key: string; label: string }[];
}

export const DataExport = ({ data, filename, availableColumns }: DataExportProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    availableColumns.map(col => col.key)
  );
  const [includeImages, setIncludeImages] = useState(false);

  const exportToPDF = (options: ExportOptions) => {
    // Create PDF content
    const content = data.map(row => 
      options.columns.reduce((acc, col) => ({ ...acc, [col]: row[col] }), {})
    );
    
    // Simple PDF generation (in real app, use jsPDF or similar)
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (options: ExportOptions) => {
    // Create Excel-compatible CSV
    const headers = options.columns.map(col => 
      availableColumns.find(c => c.key === col)?.label || col
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        options.columns.map(col => `"${row[col] || ''}"`).join(',')
      )
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (options: ExportOptions) => {
    const headers = options.columns.map(col => 
      availableColumns.find(c => c.key === col)?.label || col
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        options.columns.map(col => `"${row[col] || ''}"`).join(',')
      )
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const options: ExportOptions = {
      format,
      columns: selectedColumns,
      includeImages,
    };

    switch (format) {
      case 'pdf':
        exportToPDF(options);
        break;
      case 'excel':
        exportToExcel(options);
        break;
      case 'csv':
        exportToCSV(options);
        break;
    }

    toast.success(`Data exported as ${format.toUpperCase()}`);
    setShowOptions(false);
  };

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="transition-all duration-200 hover:scale-105">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <File className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowOptions(true)}>
            <Download className="mr-2 h-4 w-4" />
            Custom Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select Columns</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {availableColumns.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.key}
                      checked={selectedColumns.includes(column.key)}
                      onCheckedChange={() => toggleColumn(column.key)}
                    />
                    <Label htmlFor={column.key} className="text-sm">
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeImages"
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
              />
              <Label htmlFor="includeImages" className="text-sm">
                Include Images (PDF only)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleExport('csv')} className="flex-1">
                Export CSV
              </Button>
              <Button onClick={() => handleExport('excel')} className="flex-1">
                Export Excel
              </Button>
              <Button onClick={() => handleExport('pdf')} className="flex-1">
                Export PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};