--  A PROCEDURE abaixo é criada para lanças as notas dos alunos. Ela lança notas, faltas e apura as médias parciais,
--  faltas de totais de pontos dos alunos. Porém ainda falta completar com a estrutura de apuração de resultados e entrada de dados de exame.
CREATE OR ALTER PROCEDURE sp_CadastraNotas
	(
		@MATRICULA INT,
		@CURSO CHAR(3),
		@MATERIA CHAR(3),
		@PERLETIVO INT,
		@NOTA FLOAT,
		@FALTA INT,
		@BIMESTRE INT
	)
	AS
BEGIN

		IF @BIMESTRE = 1
		    BEGIN

                UPDATE MATRICULA
                SET N1 = @NOTA,
                    F1 = @FALTA,
                    TOTALPONTOS = @NOTA,
                    TOTALFALTAS = @FALTA,
                    MEDIA = @NOTA
                WHERE MATRICULA = @MATRICULA
                    AND CURSO = @CURSO
                    AND MATERIA = @MATERIA
                    AND PERLETIVO = @PERLETIVO;
		    END

        ELSE

        IF @BIMESTRE = 2
            BEGIN

                UPDATE MATRICULA
                SET N2 = @NOTA,
                    F2 = @FALTA,
                    TOTALPONTOS = @NOTA + N1,
                    TOTALFALTAS = @FALTA + F1,
                    MEDIA = (@NOTA + N1) / 2
                WHERE MATRICULA = @MATRICULA
                    AND CURSO = @CURSO
                    AND MATERIA = @MATERIA
                    AND PERLETIVO = @PERLETIVO;
            END

        ELSE

        IF @BIMESTRE = 3
            BEGIN

                UPDATE MATRICULA
                SET N3 = @NOTA,
                    F3 = @FALTA,
                    TOTALPONTOS = @NOTA + N1 + N2,
                    TOTALFALTAS = @FALTA + F1 + F2,
                    MEDIA = (@NOTA + N1 + N2) / 3
                WHERE MATRICULA = @MATRICULA
                    AND CURSO = @CURSO
                    AND MATERIA = @MATERIA
                    AND PERLETIVO = @PERLETIVO;
            END

        ELSE

        IF @BIMESTRE = 4
            BEGIN

                DECLARE @RESULTADO VARCHAR(50),
                        @FREQUENCIA FLOAT,
                        @MEDIAFINAL FLOAT,
                        @CARGAHORA INT

                SET @CARGAHORA = (
                    SELECT CARGAHORARIA FROM MATERIAS
                    WHERE  SIGLA = @MATERIA
                       AND CURSO = @CURSO)

                UPDATE MATRICULA
                SET N4           = @NOTA,
                    F4           = @FALTA,
                    TOTALPONTOS  = @NOTA + N1 + N2 + N3,
                    TOTALFALTAS  = @FALTA + F1 + F2 + F3,
                    MEDIA        = (@NOTA + N1 + N2 + N3) / 4,
                    PERCFREQ     = (1.0 - (CAST(@FALTA + F1 + F2 + F3 AS FLOAT) / @CARGAHORA)) * 100
                WHERE MATRICULA = @MATRICULA
                  AND CURSO     = @CURSO
                  AND MATERIA   = @MATERIA
                  AND PERLETIVO = @PERLETIVO;

                -- Apura MEDIA e PERCFREQ atualizados
                SELECT @MEDIAFINAL  = MEDIA,
                       @FREQUENCIA  = PERCFREQ
                FROM   MATRICULA
                WHERE  MATRICULA = @MATRICULA
                  AND  CURSO     = @CURSO
                  AND  MATERIA   = @MATERIA
                  AND  PERLETIVO = @PERLETIVO;

                -- Determina resultado
                IF @FREQUENCIA < 75
                    SET @RESULTADO = 'REPROVADO POR FALTA'
                ELSE IF @MEDIAFINAL >= 7.0
                    SET @RESULTADO = 'APROVADO'
                ELSE IF @MEDIAFINAL >= 5.0
                    SET @RESULTADO = 'EXAME'
                ELSE
                    SET @RESULTADO = 'REPROVADO'

                UPDATE MATRICULA
                SET    RESULTADO = @RESULTADO
                WHERE  MATRICULA = @MATRICULA
                  AND  CURSO     = @CURSO
                  AND  MATERIA   = @MATERIA
                  AND  PERLETIVO = @PERLETIVO;

            END


		SELECT * FROM MATRICULA	WHERE MATRICULA = @MATRICULA
END
GO

-- sp_MatricularAluno: Matricula automaticamente o aluno em todas as
-- disciplinas do curso escolhido, para o período letivo informado.
CREATE OR ALTER PROCEDURE sp_MatricularAluno
    (
        @MATRICULA  INT,
        @CURSO      CHAR(3),
        @PERLETIVO  INT
    )
AS
BEGIN

    -- Verifica se aluno existe
    IF NOT EXISTS (SELECT 1 FROM ALUNOS WHERE MATRICULA = @MATRICULA)
    BEGIN
        RAISERROR('Aluno nao encontrado.', 16, 1);
        RETURN;
    END

    -- Verifica se curso existe
    IF NOT EXISTS (SELECT 1 FROM CURSOS WHERE CURSO = @CURSO)
    BEGIN
        RAISERROR('Curso nao encontrado.', 16, 1);
        RETURN;
    END

    -- Insere uma linha em MATRICULA para cada matéria do curso,
    -- ignorando as que já existem para evitar duplicata.
    INSERT INTO MATRICULA (MATRICULA, CURSO, MATERIA, PROFESSOR, PERLETIVO)
    SELECT @MATRICULA,
           M.CURSO,
           M.SIGLA,
           M.PROFESSOR,
           @PERLETIVO
    FROM   MATERIAS M
    WHERE  M.CURSO = @CURSO
      AND  NOT EXISTS (
               SELECT 1
               FROM   MATRICULA X
               WHERE  X.MATRICULA = @MATRICULA
                 AND  X.CURSO     = M.CURSO
                 AND  X.MATERIA   = M.SIGLA
                 AND  X.PERLETIVO = @PERLETIVO
           );

    -- Retorna as matriculas inseridas
    SELECT * FROM MATRICULA
    WHERE  MATRICULA = @MATRICULA
      AND  PERLETIVO = @PERLETIVO;

END
GO

-- sp_LancarExame: Lança a nota do exame para alunos com RESULTADO = 'EXAME',
-- calcula MEDIAFINAL = (MEDIA + NOTAEXAME) / 2 e apura o resultado final.
CREATE OR ALTER PROCEDURE sp_LancarExame
    (
        @MATRICULA  INT,
        @CURSO      CHAR(3),
        @MATERIA    CHAR(3),
        @PERLETIVO  INT,
        @NOTAEXAME  FLOAT
    )
AS
BEGIN

    -- Verifica se aluno está com RESULTADO = 'EXAME'
    IF NOT EXISTS (
        SELECT 1 FROM MATRICULA
        WHERE  MATRICULA = @MATRICULA
          AND  CURSO     = @CURSO
          AND  MATERIA   = @MATERIA
          AND  PERLETIVO = @PERLETIVO
          AND  RESULTADO = 'EXAME'
    )
    BEGIN
        RAISERROR('Aluno nao esta habilitado para exame nesta disciplina.', 16, 1);
        RETURN;
    END

    DECLARE @MEDIAFINAL FLOAT,
            @RESULTADO  VARCHAR(50);

    -- Calcula media final
    SELECT @MEDIAFINAL = (MEDIA + @NOTAEXAME) / 2.0
    FROM   MATRICULA
    WHERE  MATRICULA = @MATRICULA
      AND  CURSO     = @CURSO
      AND  MATERIA   = @MATERIA
      AND  PERLETIVO = @PERLETIVO;

    -- Determina resultado final
    IF @MEDIAFINAL >= 5.0
        SET @RESULTADO = 'APROVADO'
    ELSE
        SET @RESULTADO = 'REPROVADO'

    UPDATE MATRICULA
    SET    NOTAEXAME  = @NOTAEXAME,
           MEDIAFINAL = @MEDIAFINAL,
           RESULTADO  = @RESULTADO
    WHERE  MATRICULA = @MATRICULA
      AND  CURSO     = @CURSO
      AND  MATERIA   = @MATERIA
      AND  PERLETIVO = @PERLETIVO;

    SELECT * FROM MATRICULA
    WHERE  MATRICULA = @MATRICULA
      AND  CURSO     = @CURSO
      AND  MATERIA   = @MATERIA
      AND  PERLETIVO = @PERLETIVO;

END
