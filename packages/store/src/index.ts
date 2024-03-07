import { initialize as llamaIndex } from './llamaIndex';
import { type Store } from './types';

export const initialize = (): Store => {
  const { add, query } = llamaIndex();
  return { add, query };
};
