import { useState } from 'react';
import { callProcedure } from '../lib/api';

type Row = Record<string, unknown>;

function ResultTable({ data }: { data: Row[] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">Nenhum resultado.</p>;
  const cols = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto mt-4 rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                {c}
              </th>
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
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function ProcedureCard({
  title,
  description,
  children,
  onSubmit,
  loading,
  result,
  error,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: () => void;
  loading: boolean;
  result: Row[] | null;
  error: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Executando...' : 'Executar'}
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

// --- sp_MatricularAluno ---
function MatricularAluno() {
  const [f, setF] = useState({ matricula: '', curso: '', perletivo: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await callProcedure('matricular-aluno', {
      matricula: Number(f.matricula),
      curso: f.curso,
      perletivo: Number(f.perletivo),
    });
    setLoading(false);
    if (res.error) setError(res.error);
    else setResult(res.data);
  };

  return (
    <ProcedureCard
      title="sp_MatricularAluno"
      description="Matricula o aluno em todas as disciplinas do curso para o período letivo informado."
      onSubmit={handle}
      loading={loading}
      result={result}
      error={error}
    >
      <Field label="Matrícula" name="matricula" type="number" value={f.matricula} onChange={(v) => setF({ ...f, matricula: v })} placeholder="1" />
      <Field label="Curso" name="curso" value={f.curso} onChange={(v) => setF({ ...f, curso: v })} placeholder="ENG" />
      <Field label="Período Letivo" name="perletivo" type="number" value={f.perletivo} onChange={(v) => setF({ ...f, perletivo: v })} placeholder="2025" />
    </ProcedureCard>
  );
}

// --- sp_CadastraNotas ---
function CadastraNotas() {
  const [f, setF] = useState({ matricula: '', curso: '', materia: '', perletivo: '', nota: '', falta: '', bimestre: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await callProcedure('cadastra-notas', {
      matricula: Number(f.matricula),
      curso: f.curso,
      materia: f.materia,
      perletivo: Number(f.perletivo),
      nota: Number(f.nota),
      falta: Number(f.falta),
      bimestre: Number(f.bimestre),
    });
    setLoading(false);
    if (res.error) setError(res.error);
    else setResult(res.data);
  };

  return (
    <ProcedureCard
      title="sp_CadastraNotas"
      description="Lança nota e faltas de um bimestre. No 4º bimestre apura média, frequência e resultado."
      onSubmit={handle}
      loading={loading}
      result={result}
      error={error}
    >
      <Field label="Matrícula" name="matricula" type="number" value={f.matricula} onChange={(v) => setF({ ...f, matricula: v })} placeholder="1" />
      <Field label="Curso" name="curso" value={f.curso} onChange={(v) => setF({ ...f, curso: v })} placeholder="ENG" />
      <Field label="Matéria" name="materia" value={f.materia} onChange={(v) => setF({ ...f, materia: v })} placeholder="BDA" />
      <Field label="Período Letivo" name="perletivo" type="number" value={f.perletivo} onChange={(v) => setF({ ...f, perletivo: v })} placeholder="2025" />
      <Field label="Nota" name="nota" type="number" value={f.nota} onChange={(v) => setF({ ...f, nota: v })} placeholder="8.5" />
      <Field label="Faltas" name="falta" type="number" value={f.falta} onChange={(v) => setF({ ...f, falta: v })} placeholder="0" />
      <Field label="Bimestre (1–4)" name="bimestre" type="number" value={f.bimestre} onChange={(v) => setF({ ...f, bimestre: v })} placeholder="1" />
    </ProcedureCard>
  );
}

// --- sp_LancarExame ---
function LancarExame() {
  const [f, setF] = useState({ matricula: '', curso: '', materia: '', perletivo: '', notaExame: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await callProcedure('lancar-exame', {
      matricula: Number(f.matricula),
      curso: f.curso,
      materia: f.materia,
      perletivo: Number(f.perletivo),
      notaExame: Number(f.notaExame),
    });
    setLoading(false);
    if (res.error) setError(res.error);
    else setResult(res.data);
  };

  return (
    <ProcedureCard
      title="sp_LancarExame"
      description="Lança nota de exame para alunos com resultado EXAME. Recalcula média final e apura resultado."
      onSubmit={handle}
      loading={loading}
      result={result}
      error={error}
    >
      <Field label="Matrícula" name="matricula" type="number" value={f.matricula} onChange={(v) => setF({ ...f, matricula: v })} placeholder="1" />
      <Field label="Curso" name="curso" value={f.curso} onChange={(v) => setF({ ...f, curso: v })} placeholder="ENG" />
      <Field label="Matéria" name="materia" value={f.materia} onChange={(v) => setF({ ...f, materia: v })} placeholder="BDA" />
      <Field label="Período Letivo" name="perletivo" type="number" value={f.perletivo} onChange={(v) => setF({ ...f, perletivo: v })} placeholder="2025" />
      <Field label="Nota do Exame" name="notaExame" type="number" value={f.notaExame} onChange={(v) => setF({ ...f, notaExame: v })} placeholder="6.0" />
    </ProcedureCard>
  );
}

export default function ProcedureRunner() {
  return (
    <div className="flex flex-col gap-6">
      <MatricularAluno />
      <CadastraNotas />
      <LancarExame />
    </div>
  );
}
