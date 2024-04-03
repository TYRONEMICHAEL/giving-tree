import * as dotenv from 'dotenv';
import { initialize } from '@giving-tree/store';
import { JournalEntryMetadata, JournalToolProvider } from '@giving-tree/tool-provider';
import { ToolProvidersManager } from '@giving-tree/core';
import { OpenAiAgent } from '@giving-tree/agent';

dotenv.config();

const config = {
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL
};

void (async () => {
  const store = await initialize<JournalEntryMetadata>('test', config);
  const provider = new JournalToolProvider(store);
  const agent = new OpenAiAgent([provider], config);

  // const prompt = await store.fetchPage({ pageSize: 1, offset: 5 });
  const prompt = await agent.processQuery('Get any necessary information that will help the user using your capabilities. This user would like to do a daily journal review.');
  console.log(prompt);
})();