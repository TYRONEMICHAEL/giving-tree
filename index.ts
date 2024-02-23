import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import { SimpleNodeParser, Document, IngestionPipeline, OpenAI, TitleExtractor, SummaryExtractor } from 'llamaindex';
import { DateMetadataExtractor, EmotionalTriggersMetadataExtractor, JournalMetadataExtractor } from './extractors';

dotenv.config();

void (async () => {
  const entry = await fs.readFile(
    './entries/personal-entry.txt',
    'utf-8'
  );
  const document = new Document({ text: entry });
  // const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-3.5-turbo' });
  const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4' });

  const pipeline = new IngestionPipeline({
    transformations: [
      new SimpleNodeParser({ chunkSize: 1024, chunkOverlap: 20 }),
      new EmotionalTriggersMetadataExtractor(llm),
      new DateMetadataExtractor(llm),
      new TitleExtractor(),
      new JournalMetadataExtractor(llm),
      new SummaryExtractor()
    ]
  });

  const nodes = await pipeline.run({ documents: [document] });

  for (const node of nodes) {
    console.log(node.metadata);
  }
  // console.log(JSON.stringify(nodes, null, 2));
})();
