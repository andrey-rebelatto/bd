import express from 'express';
import cors from 'cors';
import tablesRouter from './routes/tables';
import proceduresRouter from './routes/procedures';

const app = express();
const PORT = 3004;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/tables', tablesRouter);
app.use('/api/procedures', proceduresRouter);

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
