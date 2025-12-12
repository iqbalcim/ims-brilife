
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

export interface Column<T> {
  key: string;
  header: string | ReactNode;
  cell?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string; // For alignment (text-right, etc)
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
  };
  onRowClick?: (item: T) => void; // Optional clickable rows? Or handle in cell render
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Tidak ada data',
  pagination,
  sorting,
}: DataTableProps<T>) {

  const handleSort = (key: string) => {
    if (sorting && sorting.onSort) {
      sorting.onSort(key);
    }
  };

  return (
    <Card className="border-0 shadow-sm ring-1 ring-inset ring-border overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      'font-semibold text-foreground',
                      col.sortable ? 'cursor-pointer select-none hover:text-muted-foreground' : '',
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={cn("flex items-center gap-1", col.className?.includes('text-right') ? 'justify-end' : '')}>
                      {col.header}
                      {sorting && col.sortable && sorting.sortBy === col.key && (
                        <span className="text-xs ml-1">
                          {sorting.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                      {sorting && col.sortable && sorting.sortBy !== col.key && (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-50" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton Loading State
                [...Array(5)].map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                        <Skeleton className="h-4 w-full opacity-50" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                data.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-accent/40 transition-colors border-b last:border-0"
                  >
                    {columns.map((col) => (
                      <TableCell key={`${item.id}-${col.key}`} className={col.className}>
                        {col.cell
                          ? col.cell(item)
                          : (item as any)[col.key] // Fallback to direct property access
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {!loading && data.length > 0 && pagination && (
          <div className="flex items-center justify-between border-t px-4 py-3 bg-background">
            <p className="text-sm text-muted-foreground w-full md:w-auto">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
            </p>
            <Pagination className="justify-end w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => { if (pagination.page > 1) pagination.onPageChange(pagination.page - 1); }}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm font-medium px-4">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => { if (pagination.page < pagination.totalPages) pagination.onPageChange(pagination.page + 1); }}
                    className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
