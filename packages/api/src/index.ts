/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from 'dotenv';
import { initialize } from '@giving-tree/store';
import { Agent } from '@giving-tree/core';
import { 
  createPromptAgent, 
  createNoteAgent,
  type PromptMetadata, 
  NoteMetadata
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

app.get('/prompt/agent-info', async (req, res) => {
  console.log('prompt/agent-info');
  const store = await initialize<PromptMetadata>(collection, config);
  const agent: Agent<PromptMetadata> = createPromptAgent(store, config);
  res.send(agent.metadata);
});

app.get('/prompt/search-prompts', async (req, res) => {
  const query = req.query.q; 
  const store = await initialize<PromptMetadata>(collection, config);
  const agent = createPromptAgent(store, config);
  const result = await agent.searchPrompts.fn({ query });
  console.log('result', result); 
  res.send(result);
});

app.get('/atomic-note/agent-info', async (req, res) => {
  const store = await initialize<NoteMetadata>(noteCollection, config);
  const agent: Agent<PromptMetadata> = createNoteAgent(store, config);
  res.send(agent.metadata);
});

app.get('/atomic-note/notes', async (req, res) => {
  const query = req.query.q; 
  const store = await initialize<NoteMetadata>(noteCollection, config);
  const agent = createNoteAgent(store, config);
  const result = await agent.searchNotes.fn({ query });
  res.send(result);
});

app.post('/atomic-note/notes', async (req, res) => {
  const { markdown, metadata } = req.body; 
  const store = await initialize<NoteMetadata>(noteCollection, config);
  const agent = createNoteAgent(store, config);
  const result = await agent.addNote.fn({ markdown, metadata });
  res.send(result);
});

if (process.env.NODE_ENV !== 'production') {
  const port = 3001; // or any port you prefer for local development
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
