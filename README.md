# BD — Universidade

Projeto monorepo com banco SQL Server, API Express e frontend React para visualização de dados.

- [Exercício original — Procedure (Universidade)](https://mestredornel.com.br/exercicios-procedure/)

---

## Estrutura

```
.
├── apps/
│   ├── api/          # Express + MSSQL (porta 3001)
│   └── web/          # React + Vite + Tailwind (porta 5173)
├── db/               # Scripts SQL (schema, procedures)
└── docker-compose.yml
```

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) v20+
- npm v9+

---

## 1. Banco de dados

### Subir (primeira vez)

```bash
docker compose up --build
```

Nas execuções seguintes, o volume já existe e os dados são preservados:

```bash
docker compose up
```

### Parar

```bash
docker compose down
```

### Resetar (apaga todos os dados)

```bash
docker compose down -v
docker compose up --build
```

### Limpar tudo (imagem + dados)

```bash
docker compose down -v --rmi local
docker compose up --build
```

**Credenciais:**

| Campo    | Valor              |
| -------- | ------------------ |
| Host     | `localhost:5234`   |
| Usuário  | `SA`               |
| Senha    | `Universidade@2025`|
| Banco    | `Universidade`     |

---

## 2. Instalar dependências

Na raiz do projeto:

```bash
npm install
```

---

## 3. Rodar a aplicação

### API + Frontend juntos

```bash
npm run dev
```

### Separados

```bash
npm run dev:api   # somente API  → http://localhost:3001
npm run dev:web   # somente web  → http://localhost:5173
```

> Certifique-se de que o banco está rodando antes de iniciar a API.

---

## Portas

| Serviço  | Porta  |
| -------- | ------ |
| Banco DB | `5234` |
| API      | `3001` |
| Frontend | `5173` |
