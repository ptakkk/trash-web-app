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



app.get('/api/diff', (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({
            error: 'missing parameters from or to'
        });
    }

    const diff = diffDates(from, to);

    res.json({
        from,
        to,
        difference: diff
    });
});

app.get('/api/streets', async (req, res) => {
  try {
    const {street, date} = req.query
    const data = await getStreetsWithDates({street, date}, 10);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'database error'});
  }
});

app.listen(port, () =>
  console.log(`app available at http://localhost:${port}`)
);
