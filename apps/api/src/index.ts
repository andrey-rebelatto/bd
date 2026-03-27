import express from 'express';
import cors from 'cors';
import tablesRouter from './routes/tables';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/tables', tablesRouter);

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
