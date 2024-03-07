import * as dotenv from 'dotenv';
import { initialize as Prompt } from '@giving-tree/prompts';
import { initialize as Store } from '@giving-tree/store';
import fs from 'node:fs/promises';
import { type ChatMessage, OpenAI } from 'llamaindex';

dotenv.config();

void (async () => {
  // const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL });
  // const { compile, list } = Prompt();
  const path = '/entry.md';

  const essay = await fs.readFile(__dirname + path, 'utf-8');
  const { add, query } = Store();
  await add(essay);
  console.log(await query('I remember doing a brainstorming session in the afternoon. What date was that and please provide a summary?'));
  // console.log(list([]));
  // const tone = await compile('tone/empathetic-phychologist') as ChatMessage[];
  // const action = await compile('action/insight-compression-analysis', 'Can I use these feelings of anxiety as fuel. Someone said something to me yesterday. Founders have this built in confidence. A confidence where no matter what they feel they know they will make it. Like nothing can stop them. i.e no self doubt. I need to exude this confidence, but I am hampered by self-doubt.') as ChatMessage[];
  // const result = await llm.chat({ messages: [...tone, ...action] });
  // console.log(result);
})();
