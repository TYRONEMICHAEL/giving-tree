import { type DocumentId, type DocumentData, type Store } from '@giving-tree/core';
import { Document, MetadataMode, VectorStoreIndex, storageContextFromDefaults } from 'llamaindex';

export const initialize = async (): Promise<Store> => {
  const storageContext = await storageContextFromDefaults({
    persistDir: './storage'
  });

  const insert = async (documentData: DocumentData): Promise<void> => {
    console.log('inserting', documentData);
    const { metadata, text } = documentData;
    const document = new Document({ text, metadata });
    await VectorStoreIndex.fromDocuments([document], {
      storageContext
    });
  };

  const query = async (query: string): Promise<string> => {
    console.log('querying', query);
    const docs = await storageContext.docStore.docs();

    if (Object.keys(docs).length === 0) {
      return '';
    }

    const index = await VectorStoreIndex.init({
      storageContext
    });

    const loadedQueryEngine = index.asQueryEngine();
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
