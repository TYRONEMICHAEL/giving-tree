/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from 'dotenv';
import { initialize } from '@giving-tree/store';
import { Agent } from '@giving-tree/core';
import { 
  createPromptAgent,
  type PromptMetadata
} from '@giving-tree/agent';

const express = require('express');
const app = express();
const collection = 'test';
const noteCollection = 'atomic-note';
const config = {
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL
};

dotenv.config();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/agent-info', async (req, res) => {
  console.log('prompt/agent-info');
  const store = await initialize<PromptMetadata>(collection, config);
  const agent: Agent<PromptMetadata> = createPromptAgent(store, config);
  res.send(agent.metadata);
});

module.exports = app;
