/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from 'dotenv';
import { initialize } from '@giving-tree/store';
import { createPromptAgent, type PromptMetadata } from '@giving-tree/agent';

const express = require('express');
const app = express();
const config = {
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL
};

dotenv.config();

app.get('/capabilities', async (req, res) => {
  const store = await initialize<PromptMetadata>('test', config);
  const agent = createPromptAgent(store, config);
  const result = agent.processQuery('Please find the first prompt about summarizing content');
  console.log(result);
  res.send(result);
});

if (process.env.NODE_ENV !== 'production') {
  const port = 3001; // or any port you prefer for local development
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
