import * as dotenv from 'dotenv';
import { createPromptAgent, type PromptMetadata } from '@giving-tree/agent';
import { initialize } from '@giving-tree/store';

dotenv.config();

const config = {
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL
};

void (async () => {
  const store = await initialize<PromptMetadata>('test', config);
  const agent = createPromptAgent(
    store,
    config
  );

  agent.processQuery('Please find the first prompt about summarizing content');
  console.log(prompt);
})();