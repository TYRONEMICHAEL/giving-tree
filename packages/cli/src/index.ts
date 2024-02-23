import * as dotenv from 'dotenv';
import { initialize } from '@giving-tree/prompts';
import { type ChatMessage, OpenAI } from 'llamaindex';

dotenv.config();

void (async () => {
  const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL });
  const { compile } = initialize();
  const messages = await compile('adventurer', 'Please help me write a journal entry') as ChatMessage[];
  const result = await llm.chat({ messages });
  console.log(result);
})();
