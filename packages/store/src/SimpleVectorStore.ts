import { type DocumentId, type DocumentData, type Store } from '@giving-tree/core';
import { Document, VectorStoreIndex, storageContextFromDefaults } from 'llamaindex';

export const initialize = async (): Promise<Store> => {
  const storageContext = await storageContextFromDefaults({
    persistDir: './storage'
  });

  const insert = async (documentData: DocumentData): Promise<void> => {
    const { metadata, text } = documentData;
    const document = new Document({ text, metadata });
    await VectorStoreIndex.fromDocuments([document], {
      storageContext
    });
  };

  const query = async (query: string): Promise<string> => {
    const docs = await storageContext.docStore.docs();

    if (Object.keys(docs).length === 0) {
      return '';
    }

    const index = await VectorStoreIndex.init({
      storageContext
    });

    const retriever = index.asRetriever();
    // console.log(await retriever.retrieve(query));

    const loadedQueryEngine = index.asQueryEngine();
    console.log(loadedQueryEngine.getPrompts()['responseSynthesizer:textQATemplate']({ query }));
    console.log(loadedQueryEngine.getPrompts()['responseSynthesizer:refineTemplate"']({ query }));
    const loadedResponse = await loadedQueryEngine.query({
      query
    });

    return loadedResponse.toString();
  };

  const list = async (): Promise<any> => {
    console.log('listing');
    const index = await VectorStoreIndex.init({
      storageContext
    });

    const results = index.docStore.docs();
    return Object.keys(results).map((key) => results[key].toJSON());
  };

  const update = async (documentData: DocumentData): Promise<void> => {
    await insert(documentData);
  };

  const remove = async (id: DocumentId): Promise<void> => {
    console.log('removing', id);
    const index = await VectorStoreIndex.init({
      storageContext
    });

    await index.deleteRefDoc(id);
  };

  return { insert, query, update, remove, list };
};
