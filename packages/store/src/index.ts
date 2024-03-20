import { initialize as llamaIndex } from './llamaIndex';
import { type Store } from '@giving-tree/core';

export const initialize = async (): Promise<Store> => {
  return await llamaIndex();
};
