import TableViewer from './components/TableViewer';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">Universidade — Visualizador de Dados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Selecione uma tabela para visualizar e filtrar os registros
          </p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <TableViewer />
      </main>
    </div>
  );
}
