import { useState } from 'react';
import { insertRow } from '../lib/api';

type Row = Record<string, unknown>;

function ResultTable({ data }: { data: Row[] }) {
  if (!data.length) return null;
  const cols = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto mt-4 rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-border hover:bg-muted/40 transition-colors">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 whitespace-nowrap">
                  {row[c] == null ? <span className="text-muted-foreground italic">null</span> : String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({
  label, name, type = 'text', value, onChange, placeholder, required = true,
}: {
  label: string; name: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}{!required && <span className="ml-1 normal-case">(opcional)</span>}
      </label>
      <input
        name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function InsertCard({
  title, description, children, onSubmit, loading, result, error,
}: {
  title: string; description: string; children: React.ReactNode;
  onSubmit: () => void; loading: boolean; result: Row[] | null; error: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
      <button
        onClick={onSubmit} disabled={loading}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Inserindo...' : 'Inserir'}
      </button>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {result && <ResultTable data={result} />}
    </div>
  );
}

function InsertAluno() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true); setError(null); setResult(null);
    const res = await insertRow('ALUNOS', { nome });
    setLoading(false);
    if (res.error) setError(res.error); else setResult(res.data);
  };

  return (
    <InsertCard title="Inserir Aluno" description="Cadastra um novo aluno. A matrícula é gerada automaticamente."
      onSubmit={handle} loading={loading} result={result} error={error}>
      <Field label="Nome" name="nome" value={nome} onChange={setNome} placeholder="Pedro" />
    </InsertCard>
  );
}

function InsertCurso() {
  const [f, setF] = useState({ curso: '', nome: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true); setError(null); setResult(null);
    const res = await insertRow('CURSOS', f);
    setLoading(false);
    if (res.error) setError(res.error); else setResult(res.data);
  };

  return (
    <InsertCard title="Inserir Curso" description="Cadastra um novo curso com sigla de 3 letras."
      onSubmit={handle} loading={loading} result={result} error={error}>
      <Field label="Sigla (3 chars)" name="curso" value={f.curso} onChange={(v) => setF({ ...f, curso: v })} placeholder="ENG" />
      <Field label="Nome" name="nome" value={f.nome} onChange={(v) => setF({ ...f, nome: v })} placeholder="ENGENHARIA" />
    </InsertCard>
  );
}

function InsertProfessor() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true); setError(null); setResult(null);
    const res = await insertRow('PROFESSOR', { nome });
    setLoading(false);
    if (res.error) setError(res.error); else setResult(res.data);
  };

  return (
    <InsertCard title="Inserir Professor" description="Cadastra um novo professor. O código é gerado automaticamente."
      onSubmit={handle} loading={loading} result={result} error={error}>
      <Field label="Nome" name="nome" value={nome} onChange={setNome} placeholder="DORNEL" />
    </InsertCard>
  );
}

function InsertMateria() {
  const [f, setF] = useState({ sigla: '', nome: '', cargaHoraria: '', curso: '', professor: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true); setError(null); setResult(null);
    const res = await insertRow('MATERIAS', {
      sigla: f.sigla,
      nome: f.nome,
      cargaHoraria: Number(f.cargaHoraria),
      curso: f.curso,
      professor: f.professor ? Number(f.professor) : undefined,
    });
    setLoading(false);
    if (res.error) setError(res.error); else setResult(res.data);
  };

  return (
    <InsertCard title="Inserir Matéria" description="Cadastra uma nova matéria vinculada a um curso e, opcionalmente, a um professor."
      onSubmit={handle} loading={loading} result={result} error={error}>
      <Field label="Sigla (3 chars)" name="sigla" value={f.sigla} onChange={(v) => setF({ ...f, sigla: v })} placeholder="BDA" />
      <Field label="Nome" name="nome" value={f.nome} onChange={(v) => setF({ ...f, nome: v })} placeholder="BANCO DE DADOS" />
      <Field label="Carga Horária" name="cargaHoraria" type="number" value={f.cargaHoraria} onChange={(v) => setF({ ...f, cargaHoraria: v })} placeholder="144" />
      <Field label="Curso" name="curso" value={f.curso} onChange={(v) => setF({ ...f, curso: v })} placeholder="ENG" />
      <Field label="Cód. Professor" name="professor" type="number" value={f.professor} onChange={(v) => setF({ ...f, professor: v })} placeholder="1" required={false} />
    </InsertCard>
  );
}

export default function InsertRunner() {
  return (
    <div className="flex flex-col gap-6">
      <InsertAluno />
      <InsertCurso />
      <InsertProfessor />
      <InsertMateria />
    </div>
  );
}
