import * as dotenv from 'dotenv';
import { initialize } from '@giving-tree/prompts';
import { type ChatMessage, OpenAI } from 'llamaindex';

dotenv.config();

void (async () => {
  const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL });
  const { compile, list } = initialize();
  const tone = await compile('tone/empathetic-phychologist') as ChatMessage[];
  const action = await compile('action/insight-compression-analysis', 'Can I use these feelings of anxiety as fuel. Someone said something to me yesterday. Founders have this built in confidence. A confidence where no matter what they feel they know they will make it. Like nothing can stop them. i.e no self doubt. I need to exude this confidence, but I am hampered by self-doubt.') as ChatMessage[];
  const result = await llm.chat({ messages: [...tone, ...action] });
  console.log(result);
})();
