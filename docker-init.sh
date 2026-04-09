#!/bin/bash
set -e

# Inicia o SQL Server em background
/opt/mssql/bin/sqlservr &
PID=$!

echo "Aguardando SQL Server iniciar..."
for i in {1..60}; do
    if /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -Q "SELECT 1" &>/dev/null; then
        echo "SQL Server pronto."
        break
    fi
    sleep 2
done

DB_EXISTS=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.databases WHERE name = 'Universidade'" -h -1 | tr -d ' \r\n')

if [ "$DB_EXISTS" = "0" ]; then
    echo "Criando banco e tabelas..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -i /init/schema/create.sql

    echo "Criando procedures..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -d Universidade -i /init/procedures/create-procedure.sql

    echo "Inserindo matrículas iniciais..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -d Universidade -i /init/seeds/insert-aluno.sql

    echo "Banco de dados Universidade inicializado com sucesso."
else
    echo "Banco de dados Universidade já existe. Pulando inicialização."
fi

wait $PID
