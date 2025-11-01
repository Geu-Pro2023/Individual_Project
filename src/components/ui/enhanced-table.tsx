import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface EnhancedTableProps {
  columns: Column[];
  data: any[];
  selectable?: boolean;
  onSelectionChange?: (selected: any[]) => void;
}

export const EnhancedTable = ({ columns, data, selectable, onSelectionChange }: EnhancedTableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    
    const selectedData = Array.from(newSelected).map(i => sortedData[i]);
    onSelectionChange?.(selectedData);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(sortedData.map((_, i) => i));
      setSelectedRows(allIndices);
      onSelectionChange?.(sortedData);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-b from-card to-card/50 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 hover:bg-muted/60">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-semibold",
                  column.sortable && "cursor-pointer hover:bg-muted/50 transition-colors"
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <div className="transition-transform duration-200">
                      {sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow
              key={index}
              className={cn(
                "transition-all duration-200 hover:bg-muted/30 hover:shadow-sm",
                selectedRows.has(index) && "bg-primary/5 border-l-4 border-l-primary"
              )}
            >
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(index)}
                    onCheckedChange={(checked) => handleRowSelect(index, checked as boolean)}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key} className="transition-colors">
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};