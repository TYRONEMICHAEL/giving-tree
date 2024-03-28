import {
  createAgent,
  type AgentMetadata,
  type CapabilitySchema,
  type Store,
  type Agent,
  type Filter,
  type SimpleFilter
} from '@giving-tree/core';

import { FunctionTool, OpenAI, OpenAIAgent } from 'llamaindex';
import fs from 'fs';
import path from 'path';
import Joi from 'joi';

// ─────────────────────────────────────────────────────────────
// TYPES AND SCHEMAS
// ─────────────────────────────────────────────────────────────

export interface NoteMetadata {
  version: string
  name: string
  tags: string[]
  description: string
  title: string
}

export const noteMetadataSchema = Joi.object({
  name: Joi.string().required(),
  tags: Joi.array().required(),
  version: Joi.string().required(),
  description: Joi.string().required(),
  title: Joi.string().required()
});

interface Operation<F extends (...args: any[]) => Promise<any>> {
  fn: F
  metadata: CapabilitySchema
}

type Capability = 'addNote' | 'searchNotes' | 'searchNotesByMetadata';

interface Note {
  markdown: string
  metadata: NoteMetadata
}

interface Search {
  query: string
  limit?: number
}

interface SearchMetadata {
  metadata: Partial<NoteMetadata>
  limit?: number
}

interface Capabilities {
  addNote: Operation<(note: Note) => Promise<number>>
  searchNotes: Operation<(search: Search) => Promise<Note[]>>
  searchNotesByMetadata: Operation<(search: SearchMetadata) => Promise<Note[]>>
}

export type NoteAgent = Agent<NoteMetadata> & Capabilities;

export interface NoteAgentConfig {
  openAiApiKey: string
  openAiModel: string
}

// ─────────────────────────────────────────────────────────────
// CUSTOM ERRORS
// ─────────────────────────────────────────────────────────────

class NoteValidationError extends Error {
  constructor (message: string) {
    super(message);
    this.name = 'NoteValidationError';
  }
}

// ─────────────────────────────────────────────────────────────
// A LIST OF CAPABILITIES
// ─────────────────────────────────────────────────────────────

export const capabilities = (store: Store<NoteMetadata>, metadata: AgentMetadata): Capabilities => {
  // ─── UTILITY FUNCTIONS ────────────────────────────────────
  const capabilitiesMap = metadata.capabilities
    .reduce((acc, capability) => {
      return { ...acc, [capability.name]: capability };
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
    }, {} as Record<Capability, CapabilitySchema>);

  const validateSchema = (data: any): void => {
    const { error } = noteMetadataSchema.validate(data);
    if (error != null) {
      throw new NoteValidationError(`Note validation error: ${error.message}`);
    }
  };

  // ─── ADD CAPABILITY ────────────────────────────────────

  const addNoteCapability = async (note: { markdown: string, metadata: NoteMetadata }): Promise<number> => {
    const { markdown, metadata } = note;
    validateSchema(metadata);
    const result = await store.insert({ text: markdown, metadata: { ...metadata } });
    return result;
  };

  // ─── SEARCH CAPABILITY ────────────────────────────────────

  const searchNotesCapability = async (search: Search): Promise<Note[]> => {
    const { query, limit } = search;
    const results = await store.search({ query, limit: limit ?? 10 });
    return results.map((result) => ({ markdown: result.text, metadata: result.metadata }));
  };

  // ─── SEARCH BY METADATA CAPABILITY ────────────────────────────────────

  const createMetadataFilter = (metadata: Partial<NoteMetadata>): Filter<NoteMetadata> => {
    const filterConditions: Array<SimpleFilter<NoteMetadata>> = [];
    for (const key in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, key)) {
        const value = metadata[key];
        filterConditions.push({ type: 'Match', field: key as keyof NoteMetadata, value });
      }
    }

    return {
      operator: 'AND',
      filters: filterConditions
    };
  };

  const searchNotesByMetadataCapability = async (search: SearchMetadata): Promise<Note[]> => {
    const { metadata, limit } = search;
    const filter = createMetadataFilter(metadata);
    const results = await store.searchByMetadata({ filter, limit: limit ?? 10 });
    return results.map((result) => ({ markdown: result.text, metadata: result.metadata }));
  };

  // ─── SCHEMA ───────────────────────────────────────────────
  const { addNote, searchNotes, searchNotesByMetadata } = capabilitiesMap;

  return {
    addNote: { fn: addNoteCapability, metadata: addNote },
    searchNotes: { fn: searchNotesCapability, metadata: searchNotes },
    searchNotesByMetadata: { fn: searchNotesByMetadataCapability, metadata: searchNotesByMetadata }
  };
};

export function createNoteAgent (store: Store<NoteMetadata>, config: NoteAgentConfig): NoteAgent {
  const metadataPath = path.join(__dirname, './', 'metadata.json');
  const metadata: AgentMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const toolSet = capabilities(store, metadata);
  const { openAiApiKey: apiKey, openAiModel: model } = config;

  const openAIAgent = new OpenAIAgent({
    tools: Object.values(toolSet)
      .map((c: Operation<(...args: any[]) => Promise<any>>) => {
        return new FunctionTool(c.fn, {
          name: c.metadata.name,
          description: c.metadata.description,
          parameters: c.metadata.parameters
        });
      }),
    verbose: true,
    llm: new OpenAI({ model, apiKey })
  });

  const processQueryFn = async (query: string): Promise<string> => {
    return (await openAIAgent.chat({ message: query })).response;
  };

  const agent = createAgent<NoteMetadata>(metadata, store, processQueryFn);
  return {
    ...agent,
    ...toolSet
  };
}
