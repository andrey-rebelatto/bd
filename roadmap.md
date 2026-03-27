# Roadmap — Sistema de Procedures Universidade

Exercício baseado em: https://mestredornel.com.br/exercicios-procedure/

---

## O que já existe

| Arquivo | Conteúdo |
|---|---|
| `db/schema/create.sql` | Tabelas: ALUNOS, CURSOS, PROFESSOR, MATERIAS, MATRICULA |
| `db/procedures/create-procedure.sql` | `sp_CadastraNotas` (incompleta) |
| `db/seeds/insert-aluno.sql` | Inserção manual de aluno nas disciplinas |
| `db/examples/exec.sql` | Exemplo de execução da procedure |

---

## O que precisa ser feito

### Etapa 1 — Completar `sp_CadastraNotas`

A procedure já existe e lança notas dos bimestres 1 a 3 corretamente.
O bloco do **4º bimestre** está incompleto: falta calcular a frequência e determinar o resultado.

**O que implementar no bloco `IF @BIMESTRE = 4`:**

1. Atualizar `N4`, `F4`, `TOTALPONTOS`, `TOTALFALTAS` e `MEDIA` (já está feito — não apagar)
2. Calcular o percentual de frequência:
   - `PERCFREQ = (1 - TOTALFALTAS / CARGAHORARIA) * 100`
   - A `CARGAHORARIA` vem da tabela `MATERIAS` pela `SIGLA` da matéria
3. Determinar o `RESULTADO` com base nas regras abaixo:

| Condição | Resultado |
|---|---|
| `PERCFREQ < 75` | `'REPROVADO POR FALTA'` |
| `MEDIA >= 7.0` e `PERCFREQ >= 75` | `'APROVADO'` |
| `MEDIA >= 5.0` e `MEDIA < 7.0` e `PERCFREQ >= 75` | `'EXAME'` |
| `MEDIA < 5.0` e `PERCFREQ >= 75` | `'REPROVADO'` |

4. Atualizar os campos `PERCFREQ` e `RESULTADO` na tabela `MATRICULA`

---

### Etapa 2 — Criar `sp_MatricularAluno`

Hoje o aluno é matriculado manualmente com INSERTs no arquivo `insert-aluno.sql`.
O objetivo é criar uma procedure que faça isso automaticamente.

**Parâmetros:**
- `@MATRICULA INT` — número da matrícula do aluno
- `@CURSO CHAR(3)` — sigla do curso (ex: `'ENG'`)
- `@PERLETIVO INT` — ano letivo (ex: `2025`)

**O que a procedure deve fazer:**
1. Para cada matéria cadastrada na tabela `MATERIAS` que pertença ao `@CURSO`, inserir uma linha na tabela `MATRICULA` com os dados do aluno, matéria, professor e período letivo
2. Não duplicar registros caso a procedure seja chamada mais de uma vez para o mesmo aluno/curso/período

**Dica:** Use um `INSERT ... SELECT` buscando as matérias direto da tabela `MATERIAS` com `WHERE CURSO = @CURSO`.

---

### Etapa 3 — Criar `sp_LancarExame`

Para alunos que ficaram com `RESULTADO = 'EXAME'` após o 4º bimestre.

**Parâmetros:**
- `@MATRICULA INT`
- `@CURSO CHAR(3)`
- `@MATERIA CHAR(3)`
- `@PERLETIVO INT`
- `@NOTAEXAME FLOAT`

**O que a procedure deve fazer:**
1. Verificar se o aluno realmente está com `RESULTADO = 'EXAME'` — se não estiver, retornar um erro
2. Calcular a média final: `MEDIAFINAL = (MEDIA + NOTAEXAME) / 2`
3. Determinar o resultado final:

| Condição | Resultado |
|---|---|
| `MEDIAFINAL >= 5.0` | `'APROVADO'` |
| `MEDIAFINAL < 5.0` | `'REPROVADO'` |

4. Atualizar os campos `NOTAEXAME`, `MEDIAFINAL` e `RESULTADO` na tabela `MATRICULA`

---

## Ordem de implementação sugerida

```
Etapa 1 → Etapa 2 → Etapa 3
```

Faça a Etapa 1 primeiro porque ela é a continuação direta do código que já existe.
A Etapa 2 é independente e pode ser feita a qualquer momento.
A Etapa 3 depende da Etapa 1 (precisa que o campo `RESULTADO = 'EXAME'` exista para testar).

---

## Como testar cada etapa

### Teste da Etapa 1

```sql
-- Prepara o ambiente
DELETE FROM MATRICULA WHERE MATRICULA = 1 AND MATERIA = 'BDA' AND PERLETIVO = 2025;
INSERT MATRICULA (MATRICULA, CURSO, MATERIA, PROFESSOR, PERLETIVO)
VALUES (1, 'ENG', 'BDA', 1, 2025);

-- Lança as 4 notas
EXEC sp_CadastraNotas @MATRICULA=1, @CURSO='ENG', @MATERIA='BDA', @PERLETIVO=2025, @NOTA=6.0, @FALTA=0, @BIMESTRE=1;
EXEC sp_CadastraNotas @MATRICULA=1, @CURSO='ENG', @MATERIA='BDA', @PERLETIVO=2025, @NOTA=6.0, @FALTA=0, @BIMESTRE=2;
EXEC sp_CadastraNotas @MATRICULA=1, @CURSO='ENG', @MATERIA='BDA', @PERLETIVO=2025, @NOTA=6.0, @FALTA=0, @BIMESTRE=3;
EXEC sp_CadastraNotas @MATRICULA=1, @CURSO='ENG', @MATERIA='BDA', @PERLETIVO=2025, @NOTA=6.0, @FALTA=0, @BIMESTRE=4;
-- Esperado: RESULTADO = 'EXAME', MEDIA = 6.0, PERCFREQ = 100
```

### Teste da Etapa 2

```sql
DELETE FROM MATRICULA WHERE MATRICULA = 1 AND PERLETIVO = 2025;

EXEC sp_MatricularAluno @MATRICULA=1, @CURSO='ENG', @PERLETIVO=2025;
-- Esperado: linhas inseridas para BDA e PRG (todas as matérias do curso ENG)

SELECT * FROM MATRICULA WHERE MATRICULA = 1 AND PERLETIVO = 2025;
```

### Teste da Etapa 3

```sql
-- (usar após o teste da Etapa 1, aluno deve estar com RESULTADO = 'EXAME')
EXEC sp_LancarExame @MATRICULA=1, @CURSO='ENG', @MATERIA='BDA', @PERLETIVO=2025, @NOTAEXAME=5.0;
-- Esperado: MEDIAFINAL = 5.5, RESULTADO = 'APROVADO'
```
