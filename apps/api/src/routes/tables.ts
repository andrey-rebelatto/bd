import { Router, Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../db';

const router = Router();

const ALLOWED_TABLES = ['ALUNOS', 'CURSOS', 'PROFESSOR', 'MATERIAS', 'MATRICULA'] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

function isAllowed(name: string): name is AllowedTable {
  return (ALLOWED_TABLES as readonly string[]).includes(name.toUpperCase());
}

// GET /api/tables — list available tables
router.get('/', (_req: Request, res: Response) => {
  res.json({ tables: ALLOWED_TABLES });
});

// GET /api/tables/:tableName?page=1&filters={"COL":"value"}
router.get('/:tableName', async (req: Request, res: Response) => {
  const table = req.params.tableName.toUpperCase();

  if (!isAllowed(table)) {
    res.status(400).json({ error: 'Table not allowed' });
    return;
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // Parse column filters
  const filters: Record<string, string> = {};
  const filterParam = req.query.filters as string | undefined;
  if (filterParam) {
    try {
      const parsed = JSON.parse(filterParam);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string' && v.trim() !== '') {
            // Validate column name: only alphanumeric and underscore
            if (!/^[A-Za-z0-9_]+$/.test(k)) {
              res.status(400).json({ error: `Invalid column name: ${k}` });
              return;
            }
            filters[k] = v;
          }
        }
      }
    } catch {
      res.status(400).json({ error: 'Invalid filters JSON' });
      return;
    }
  }

  try {
    const pool = await getPool();

    // Build WHERE clause using parameterized LIKE for each filter
    const filterEntries = Object.entries(filters);
    const whereClause =
      filterEntries.length > 0
        ? 'WHERE ' +
          filterEntries
            .map(([col]) => `CAST(${col} AS NVARCHAR(MAX)) LIKE @filter_${col}`)
            .join(' AND ')
        : '';

    // Count query
    const countReq = pool.request();
    filterEntries.forEach(([col, val]) => {
      countReq.input(`filter_${col}`, sql.NVarChar, `%${val}%`);
    });
    const countResult = await countReq.query(
      `SELECT COUNT(*) AS total FROM ${table} ${whereClause}`
    );
    const total: number = countResult.recordset[0].total;

    // Data query with pagination
    const dataReq = pool.request();
    filterEntries.forEach(([col, val]) => {
      dataReq.input(`filter_${col}`, sql.NVarChar, `%${val}%`);
    });
    dataReq.input('offset', sql.Int, offset);
    dataReq.input('pageSize', sql.Int, pageSize);

    const dataResult = await dataReq.query(
      `SELECT * FROM ${table} ${whereClause}
       ORDER BY (SELECT NULL)
       OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
    );

    res.json({
      data: dataResult.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/tables/ALUNOS
router.post('/ALUNOS', async (req: Request, res: Response) => {
  const { nome } = req.body as { nome: string };
  if (!nome?.trim()) { res.status(400).json({ error: 'nome é obrigatório' }); return; }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('NOME', sql.VarChar(50), nome.trim())
      .query('INSERT INTO ALUNOS (NOME) OUTPUT INSERTED.* VALUES (@NOME)');
    res.json({ data: result.recordset });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro desconhecido' });
  }
});

// POST /api/tables/CURSOS
router.post('/CURSOS', async (req: Request, res: Response) => {
  const { curso, nome } = req.body as { curso: string; nome: string };
  if (!curso?.trim() || !nome?.trim()) { res.status(400).json({ error: 'curso e nome são obrigatórios' }); return; }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('CURSO', sql.Char(3), curso.trim().toUpperCase())
      .input('NOME', sql.VarChar(50), nome.trim())
      .query('INSERT INTO CURSOS (CURSO, NOME) OUTPUT INSERTED.* VALUES (@CURSO, @NOME)');
    res.json({ data: result.recordset });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro desconhecido' });
  }
});

// POST /api/tables/PROFESSOR
router.post('/PROFESSOR', async (req: Request, res: Response) => {
  const { nome } = req.body as { nome: string };
  if (!nome?.trim()) { res.status(400).json({ error: 'nome é obrigatório' }); return; }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('NOME', sql.VarChar(50), nome.trim())
      .query('INSERT INTO PROFESSOR (NOME) OUTPUT INSERTED.* VALUES (@NOME)');
    res.json({ data: result.recordset });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro desconhecido' });
  }
});

// POST /api/tables/MATERIAS
router.post('/MATERIAS', async (req: Request, res: Response) => {
  const { sigla, nome, cargaHoraria, curso, professor } = req.body as {
    sigla: string; nome: string; cargaHoraria: number; curso: string; professor?: number;
  };
  if (!sigla?.trim() || !nome?.trim() || !cargaHoraria || !curso?.trim()) {
    res.status(400).json({ error: 'sigla, nome, cargaHoraria e curso são obrigatórios' }); return;
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('SIGLA', sql.Char(3), sigla.trim().toUpperCase())
      .input('NOME', sql.VarChar(50), nome.trim())
      .input('CARGAHORARIA', sql.Int, cargaHoraria)
      .input('CURSO', sql.Char(3), curso.trim().toUpperCase())
      .input('PROFESSOR', sql.Int, professor ?? null)
      .query('INSERT INTO MATERIAS (SIGLA, NOME, CARGAHORARIA, CURSO, PROFESSOR) OUTPUT INSERTED.* VALUES (@SIGLA, @NOME, @CARGAHORARIA, @CURSO, @PROFESSOR)');
    res.json({ data: result.recordset });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro desconhecido' });
  }
});

export default router;
