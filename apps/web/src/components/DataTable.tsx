import type { TableData } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface DataTableProps {
  data: TableData | null;
  loading: boolean;
  page: number;
  filters: Record<string, string>;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: Record<string, string>) => void;
}

export default function DataTable({
  data,
  loading,
  page,
  filters,
  onPageChange,
  onFiltersChange,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (!data) return null;

  if (data.data.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Nenhum registro encontrado.
      </div>
    );
  }

  const columns = Object.keys(data.data[0]);

  const handleFilterChange = (col: string, value: string) => {
    onFiltersChange({ ...filters, [col]: value });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col} className="align-top py-3">
                  <div className="space-y-2 min-w-[100px]">
                    <span className="font-semibold text-foreground">{col}</span>
                    <Input
                      placeholder={`Filtrar...`}
                      value={filters[col] ?? ''}
                      onChange={(e) => handleFilterChange(col, e.target.value)}
                      className="h-7 text-xs font-normal"
                    />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col} className="max-w-[200px] truncate">
                    {row[col] == null ? (
                      <span className="text-muted-foreground italic text-xs">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {data.total} registro(s) &mdash; Página {page} de {data.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= data.totalPages}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
