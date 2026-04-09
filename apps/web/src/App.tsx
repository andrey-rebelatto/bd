import { useState } from 'react';
import TableViewer from './components/TableViewer';
import ProcedureRunner from './components/ProcedureRunner';
import InsertRunner from './components/InsertRunner';

const TABS = [
  { id: 'tables', label: 'Tabelas' },
  { id: 'inserts', label: 'Inserções' },
  { id: 'procedures', label: 'Procedures' },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<Tab>('tables');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">Universidade — Banco de Dados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize tabelas e execute procedures do banco
          </p>
        </div>
        <div className="container mx-auto px-6 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {tab === 'tables' && <TableViewer />}
        {tab === 'inserts' && <InsertRunner />}
        {tab === 'procedures' && <ProcedureRunner />}
      </main>
    </div>
  );
}
