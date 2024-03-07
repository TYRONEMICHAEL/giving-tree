const express = require('express');
const app = express();
import * as dotenv from 'dotenv';
import { initialize as Store } from '@giving-tree/store';

dotenv.config();

app.get('/ping', async (req, res) => {
  const { add, query } = Store();
  await add("Hellom world");
  const result = await query('I remember doing a brainstorming session in the afternoon. What date was that and please provide a summary?')
  res.send(result);
});

if (process.env.NODE_ENV !== 'production') {
  const port = 3001; // or any port you prefer for local development
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;