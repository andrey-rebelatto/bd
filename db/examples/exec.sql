--  Exemplo de execução da PROCEDURE para lançar as notas do aluno de matricula 1, do curso de sigla ENG, 
--  da disciplina de BDA no período letivo de 2025, com nota 7, duas faltas no primeiro bimestre.

EXEC sp_CadastraNotas @MATRICULA = 1,      -- int
                      @CURSO = 'ENG',      -- char(3)
                      @MATERIA = 'BDA',    -- char(3)
                      @PERLETIVO = '2025', -- char(4)
                      @NOTA = 6.0,         -- float
                      @FALTA = 0,
                      @BIMESTRE = 2      -- int
          