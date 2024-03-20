export type DocumentId = string;
export type ReadResult = string;

export interface DocumentData {
  text: string
  metadata: Record<string, any>
}

export interface Store {
  insert: (documentData: DocumentData) => Promise<void>
  query: (query: string) => Promise<string>
  list: () => Promise<string>
  update: (documentData: DocumentData) => Promise<void>
  remove: (id: DocumentId) => Promise<void>
}
