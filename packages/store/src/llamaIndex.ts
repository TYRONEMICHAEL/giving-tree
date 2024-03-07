import matter from 'gray-matter';
import { Document, VectorStoreIndex, storageContextFromDefaults } from 'llamaindex';
import { type Markdown, type Store } from './types';

export const initialize = (): Store => {
  const add = async (markdown: Markdown): Promise<void> => {
    const storageContext = await storageContextFromDefaults({
      persistDir: './storage'
    });
    const metadata = matter(markdown).data;
    const document = new Document({ text: markdown, metadata });
    await VectorStoreIndex.fromDocuments([document], {
      storageContext
    });
  };

  const query = async (query: string): Promise<string> => {
    const storageContext = await storageContextFromDefaults({
      persistDir: './storage'
    });
    const index = await VectorStoreIndex.init({
      storageContext
    });

    const t = await index.docStore.docs();
    console.log(t);

    const loadedQueryEngine = index.asQueryEngine();
    const loadedResponse = await loadedQueryEngine.query({
      query
    });

    return loadedResponse.toString();
  };

  return { add, query };
};
