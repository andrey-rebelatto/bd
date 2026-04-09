import { Router, Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../db';

const router = Router();

// POST /api/procedures/matricular-aluno
router.post('/matricular-aluno', async (req: Request, res: Response) => {
  const { matricula, curso, perletivo } = req.body as {
    matricula: number;
    curso: string;
    perletivo: number;
  };

  if (!matricula || !curso || !perletivo) {
    res.status(400).json({ error: 'matricula, curso e perletivo são obrigatórios' });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('MATRICULA', sql.Int, matricula)
      .input('CURSO', sql.Char(3), curso.toUpperCase())
      .input('PERLETIVO', sql.Int, perletivo)
      .execute('sp_MatricularAluno');

    res.json({ data: result.recordset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    res.status(500).json({ error: message });
  }
});

// POST /api/procedures/cadastra-notas
router.post('/cadastra-notas', async (req: Request, res: Response) => {
  const { matricula, curso, materia, perletivo, nota, falta, bimestre } = req.body as {
    matricula: number;
    curso: string;
    materia: string;
    perletivo: number;
    nota: number;
    falta: number;
    bimestre: number;
  };

  if (!matricula || !curso || !materia || !perletivo || nota == null || falta == null || !bimestre) {
    res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('MATRICULA', sql.Int, matricula)
      .input('CURSO', sql.Char(3), curso.toUpperCase())
      .input('MATERIA', sql.Char(3), materia.toUpperCase())
      .input('PERLETIVO', sql.Int, perletivo)
      .input('NOTA', sql.Float, nota)
      .input('FALTA', sql.Int, falta)
      .input('BIMESTRE', sql.Int, bimestre)
      .execute('sp_CadastraNotas');

    res.json({ data: result.recordset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    res.status(500).json({ error: message });
  }
});

// POST /api/procedures/lancar-exame
router.post('/lancar-exame', async (req: Request, res: Response) => {
  const { matricula, curso, materia, perletivo, notaExame } = req.body as {
    matricula: number;
    curso: string;
    materia: string;
    perletivo: number;
    notaExame: number;
  };

  if (!matricula || !curso || !materia || !perletivo || notaExame == null) {
    res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('MATRICULA', sql.Int, matricula)
      .input('CURSO', sql.Char(3), curso.toUpperCase())
      .input('MATERIA', sql.Char(3), materia.toUpperCase())
      .input('PERLETIVO', sql.Int, perletivo)
      .input('NOTAEXAME', sql.Float, notaExame)
      .execute('sp_LancarExame');

    res.json({ data: result.recordset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    res.status(500).json({ error: message });
  }
});

export default router;
