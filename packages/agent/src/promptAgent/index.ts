/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  createStoreAwareAgent,
  type AgentMetadata,
  type CapabilitySchema,
  type Store,
  type StoreAwareAgent
} from '@giving-tree/core';

import { FunctionTool, OpenAI, OpenAIAgent } from 'llamaindex';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import grayMatter from 'gray-matter';
import Joi from 'joi';

// ─────────────────────────────────────────────────────────────
// TYPES AND SCHEMAS
// ─────────────────────────────────────────────────────────────

export type PromptId = string;

export interface promptMetadata {
  version: string
  name: string
  tags: string[]
  description: string
}

export const promptMetadataSchema = Joi.object({
  name: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
  version: Joi.string().required(),
  description: Joi.string().required()
});

interface Operation<F extends (...args: any[]) => Promise<any>> {
  fn: F
  metadata: CapabilitySchema
}

type Capability = 'addPrompt' | 'updatePrompt' | 'queryPrompt' | 'deletePrompt' | 'usePrompt';

interface Capabilities {
  addPrompt: Operation<({ markdown }: { markdown: string }) => Promise<string>>
  // usePrompt: Operation<({ prompt, content }: { prompt: string, content: string }) => Promise<string>>
  updatePrompt: Operation<(id: string, prompt: string) => Promise<string>>
  queryPrompt: Operation<({ query }: { query: string }) => Promise<string>>
  deletePrompt: Operation<(id: string) => Promise<string>>
}

export type PromptAgent = StoreAwareAgent & Capabilities;

export interface PromptAgentConfig {
  apiKey: string
  model: string
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

export const capabilities = (store: Store, metadata: AgentMetadata): Capabilities => {
  // ─── UTILITY FUNCTIONS ────────────────────────────────────
  const capabilitiesMap = metadata.capabilities
    .reduce((acc, capability) => {
      return { ...acc, [capability.name]: capability };
    }, {} as Record<Capability, CapabilitySchema>);

  const generateHashId = (content: string): string => {
    return crypto.createHash('sha256').update(content).digest('hex');
  };

  const validatePromptSchema = (data: any): void => {
    const { error } = promptMetadataSchema.validate(data);
    if (error != null) {
      // Custom error handling for prompt validation
      throw new PromptValidationError(`Prompt validation error: ${error.message}`);
    }
  };

  // ─── ADD CAPABILITY ────────────────────────────────────

  const addPromptCapability = async (obj: { markdown: string }): Promise<string> => {
    const { data, content } = grayMatter(obj.markdown);
    const id = generateHashId(obj.markdown);
    const metadata = { id, ...data };
    validatePromptSchema(data);
    await store.insert({ text: content, metadata });
    return id;
  };

  // ─── UPDATE Capability ────────────────────────────────────

  const updatePromptCapability = async (id: string, markdown: string): Promise<string> => {
    const { data: metadata, content } = grayMatter(markdown);

    if (id.length === 0) {
      throw new PromptValidationError('Prompt metadata must include an id');
    }

    validatePromptSchema(metadata);
    await store.update({ text: content, metadata });
    return id;
  };

  // ─── QUERY Capability ────────────────────────────────────

  const queryPromptCapability = async ({ query }: { query: string }): Promise<string> => {
    const result = await store.query(query);
    return 'The following prompts were found: ' + result;
  };

  // ─── DELETE Capability ────────────────────────────────────

  const deletePromptCapability = async (id: string): Promise<string> => {
    await store.remove(id);
    return id;
  };

  // ─── SCHEMA ───────────────────────────────────────────────
  const { addPrompt, updatePrompt, queryPrompt, deletePrompt } = capabilitiesMap;

  return {
    addPrompt: { fn: addPromptCapability, metadata: addPrompt },
    updatePrompt: { fn: updatePromptCapability, metadata: updatePrompt },
    queryPrompt: { fn: queryPromptCapability, metadata: queryPrompt },
    deletePrompt: { fn: deletePromptCapability, metadata: deletePrompt }
  };
};

// Load metadata for the PromptAgent from a JSON file
export function createPromptAgent (store: Store, config: PromptAgentConfig): PromptAgent {
  // Load PromptAgent metadata from JSON file
  const metadataPath = path.join(__dirname, './', 'metadata.json');
  const promptAgentMetadata: AgentMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const toolSet = capabilities(store, promptAgentMetadata);
  const { apiKey, model } = config;

  const agent = new OpenAIAgent({
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
    return (await agent.chat({ message: query })).response;
  };

  // Use createStoreAwareAgent to create and return the PromptAgent
  return {
    ...createStoreAwareAgent(promptAgentMetadata, store, processQueryFn),
    ...toolSet
  };
}
