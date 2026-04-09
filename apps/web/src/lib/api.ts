const API_BASE = 'http://localhost:3004/api';

export interface TableData {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchTables(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/tables`);
  if (!res.ok) throw new Error('Failed to fetch tables');
  const json = await res.json();
  return json.tables as string[];
}

export async function insertRow(
  table: string,
  params: Record<string, unknown>
): Promise<{ data: Record<string, unknown>[]; error?: string }> {
  const res = await fetch(`${API_BASE}/tables/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) return { data: [], error: json.error ?? 'Erro desconhecido' };
  return json as { data: Record<string, unknown>[] };
}

export async function callProcedure(
  name: string,
  params: Record<string, unknown>
): Promise<{ data: Record<string, unknown>[]; error?: string }> {
  const res = await fetch(`${API_BASE}/procedures/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) return { data: [], error: json.error ?? 'Erro desconhecido' };
  return json as { data: Record<string, unknown>[] };
}

export async function fetchTableData(
  tableName: string,
  page: number,
  filters: Record<string, string>
): Promise<TableData> {
  const params = new URLSearchParams({
    page: String(page),
    filters: JSON.stringify(filters),
  });
  const res = await fetch(`${API_BASE}/tables/${tableName}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch table data');
  return res.json() as Promise<TableData>;
}
