import sql from 'mssql';

const config: sql.config = {
  server: 'localhost',
  port: 5234,
  database: 'Universidade',
  user: 'SA',
  password: 'Universidade@2025',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}
