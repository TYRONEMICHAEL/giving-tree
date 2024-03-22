export type DocumentId = string;
export type ReadResult = string;
export type Metadata = Record<string, any>;

export interface DocumentData {
  text: string
  metadata: Metadata
}

export interface Store {
  insert: (documentData: DocumentData) => Promise<void>
  query: (query: string, filters?: Metadata) => Promise<string>
  list: () => Promise<string>
  update: (documentData: DocumentData) => Promise<void>
  remove: (id: DocumentId) => Promise<void>
}
