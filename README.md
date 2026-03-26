# BD

- [Linguagem SQL (II) Exercício Procedure (Universidade)](https://mestredornel.com.br/exercicios-procedure/)

---

## Docker — Banco de dados Universidade

Banco SQL Server 2022 com schema e procedures já configurados, exposto na porta `5234`.

**Credenciais:**
- Host: `localhost:5234`
- Usuário: `SA`
- Senha: `Universidade@2025`
- Banco: `Universidade`

---

### Subir o banco

```bash
docker compose up --build
```

Na primeira execução a imagem é construída e o banco é inicializado automaticamente. Nas próximas, o volume já existe e os dados são preservados:

```bash
docker compose up
```

---

### Parar o banco

```bash
docker compose down
```

---

### Resetar o banco (apagar todos os dados)

Remove os containers **e o volume** com os dados, forçando a reinicialização do schema na próxima subida:

```bash
docker compose down -v
docker compose up --build
```

---

### Limpar tudo (imagem + dados)

Remove containers, volumes e a imagem buildada localmente:

```bash
docker compose down -v --rmi local
```

Para subir novamente após isso é necessário rebuildar:

```bash
docker compose up --build
```
