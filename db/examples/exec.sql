-- ============================================================
-- EXEMPLO COMPLETO: Fluxo de um aluno no sistema universitário
-- ============================================================

-- 1. Matricula automática do aluno 1 no curso ENG, período 2025
EXEC sp_MatricularAluno @MATRICULA = 1,
                        @CURSO     = 'ENG',
                        @PERLETIVO = 2025;

-- 2. Lançamento de notas e faltas por bimestre (disciplina BDA)
EXEC sp_CadastraNotas @MATRICULA = 1, @CURSO = 'ENG', @MATERIA = 'BDA',
                      @PERLETIVO = 2025, @NOTA = 6.0, @FALTA = 2, @BIMESTRE = 1;

EXEC sp_CadastraNotas @MATRICULA = 1, @CURSO = 'ENG', @MATERIA = 'BDA',
                      @PERLETIVO = 2025, @NOTA = 6.5, @FALTA = 1, @BIMESTRE = 2;

EXEC sp_CadastraNotas @MATRICULA = 1, @CURSO = 'ENG', @MATERIA = 'BDA',
                      @PERLETIVO = 2025, @NOTA = 5.5, @FALTA = 3, @BIMESTRE = 3;

EXEC sp_CadastraNotas @MATRICULA = 1, @CURSO = 'ENG', @MATERIA = 'BDA',
                      @PERLETIVO = 2025, @NOTA = 6.0, @FALTA = 0, @BIMESTRE = 4;
-- Resultado esperado: RESULTADO = 'EXAME' (media ~6.0)

-- 3. Lançamento da nota de exame
EXEC sp_LancarExame @MATRICULA  = 1,
                    @CURSO      = 'ENG',
                    @MATERIA    = 'BDA',
                    @PERLETIVO  = 2025,
                    @NOTAEXAME  = 6.0;
-- Resultado esperado: MEDIAFINAL = 6.0, RESULTADO = 'APROVADO'
