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

export interface PromptMetadata {
  version: string
  name: string
  tags: string[]
  description: string
}

export const promptMetadataSchema = Joi.object({
  name: Joi.string().required(),
  tags: Joi.array().required(),
  version: Joi.string().required(),
  description: Joi.string().required()
});

interface Operation<F extends (...args: any[]) => Promise<any>> {
  fn: F
  metadata: CapabilitySchema
}

type Capability = 'addPrompt' | 'searchPrompts' | 'searchPromptsByMetadata';

interface Search {
  query: string
  limit?: number
}

interface SearchMetadata {
  metadata: Partial<PromptMetadata>
  limit?: number
}

interface Capabilities {
  addPrompt: Operation<({ markdown }: { markdown: string }) => Promise<number>>
  searchPrompts: Operation<(search: Search) => Promise<string>>
  searchPromptsByMetadata: Operation<(search: SearchMetadata) => Promise<string>>
}

export type PromptAgent = Agent<PromptMetadata> & Capabilities;

export interface PromptAgentConfig {
  openAiApiKey: string
  openAiModel: string
}

// ─────────────────────────────────────────────────────────────
// CUSTOM ERRORS
// ─────────────────────────────────────────────────────────────

class PromptValidationError extends Error {
  constructor (message: string) {
    super(message);
    this.name = 'PromptValidationError';
  }
}

// ─────────────────────────────────────────────────────────────
// A LIST OF CAPABILITIES
// ─────────────────────────────────────────────────────────────

export const capabilities = (store: Store<PromptMetadata>, metadata: AgentMetadata): Capabilities => {
  // ─── UTILITY FUNCTIONS ────────────────────────────────────
  const capabilitiesMap = metadata.capabilities
    .reduce((acc, capability) => {
      return { ...acc, [capability.name]: capability };
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
    }, {} as Record<Capability, CapabilitySchema>);

  const validatePromptSchema = (data: any): void => {
    const { error } = promptMetadataSchema.validate(data);
    if (error != null) {
      // Custom error handling for prompt validation
      throw new PromptValidationError(`Prompt validation error: ${error.message}`);
    }
  };

  // ─── ADD CAPABILITY ────────────────────────────────────

  const addPromptCapability = async (obj: { markdown: string, metadata: PromptMetadata }): Promise<number> => {
    const { markdown, metadata } = obj;
    validatePromptSchema(metadata);
    const result = await store.insert({ text: markdown, metadata: { ...metadata } });
    return result;
  };

  // ─── SEARCH CAPABILITY ────────────────────────────────────

  const searchPromptCapability = async (search: Search): Promise<string> => {
    const { query, limit } = search;
    const results = await store.search({ query, limit: limit ?? 10 });
    return results.length > 0 ? results.map((result) => result.text).join('\n') : 'No results found';
  };

  // ─── SEARCH BY METADATA CAPABILITY ────────────────────────────────────

  const createMetadataFilter = (metadata: Partial<PromptMetadata>): Filter<PromptMetadata> => {
    const filterConditions: Array<SimpleFilter<PromptMetadata>> = [];
    for (const key in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, key)) {
        const value = metadata[key];
        filterConditions.push({ type: 'Match', field: key as keyof PromptMetadata, value });
      }
    }

    return {
      operator: 'AND',
      filters: filterConditions
    };
  };

  const searchPromptsByMetadataCapability = async (search: SearchMetadata): Promise<string> => {
    const { metadata, limit } = search;
    const filter = createMetadataFilter(metadata);
    console.log(filter);
    const results = await store.searchByMetadata({ filter, limit: limit ?? 10 });
    return results.length > 0 ? results.map((result) => result.text).join('\n') : 'No results found';
  };

  // ─── SCHEMA ───────────────────────────────────────────────
  const { addPrompt, searchPrompts, searchPromptsByMetadata } = capabilitiesMap;

  return {
    addPrompt: { fn: addPromptCapability, metadata: addPrompt },
    searchPrompts: { fn: searchPromptCapability, metadata: searchPrompts },
    searchPromptsByMetadata: { fn: searchPromptsByMetadataCapability, metadata: searchPromptsByMetadata }
  };
};

// Load metadata for the PromptAgent from a JSON file
export function createPromptAgent (store: Store<PromptMetadata>, config: PromptAgentConfig): PromptAgent {
  // Load PromptAgent metadata from JSON file
  const metadataPath = path.join(__dirname, './', 'metadata.json');
  const promptAgentMetadata: AgentMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const toolSet = capabilities(store, promptAgentMetadata);
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

  // Define the processQuery function specific to the PromptAgent
  const processQueryFn = async (query: string): Promise<string> => {
    return (await openAIAgent.chat({ message: query })).response;
  };

  // Use createStoreAwareAgent to create and return the PromptAgent
  const agent = createAgent<PromptMetadata>(promptAgentMetadata, store, processQueryFn);
  return {
    ...agent,
    ...toolSet
  };
}
