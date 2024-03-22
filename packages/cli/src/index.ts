import * as dotenv from 'dotenv';
import { createPromptAgent } from '@giving-tree/agent';
import { initialize } from '@giving-tree/store';
import { OpenAI } from 'llamaindex';

import * as traceloop from '@traceloop/node-server-sdk';

traceloop.initialize({ disableBatch: true });

dotenv.config();

void (async () => {
  const store = await initialize();
  const agent = createPromptAgent(
    store,
    { model: process.env.OPENAI_MODEL, apiKey: process.env.OPENAI_API_KEY }
  );
  const llm = new OpenAI({ model: process.env.OPENAI_MODEL, apiKey: process.env.OPENAI_API_KEY });
  // console.log(await store.query('Please return a prompt that summarizes content', { id: 'something' }));
  // console.log(agent.metadata.capabilities[2]);
  // const prompt = await agent.processQuery(`
  //   Please add a prompt that is similiar but not the same:

  //   # IDENTITY and PURPOSE

  //   You are an expert content summarizer. You take content in and output a Markdown formatted summary using the format below.

  //   Take a deep breath and think step by step about how to best accomplish this goal using the following steps.

  //   # OUTPUT SECTIONS

  //   - Combine all of your understanding of the content into a single, 20-word sentence in a section called ONE SENTENCE SUMMARY:.

  //   - Output the 3 most important points of the content as a list with no more than 12 words per point into a section called MAIN POINTS:.

  //   - Output a list of the 3 best takeaways from the content in 12 words or less each in a section called TAKEAWAYS:.

  //   # OUTPUT INSTRUCTIONS

  //   - Output bullets not numbers.
  //   - You only output human readable Markdown.
  //   - Keep each bullet to 12 words or less.
  //   - Do not output warnings or notes—just the requested sections.
  //   - Do not repeat items in the output sections.
  //   - Do not start items with the same opening words.

  //   # INPUT:

  //   INPUT:
  // `);
  // const prompt = await agent.processQuery('Select the summarise prompt "Summarize Content into 3 Main Points" and then use it with the following content: NLP is a branch of AI that integrates computational linguistics with statistical models. It enables machines to read, understand, and draw conclusions from human languages. The advancement of underlying computing technology, such as the Tensor Processing Unit, has led to a huge leap in research, producing some cutting-edge language models. By identifying suspicious behavior patterns, NLP can uncover fraud in financial transactions. NLP, for instance, detects inconsistencies in credit applications or suspicious transactions on credit cards. Please USE one of my summarise template');
  // const prompt = await agent.processQuery('I want you to summarise the following content,  NLP is a branch of AI that integrates computational linguistics with statistical models. It enables machines to read, understand, and draw conclusions from human languages. The advancement of underlying computing technology, such as the Tensor Processing Unit, has led to a huge leap in research, producing some cutting-edge language models. By identifying suspicious behavior patterns, NLP can uncover fraud in financial transactions. NLP, for instance, detects inconsistencies in credit applications or suspicious transactions on credit cards. Please USE one of my summarise template');
  // const prompt = await agent.processQuery('Can you check if I have any prompts related to summarizing content? If not, can you create one for me that lists the main 3 points in bullet form makrdown?');
  // const prompt = await agent.processQuery('Please return to me the prompt Content Summarizer in its original form');
  // const prompt = await agent.processQuery(`Please return prompt with metadata id Content Summarizer`);
  // const prompt = await agent.queryPrompt.fn({ query: 'Please return prompt with id c69450b72760e4537c0e0df06084df2794afa3ef14d3127ce084c99c78bb70cf' });
  // const prompt = await agent.processQuery('Please return prompt with the name Summarizer. Please follow the prompts instructions and use it to summarise the following: NLP is a branch of AI that integrates computational linguistics with statistical models. It enables machines to read, understand, and draw conclusions from human languages. The advancement of underlying computing technology, such as the Tensor Processing Unit, has led to a huge leap in research, producing some cutting-edge language models. By identifying suspicious behavior patterns, NLP can uncover fraud in financial transactions. NLP, for instance, detects inconsistencies in credit applications or suspicious transactions on credit cards. Please USE one of my summarise template');
  const prompt = await agent.processQuery('Please add me a prompt in markdown when the LLM behaves like a phychologist, and provides the user with constructive criticism');
  // const result = await store.query('You have a list of prompts. I want you to return the first prompt in the list as is.');
  console.log(result);
  // const docs = await store.query('Please return a prompt that summarizes content');
  // console.log(docs);
  // console.log('Prompt chosen by user');
  // console.log('-------------');
  // const result = await llm.chat({
  //   messages: [
  //     {
  //       content: `You have access to the following agent and its tools ${JSON.stringify(agent.metadata)}`,
  //       role: 'system'
  //     },
  //     {
  //       content: 'The user has chose the following prompt to use: ' + prompt,
  //       role: 'system'
  //     },
  //     {
  //       content: 'Please use the promp with the following: NLP is a branch of AI that integrates computational linguistics with statistical models. It enables machines to read, understand, and draw conclusions from human languages. The advancement of underlying computing technology, such as the Tensor Processing Unit, has led to a huge leap in research, producing some cutting-edge language models. By identifying suspicious behavior patterns, NLP can uncover fraud in financial transactions. NLP, for instance, detects inconsistencies in credit applications or suspicious transactions on credit cards.',
  //       role: 'user'
  //     }
  //   ]
  // });

  // console.log(result);

  // const fResult = await agent.processQuery(result.message.content as string);

  // console.log(fResult);
})();
