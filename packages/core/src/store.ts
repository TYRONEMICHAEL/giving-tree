// ─────────────────────────────────────────────────────────────
// TYPES AND INTERFACES
// ─────────────────────────────────────────────────────────────

export type DocumentId = number;

export interface Document<M extends Record<string, any>> {
  id?: DocumentId
  text: string
  metadata: M
}

export interface Search<M extends Record<string, any>> {
  query: string
  limit: number
  filter?: Filter<M>
}

export interface SearchMetadata<M extends Record<string, any>> {
  filter: Filter<M>
  limit: number
}

export interface SearchResult<M extends Record<string, any>> extends Document<M> {
  score: number
}

// ─────────────────────────────────────────────────────────────
// FILTERS AND CONDITIONS
// ─────────────────────────────────────────────────────────────

export type ConditionType = 'Match' | 'Range';

export interface SimpleFilter<M> {
  type: ConditionType
  field: keyof M
  value: any
}

export interface RangeFilter<M> {
  type: 'Range'
  field: keyof M
  gte?: number
  lte?: number
}

type CompositeOperator = 'AND' | 'OR' | 'NOT';

export interface CompositeFilter<M> {
  operator: CompositeOperator
  filters: Array<Filter<M>> // Recursive reference to support nesting
}

export type Filter<M> = SimpleFilter<M> | CompositeFilter<M> | RangeFilter<M>;

// ─────────────────────────────────────────────────────────────
// STORE INTERFACE
// ─────────────────────────────────────────────────────────────

export interface Store<M> {
  readonly collection: string
  insert: (document: Document<M>) => Promise<DocumentId>
  search: (query: Search<M>) => Promise<Array<SearchResult<M>>>
  searchByMetadata: (metadata: SearchMetadata<M>) => Promise<Array<SearchResult<M>>>
  update: (document: Document<M>) => Promise<DocumentId>
  remove: (id: DocumentId) => Promise<DocumentId>
}
