// import { initialize as store } from './SimpleVectorStore';
import { initialize as store } from './QdrantVectorStore';
import { type Store } from '@giving-tree/core';

export const initialize = async (): Promise<Store> => {
  return await store();
};
