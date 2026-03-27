import { useEffect, useState } from 'react';
import { fetchTables, fetchTableData } from '@/lib/api';
import type { TableData } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DataTable from './DataTable';

export default function TableViewer() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables()
      .then(setTables)
      .catch(() => setError('Não foi possível conectar à API.'));
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    setLoading(true);
    setError(null);
    fetchTableData(selectedTable, page, filters)
      .then(setTableData)
      .catch(() => setError('Erro ao buscar dados da tabela.'))
      .finally(() => setLoading(false));
  }, [selectedTable, page, filters]);

  const handleTableChange = (value: string) => {
    setSelectedTable(value);
    setPage(1);
    setFilters({});
    setTableData(null);
  };

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Tabela:</span>
        <Select onValueChange={handleTableChange} value={selectedTable}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Selecione uma tabela" />
          </SelectTrigger>
          <SelectContent>
            {tables.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {selectedTable && (
        <DataTable
          data={tableData}
          loading={loading}
          page={page}
          filters={filters}
          onPageChange={setPage}
          onFiltersChange={handleFiltersChange}
        />
      )}
    </div>
  );
}
