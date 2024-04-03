import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { translateFilterToQdrant } from "./filters";
import { v4 as uuidv4 } from "uuid";
import {
  Document,
  DocumentId,
  Filter,
  Page,
  PageResult,
  Search,
  SearchMetadata,
  SearchResult,
  Store,
  StoredDocument,
} from "../types";

// ─────────────────────────────────────────────────────────────
// CONFIGURATION TYPES AND DEFAULTS
// ─────────────────────────────────────────────────────────────

export interface Config {
  openAiApiKey: string;
  embedModel:
    | "text-embedding-ada-002"
    | "text-embedding-3-small"
    | "text-embedding-3-large";
  qdrantUrl: string;
  distance: "Cosine" | "Euclid" | "Dot" | "Manhattan";
  size: number;
}

const defaultConfig: Partial<Config> = {
  qdrantUrl: "http://localhost:6333",
  embedModel: "text-embedding-ada-002",
  distance: "Cosine",
  size: 1536,
};

// ─────────────────────────────────────────────────────────────
// STORE INITIALIZATION
// ─────────────────────────────────────────────────────────────

export const initialize = async <M>(
  collection: string,
  config: Partial<Config>
): Promise<Store<M>> => {
  const {
    openAiApiKey: apiKey,
    qdrantUrl: url,
    embedModel: model,
    distance,
    size,
  } = { ...defaultConfig, ...config };
  const client = new QdrantClient({ url });
  const openai = new OpenAI({ apiKey });

  // ─────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────────────────────

  const createCollection = async (collection: string): Promise<void> => {
    const response = await client.getCollections();
    if (!response.collections.some((col) => col.name === collection)) {
      await client.createCollection(collection, {
        vectors: {
          size,
          distance,
        },
      });
    }
  };

  await createCollection(collection);

  const performSearch = async ({
    vector,
    limit,
    filter,
  }: {
    vector: number[];
    limit: number;
    filter?: Filter<M>;
  }): Promise<Array<SearchResult<M>>> => {
    const qdrantFilter =
      filter != null ? translateFilterToQdrant(filter) : undefined;
    const response = await client.search(collection, {
      vector,
      limit,
      filter: qdrantFilter,
    });

    return response.map((result) => {
      const { id, score } = result;
      const { text, ...restOfPayload } = result.payload;
      return {
        id: id as DocumentId,
        score,
        text: text as string,
        metadata: restOfPayload as M,
      };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // INTERFACE IMPLEMENTATION
  // ─────────────────────────────────────────────────────────────

  const insert = async (document: Document<M>): Promise<StoredDocument<M>> => {
    const { metadata, text } = document;
    const vectorResponse = await openai.embeddings.create({
      input: text,
      model,
    });
    const vector = vectorResponse.data[0].embedding;
    const id = uuidv4();
    const point = {
      id,
      vector,
      payload: {
        ...metadata,
        text,
      },
    };

    await client.upsert(collection, {
      wait: true,
      points: [point],
    });

    return { ...document, id };
  };

  const search = async (search: Search<M>): Promise<Array<SearchResult<M>>> => {
    const { query, limit, filter } = search;
    const vectorResponse = await openai.embeddings.create({
      input: query,
      model,
    });
    const vector = vectorResponse.data[0].embedding;

    return await performSearch({ vector, limit, filter });
  };

  const searchByMetadata = async (
    search: SearchMetadata<M>
  ): Promise<Array<SearchResult<M>>> => {
    const { limit, filter } = search;
    const vector: number[] = Array(size).fill(0);

    return await performSearch({ vector, limit, filter });
  };

  const update = async (
    document: StoredDocument<M>
  ): Promise<StoredDocument<M>> => {
    return await insert(document);
  };

  const remove = async (id: DocumentId): Promise<void> => {
    const mustFilter = [
      {
        key: "doc_id",
        match: {
          value: id,
        },
      },
    ];

    await client.delete(collection, { filter: { must: mustFilter } });
  };

  const fetchPage = async <M>(page: Page): Promise<PageResult<M>> => {
    const { pageSize, offset } = page;

    const result = await client.scroll(collection, {
      limit: pageSize,
      offset: offset,
    });

    const documents: StoredDocument<M>[] = result.points.map((point) => {
      const { id, payload } = point;
      const { text, ...restOfPayload } = payload;
      return {
        id: id as DocumentId,
        text: text as string,
        metadata: restOfPayload as M,
      };
    });

    const nextPageOffset =
      documents.length === pageSize ? offset + pageSize : undefined;

    return {
      results: documents,
      nextPageOffset: nextPageOffset,
    };
  };

  return {
    collection,
    insert,
    search,
    remove,
    update,
    searchByMetadata,
    fetchPage,
  };
};
