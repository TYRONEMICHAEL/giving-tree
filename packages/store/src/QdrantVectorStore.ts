import { type DocumentId, type DocumentData, type Store } from '@giving-tree/core';
import { Document, VectorStoreIndex, storageContextFromDefaults, QdrantVectorStore, serviceContextFromDefaults } from 'llamaindex';

export const initialize = async (): Promise<Store> => {
  const vectorStore = new QdrantVectorStore({
    url: 'http://localhost:6333'
  });

  const storageContext = await storageContextFromDefaults({
    persistDir: './storage'
  });

  const insert = async (documentData: DocumentData): Promise<void> => {
    const { metadata, text } = documentData;
    const document = new Document({ text, metadata });
    await VectorStoreIndex.fromDocuments([document], {
      vectorStore
    });
  };

  const query = async (query: string): Promise<string> => {
    const ctx = serviceContextFromDefaults();
    console.log(ctx);
    const index = await VectorStoreIndex.fromVectorStore(vectorStore, {
      ...ctx,
      callbackManager: {
        onRetrieve: async (params) => {
          console.log('params', params);
        }
      }
    });
    const retriever = index.asRetriever();
    retriever.similarityTopK = 1;

    const loadedQueryEngine = index.asQueryEngine({ retriever });
    const queryResponse = await loadedQueryEngine.query({ query });
    // console.log(queryResponse.response);
    // const loadedResponse = await queryEngine.retrieve(query);
    return queryResponse.response;
    //return await retriever.retrieve(query);
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
