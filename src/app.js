import express from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { diffDates } from './utils/calculateDate.js';
import { getStreetsWithDates } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(join(__dirname, '../public')));

app.use("/data", express.static("data"));

app.get('/api/streets', async (req, res) => {
  try {
    const {street, date} = req.query
    const data = await getStreetsWithDates({street, date}, 10);
    res.json(data);
  } catch (err) {
    console.error("DB ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () =>
  console.log(`app available at http://localhost:${port}`)
);
